import { Request, Response } from 'express'
import { execFile } from 'node:child_process'
import fs from 'node:fs/promises'
import { promisify } from 'node:util'
import ffprobe from 'ffprobe-static'
import { z } from 'zod'
import {
  Product,
  Review,
  Customer,
  ReviewImage,
  Order,
  OrderItem,
} from '../../../models/index.js'
import { sequelize } from '../../../database/sequelize.js'
import { AppError } from '../../../utils/http.js'
import { plain } from './helpers.js'

const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  subject: z.string().max(255).optional().default(''),
  body: z.string().max(5000).optional().default(''),
})

const execFileAsync = promisify(execFile)
const MAX_REVIEW_MEDIA_FILES = 5
const MAX_REVIEW_VIDEO_SECONDS = 10
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const REVIEW_MEDIA_ATTRIBUTES = ['id', 'imageUrl', 'mediaType', 'durationSeconds']

type ReviewMediaRecord = {
  imageUrl: string
  mediaType: 'image' | 'video'
  durationSeconds: number | null
}

function mediaTypeFromUrl(url: string): 'image' | 'video' {
  return /\.(mp4|webm|mov|m4v)$/i.test(url) ? 'video' : 'image'
}

function mediaTypeFromMime(mimetype: string): 'image' | 'video' {
  if (IMAGE_MIME_TYPES.has(mimetype)) return 'image'
  if (VIDEO_MIME_TYPES.has(mimetype)) return 'video'
  throw new AppError(422, 'Only JPEG, PNG, WebP, MP4, WebM, or MOV review media is allowed')
}

async function cleanupUploadedReviewFiles(files: Express.Multer.File[] | undefined) {
  if (!files?.length) return
  await Promise.all(files.map(file => fs.unlink(file.path).catch(() => undefined)))
}

async function readVideoDurationSeconds(filePath: string) {
  let stdout = ''
  try {
    const result = await execFileAsync(ffprobe.path, [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
      filePath,
    ])
    stdout = result.stdout
  } catch {
    throw new AppError(422, 'Could not read review video duration')
  }
  const duration = Number.parseFloat(stdout.trim())
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new AppError(422, 'Could not read review video duration')
  }
  return duration
}

async function validateUploadedReviewMedia(files: Express.Multer.File[] | undefined): Promise<ReviewMediaRecord[]> {
  if (!files?.length) return []
  if (files.length > MAX_REVIEW_MEDIA_FILES) {
    throw new AppError(422, `You can upload up to ${MAX_REVIEW_MEDIA_FILES} review media files`)
  }

  const media: ReviewMediaRecord[] = []
  for (const file of files) {
    const mediaType = mediaTypeFromMime(file.mimetype)
    let durationSeconds: number | null = null
    if (mediaType === 'video') {
      durationSeconds = await readVideoDurationSeconds(file.path)
      if (durationSeconds > MAX_REVIEW_VIDEO_SECONDS) {
        throw new AppError(422, `Review videos must be ${MAX_REVIEW_VIDEO_SECONDS} seconds or shorter`)
      }
    }
    media.push({
      imageUrl: `/uploads/${file.filename}`,
      mediaType,
      durationSeconds,
    })
  }
  return media
}

function serializeReviewMedia(media: any) {
  const mediaType = media.mediaType || media.media_type || mediaTypeFromUrl(media.imageUrl || '')
  return {
    ...media,
    mediaType,
    durationSeconds: media.durationSeconds ?? media.duration_seconds ?? null,
  }
}

