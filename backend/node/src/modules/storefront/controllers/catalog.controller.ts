import { Request, Response } from 'express'
import { Op, Sequelize } from 'sequelize'
import {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  VariantImage,
  Banner,
  AnnouncementMessage,
  MarqueeMessage,
  ArtWaveItem,
} from '../../../models/index.js'
import { plain, mapCategory, mapProduct } from './helpers.js'
import { getShippingConfig, getGuestDiscountPopupConfig, getHomeNewArrivalsConfig } from '../../../services/settings.service.js'

export const getCategories = async (req: Request, res: Response) => {
  const section = typeof req.query.section === 'string' ? req.query.section : undefined
  const categories = await Category.findAll({
    where: {
      active: true,
      ...(section ? { section } : {}),
    },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  })

  res.json({ categories: categories.map(mapCategory) })
}

export const getCategoryBySlug = async (req: Request, res: Response) => {
  const category = await Category.findOne({
    where: { slug: req.params.slug, active: true },
  })
  if (!category) return res.status(404).json({ message: 'Category not found' })
  res.json({ category: mapCategory(category) })
}

export const getBanners = async (req: Request, res: Response) => {
  const placement = typeof req.query.placement === 'string' ? req.query.placement : undefined
  const banners = await Banner.findAll({
    where: {
      active: true,
      ...(placement ? { placement } : {}),
    },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  })

  res.json({ banners: banners.map(row => plain(row)) })
}

export const getArtWave = async (_req: Request, res: Response) => {
  const items = await ArtWaveItem.findAll({
    where: { active: true },
    attributes: ['id', 'title', 'subtitle', 'description', 'imageUrl', 'videoUrl', 'mediaType', 'sortOrder'],
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  })

  res.json({ items: items.map(row => plain(row)) })
}

export const getProducts = async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : ''
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined
  const section = typeof req.query.section === 'string' ? req.query.section.trim() : undefined
  const gender = typeof req.query.gender === 'string' ? req.query.gender.trim() : undefined
  // ids filter for guest wishlist preview (comma-separated product IDs)
  const idsParam = typeof req.query.ids === 'string' ? req.query.ids.trim() : ''
  const filterIds = idsParam
    ? idsParam.split(',').map(Number).filter(n => Number.isFinite(n) && n > 0)
    : undefined

  // Resolve section filter to category IDs
  let sectionCategoryIds: number[] | undefined
  if (section) {
    const sectionCats = await Category.findAll({
      where: { section, active: true },
      attributes: ['id'],
      raw: true,
    }) as any[]
    sectionCategoryIds = sectionCats.map(c => c.id)
  }

  // When filtering by a category, include all descendant categories (any depth)
  let categoryIds: number[] | undefined
  if (categoryId) {
    const allCats = await Category.findAll({
      where: { active: true },
      attributes: ['id', 'parentId'],
      raw: true,
    }) as unknown as { id: number; parentId: number | null }[]
    const byParent = new Map<number, number[]>()
    for (const c of allCats) {
      if (c.parentId) {
        const list = byParent.get(c.parentId) || []
        list.push(c.id)
        byParent.set(c.parentId, list)
      }
    }
    const descendantIds: number[] = []
    const stack = [...(byParent.get(categoryId) || [])]
    while (stack.length) {
      const id = stack.pop()!
      descendantIds.push(id)
      stack.push(...(byParent.get(id) || []))
    }
    categoryIds = [categoryId, ...descendantIds]
  }

  const products = await Product.findAll({
    where: {
      status: 'active',
      ...(filterIds ? { id: { [Op.in]: filterIds } } : {}),
      ...(!filterIds && gender ? { gender } : {}),
      ...(!filterIds && categoryIds ? { categoryId: { [Op.in]: categoryIds } } : {}),
      ...(!filterIds && !categoryIds && category ? { category } : {}),
      ...(!filterIds && sectionCategoryIds ? { categoryId: { [Op.in]: sectionCategoryIds } } : {}),
      ...(!filterIds && search
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { code: { [Op.like]: `%${search}%` } },
              { type: { [Op.like]: `%${search}%` } },
            ],
          }
        : {}),
    },
    attributes: {
      include: [[
        Sequelize.literal(`(
          SELECT ROUND(AVG(rating), 1)
          FROM reviews
          WHERE reviews.product_id = Product.id
        )`),
        'averageRating'
      ]]
    },
    include: [{
      model: ProductVariant,
      as: 'variants',
      attributes: ['id', 'price', 'originalPrice', 'isDefault', 'stockQty', 'size', 'colorName', 'colorHex', 'imageUrl'],
      required: false,
    }],
    order: [['sortOrder', 'ASC'], ['id', 'DESC']],
    limit: 80,
  })

  res.json({ products: products.map(mapProduct) })
}

