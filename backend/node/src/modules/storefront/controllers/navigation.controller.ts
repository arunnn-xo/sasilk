import { Request, Response } from 'express'
import {
  AnnouncementMessage,
  MarqueeMessage,
  Category,
  Product,
  Setting,
} from '../../../models/index.js'
import { plain, decodeJsonValue } from './helpers.js'

export const getNavMenu = async (_req: Request, res: Response) => {
  const allCategories = await Category.findAll({
    where: { active: true },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    raw: true,
  }) as any[]

  const topLevel = allCategories.filter((c: any) => !c.parentId && c.navVisible)

  if (topLevel.length === 0) {
    return res.json({ navigation: [] })
  }

  const byParent = new Map<number | null, any[]>()
  for (const c of allCategories) {
    const key = c.parentId
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(c)
  }

  const allProducts = await Product.findAll({
    where: { status: 'active' },
    attributes: ['id', 'name', 'categoryId', 'imageUrl'],
    raw: true,
  }) as any[]

  const productsByCategory = new Map<number, any[]>()
  for (const p of allProducts) {
    if (p.categoryId) {
      const list = productsByCategory.get(p.categoryId) || []
      list.push(p)
      productsByCategory.set(p.categoryId, list)
    }
  }

  const buildNode = (cat: any): any => {
    const linkedProducts = productsByCategory.get(cat.id) || []
    const seen = new Set<string>()
    const items: { name: string; imageUrl?: string }[] = []
    for (const p of linkedProducts) {
      if (!seen.has(p.name)) {
        seen.add(p.name)
        items.push({ name: p.name, imageUrl: p.imageUrl })
      }
    }
    const children = (byParent.get(cat.id) || []).map(buildNode)
    return {
      name: cat.name,
      href: cat.href,
      imageUrl: cat.imageUrl || null,
      isHighlighted: !!cat.headerHighlight,
      products: items,
      ...(children.length > 0 ? { subCategories: children } : {}),
    }
  }

  const navigation = topLevel.map((cat: any) => {
    const children = (byParent.get(cat.id) || []).map(buildNode)
    return {
      label: cat.name,
      href: cat.href,
      imageUrl: cat.imageUrl || null,
      isSale: cat.tag === 'Sale',
      isHighlighted: !!cat.headerHighlight,
      ...(children.length > 0 ? { subCategories: children } : {}),
    }
  })

  res.json({ navigation })
}

export const getAnnouncementBar = async (_req: Request, res: Response) => {
  const messages = await AnnouncementMessage.findAll({
    where: { active: true },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  })

  res.json({
    messages: messages.map(row => plain<any>(row)),
  })
}

export const getMarqueeMessages = async (_req: Request, res: Response) => {
  const messages = await MarqueeMessage.findAll({
    where: { active: true },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  })

  res.json({
    messages: messages.map(row => plain<any>(row)),
  })
}

export const getNavigation = async (_req: Request, res: Response) => {
  const setting = await Setting.findOne({ where: { key: 'navigation_menu' } })
  const rawValue = setting ? plain<any>(setting).value : []
  const value = decodeJsonValue(rawValue, [])
  res.json({ navigation: value })
}
