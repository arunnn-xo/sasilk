export function plain<T = Record<string, unknown>>(row: unknown): T {
  return (row as { get: (options: { plain: boolean }) => T }).get({ plain: true })
}

export function decodeJsonValue<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return (value ?? fallback) as T
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function mapCategory(row: unknown) {
  const item = plain<any>(row)
  return {
    id: item.id,
    parentId: item.parentId,
    name: item.name,
    label: item.name,
    href: item.href,
    image: item.imageUrl,
    imageUrl: item.imageUrl,
    tag: item.tag,
    section: item.section,
    sortOrder: item.sortOrder,
    navVisible: item.navVisible,
    homeVisible: item.homeVisible,
    active: item.active,
    metadata: item.metadata,
  }
}

export function mapProduct(row: unknown) {
  const item = plain<any>(row)
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    slug: item.slug,
    type: item.type,
    description: item.description,
    category: item.category,
    categoryId: item.categoryId ?? null,
    price: (() => {
      if (item.hasVariants && item.variants?.length) {
        const v = item.variants.find((v: any) => v.isDefault) ?? item.variants[0]
        return Number(v.price ?? item.price)
      }
      return Number(item.price)
    })(),
    originalPrice: (() => {
      if (item.hasVariants && item.variants?.length) {
        const v = item.variants.find((v: any) => v.isDefault) ?? item.variants[0]
        return v.originalPrice == null ? null : Number(v.originalPrice)
      }
      return item.originalPrice == null ? null : Number(item.originalPrice)
    })(),
    stockQty: item.stockQty,
    enableBackInStockNotify: item.enableBackInStockNotify,
    image: item.imageUrl,
    imageUrl: item.imageUrl,
    color: item.color,
    gender: item.gender,
    ageGroup: item.ageGroup,
    hasVariants: item.hasVariants,
    status: item.status,
    featured: item.featured,
    isNew: item.isNew,
    isBestSeller: item.isBestSeller,
    sortOrder: item.sortOrder,
    gstRate: item.gstRate == null ? null : Number(item.gstRate),
    weightKg: item.weightKg == null ? null : Number(item.weightKg),
    metadata: item.metadata || null,
    averageRating: item.averageRating ?? undefined,
    images: item.images || [],
    variants: item.variants ? item.variants.map((v: any) => ({
      ...v,
      images: v.images || []
    })) : [],
  }
}
