import { Request, Response } from 'express'
import path from 'node:path'
import { z } from 'zod'
import { AppError } from '../../../utils/http.js'
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../../../services/cloudinary.service.js'

export const UPLOADS_DIR = path.resolve('uploads')

const uploadsParam = z.object({ filename: z.string().min(1) })

export const uploadFile = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(422, 'File is required.')

  const result = await uploadBufferToCloudinary(req.file.buffer, 'sasilk/images')

  res.status(201).json({
    file: {
      filename: result.public_id,
      originalName: req.file.originalname,
      path: result.secure_url,
      dimensions: { width: result.width, height: result.height },
    },
  })
}

export const deleteUploadedFile = async (req: Request, res: Response) => {
  const { filename } = uploadsParam.parse(req.params)
  try {
    await deleteFromCloudinary(filename)
  } catch {
    // ignore — file may not exist on Cloudinary
  }
  res.json({ ok: true })
}

export const uploadVideoFile = async (req: Request, res: Response) => {
  if (!req.file) throw new AppError(422, 'Video file is required.')

  const result = await uploadBufferToCloudinary(req.file.buffer, 'sasilk/videos')

  res.status(201).json({
    file: {
      filename: result.public_id,
      originalName: req.file.originalname,
      path: result.secure_url,
    },
  })
}