export const getProductBySlug = async (req: Request, res: Response) => {
  const slug = String(req.params.slug || '').trim()
  const includes = [
    {
      model: ProductImage,
      as: 'images',
      attributes: ['id', 'imageUrl', 'altText', 'sortOrder'],
    },
    {
      model: ProductVariant,
      as: 'variants',
      where: { status: 'active' },
      required: false,
      attributes: ['id', 'variantType', 'label', 'colorName', 'colorHex', 'size',
                   'sku', 'price', 'originalPrice', 'stockQty',
                   'imageUrl', 'isDefault', 'sortOrder'],
      include: [{
        model: VariantImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'altText', 'sortOrder'],
      }],
    },
  ]
  const orderArray: any[] = [
    [{ model: ProductImage, as: 'images' }, 'sortOrder', 'ASC'],
    [{ model: ProductVariant, as: 'variants' }, 'sortOrder', 'ASC'],
    [{ model: ProductVariant, as: 'variants' }, { model: VariantImage, as: 'images' }, 'sortOrder', 'ASC'],
  ]

  let product = await Product.findOne({ 
    where: { slug, status: 'active' },
    include: includes,
    order: orderArray,
  })

  // Fallback 1: Partial slug prefix match (e.g. traditional-bridal-kanchipuram -> traditional-bridal-kanchipuram-saree)
  if (!product && slug) {
    product = await Product.findOne({
      where: {
        status: 'active',
        [Op.or]: [
          { slug: { [Op.like]: `${slug}%` } },
          { slug: { [Op.like]: `%${slug}%` } },
          { name: { [Op.like]: `%${slug.replace(/-/g, ' ')}%` } },
        ],
      },
      include: includes,
      order: orderArray,
    })
  }

  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json({ product: mapProduct(product) })
}

export const getRelatedProducts = async (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  if (!productId) return res.status(400).json({ message: 'Invalid product ID' })

  const product = await Product.findByPk(productId, { attributes: ['categoryId'], raw: true }) as { categoryId: number | null } | null
  if (!product) return res.status(404).json({ message: 'Product not found' })
  if (product.categoryId == null) return res.json({ products: [] })

  const products = await Product.findAll({
    where: {
      status: 'active',
      categoryId: product.categoryId,
      id: { [Op.ne]: productId },
    },
    attributes: {
      include: [[
        Sequelize.literal(`(
          SELECT ROUND(AVG(rating), 1)
          FROM reviews
          WHERE reviews.product_id = Product.id
        )`),
        'averageRating'
      ]]
    },
    include: [{
      model: ProductVariant,
      as: 'variants',
      attributes: ['id', 'price', 'originalPrice', 'isDefault', 'stockQty', 'size', 'colorName', 'colorHex', 'imageUrl'],
      required: false,
    }],
    order: [['sortOrder', 'ASC'], ['id', 'DESC']],
    limit: 8,
  })

  res.json({ products: products.map(mapProduct) })
}