export const getProductReviews = async (req: Request, res: Response) => {
  const product = await Product.findOne({ where: { slug: req.params.slug } })
  if (!product) throw new AppError(404, 'Product not found')

  const page = Math.max(1, parseInt(String(req.query.page)) || 1)
  const perPage = Math.min(20, Math.max(1, parseInt(String(req.query.perPage)) || 10))

  const productId = product.get('id') as number
  const { rows, count } = await Review.findAndCountAll({
    where: { productId, status: 'approved' },
    include: [
      { model: Customer, attributes: ['name'] },
      { model: ReviewImage, as: 'images', attributes: REVIEW_MEDIA_ATTRIBUTES },
    ],
    order: [['createdAt', 'DESC']],
    offset: (page - 1) * perPage,
    limit: perPage,
  })

  const reviews = rows.map(r => {
    const plainReview = r.get({ plain: true }) as any
    const customerName = plainReview.Customer?.name || 'Anonymous'
    const nameParts = customerName.split(' ')
    const displayName = nameParts[0] + (nameParts.length > 1 ? ' ' + nameParts[1][0] + '.' : '')
    return {
      id: plainReview.id,
      rating: plainReview.rating,
      subject: plainReview.subject,
      body: plainReview.body,
      customerName: displayName,
      createdAt: plainReview.createdAt,
      images: (plainReview.images || []).map(serializeReviewMedia),
    }
  })

  const summary = await Review.findAll({
    where: { productId, status: 'approved' },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
      [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 'average'],
    ],
    raw: true,
  }) as any[]

  let totalReviews = 0
  let averageRating = 0
  if (summary[0]) {
    totalReviews = Number(summary[0].total) || 0
    averageRating = Number(summary[0].average) || 0
  }

  const distribution = await Review.findAll({
    where: { productId, status: 'approved' },
    attributes: ['rating', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
    group: ['rating'],
    raw: true,
  }) as any[]

  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  for (const d of distribution) {
    dist[Number(d.rating)] = Number(d.count)
  }

  res.json({
    reviews,
    summary: { total: totalReviews, average: averageRating, distribution: dist },
    page,
    perPage,
    totalPages: Math.ceil(totalReviews / perPage),
  })
}

export const canReviewProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId)
  const auth = (req as any).auth

  const product = await Product.findByPk(productId)
  if (!product) throw new AppError(404, 'Product not found')

  const existingReview = await Review.findOne({ where: { productId, customerId: auth.sub } })

  const purchasedOrder = await Order.findOne({
    where: { customerId: auth.sub, status: 'delivered' },
    include: [{ model: OrderItem, as: 'items', where: { productId }, required: true }],
  })

  res.json({
    canReview: !existingReview && !!purchasedOrder,
    hasReviewed: !!existingReview,
    hasDeliveredOrder: !!purchasedOrder,
    existingReviewId: existingReview?.get('id') || null,
  })
}

export const createProductReview = async (req: Request, res: Response) => {
  const productId = Number(req.params.productId)
  const auth = (req as any).auth
  const files = (req as any).files as Express.Multer.File[] | undefined
  let cleanupFilesOnFailure = true

  try {
    const parsed = createReviewSchema.parse(req.body)
    const media = await validateUploadedReviewMedia(files)

    const product = await Product.findByPk(productId)
    if (!product) throw new AppError(404, 'Product not found')

    const existing = await Review.findOne({ where: { productId, customerId: auth.sub } })
    if (existing) throw new AppError(409, 'You have already reviewed this product')

    const purchasedOrder = await Order.findOne({
      where: { customerId: auth.sub, status: 'delivered' },
      include: [{ model: OrderItem, as: 'items', where: { productId }, required: true }],
    })
    if (!purchasedOrder) throw new AppError(403, 'You can only review products you have purchased and received')

    const reviewId = await sequelize.transaction(async transaction => {
      const review = await Review.create({
        productId,
        customerId: auth.sub,
        rating: parsed.rating,
        subject: parsed.subject || null,
        body: parsed.body || null,
        status: 'pending',
      }, { transaction })

      if (media.length > 0) {
        await ReviewImage.bulkCreate(
          media.map(item => ({
            reviewId: review.get('id') as number,
            imageUrl: item.imageUrl,
            mediaType: item.mediaType,
            durationSeconds: item.durationSeconds,
          })),
          { transaction }
        )
      }

      return review.get('id') as number
    })

    cleanupFilesOnFailure = false

    const created = await Review.findByPk(reviewId, {
      include: [{ model: ReviewImage, as: 'images', attributes: REVIEW_MEDIA_ATTRIBUTES }],
    })

    const createdPlain = created!.get({ plain: true }) as any
    res.status(201).json({
      review: {
        ...createdPlain,
        images: (createdPlain.images || []).map(serializeReviewMedia),
      },
    })
  } catch (error) {
    if (cleanupFilesOnFailure) {
      await cleanupUploadedReviewFiles(files)
    }
    throw error
  }
}