export const search = async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  const productWhere: any = { status: 'active' }
  if (q) {
    productWhere[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { code: { [Op.like]: `%${q}%` } },
      { type: { [Op.like]: `%${q}%` } },
      { color: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ]
  }

  const categoryWhere: any = { active: true }
  if (q) categoryWhere.name = { [Op.like]: `%${q}%` }

  const [products, categories] = await Promise.all([
    Product.findAll({
      where: productWhere,
      order: [['sortOrder', 'ASC']],
      limit: 12,
      include: [{ model: ProductVariant, as: 'variants', attributes: ['id', 'price', 'originalPrice', 'isDefault', 'stockQty', 'imageUrl', 'size'], required: false }],
    }),
    Category.findAll({ where: categoryWhere, order: [['sortOrder', 'ASC']], limit: 8 }),
  ])

  res.json({ products: products.map(mapProduct), categories: categories.map(mapCategory) })
}

export const getHome = async (_req: Request, res: Response) => {
  const homeConfig = await getHomeNewArrivalsConfig()

  const [
    announcements,
    banners,
    sectionCategories,
    allChildren,
    products,
    marqueeMessages,
  ] = await Promise.all([
    AnnouncementMessage.findAll({ where: { active: true }, order: [['sortOrder', 'ASC']] }),
    Banner.findAll({ where: { active: true }, order: [['sortOrder', 'ASC']] }),
    Category.findAll({ where: { active: true, parentId: null }, order: [['sortOrder', 'ASC']] }),
    Category.findAll({ where: { active: true, parentId: { [Op.ne]: null } }, order: [['sortOrder', 'ASC']] }),
    Product.findAll({
      where: { status: 'active', isNew: true },
      attributes: {
        include: [[
          Sequelize.literal(`(
            SELECT ROUND(AVG(rating), 1)
            FROM reviews
            WHERE reviews.product_id = Product.id
          )`),
          'averageRating'
        ]]
      },
      order: [['sortOrder', 'ASC'], ['id', 'DESC']],
      limit: homeConfig.limit,
      include: [{ model: ProductVariant, as: 'variants', attributes: ['id', 'price', 'originalPrice', 'isDefault', 'stockQty', 'size', 'colorName', 'colorHex', 'imageUrl'], required: false }],
    }),
    MarqueeMessage.findAll({ where: { active: true }, order: [['sortOrder', 'ASC']] }),
  ])

  const parentSectionMap: Record<number, string> = {}
  for (const p of sectionCategories) {
    const row = plain<any>(p)
    if (row.id) parentSectionMap[row.id] = row.section || ''
  }

  const mappedChildren = allChildren.map(mapCategory)
  const collectionsForCategories = mappedChildren.filter(c => parentSectionMap[c.parentId] === 'collections-for')
  const shopByCategories = mappedChildren.filter(c => parentSectionMap[c.parentId] === 'shop-by')
  const browseAllCategories = mappedChildren.filter(c => parentSectionMap[c.parentId] === 'browse-all')

  res.json({
    announcementMessages: announcements.map(row => plain(row)),
    banners: banners.map(row => plain(row)),
    sectionCategories: sectionCategories.map(mapCategory),
    featuredCategories: collectionsForCategories,
    womensCategories: shopByCategories,
    kidsCategories: [],
    fabricCategories: browseAllCategories,
    newArrivals: products.map(mapProduct),
    newArrivalsEnabled: homeConfig.enabled,
    newArrivalsLimit: homeConfig.limit,
    marqueeMessages: marqueeMessages.map(row => plain(row)),
  })
}

export const getShippingConfiguration = async (_req: Request, res: Response) => {
  const config = await getShippingConfig()
  res.json(config)
}

export const getGuestDiscountPopupConfiguration = async (_req: Request, res: Response) => {
  const config = await getGuestDiscountPopupConfig()
  // couponCode is intentionally omitted — it must not be visible before the guest registers.
  res.json({
    enabled: config.enabled,
    discountPercentage: config.discountPercentage,
    message: config.message,
  })
}
