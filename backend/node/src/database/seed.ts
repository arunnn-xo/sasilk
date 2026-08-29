import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { ensureDatabaseExists, sequelize } from './sequelize.js'
import { Admin, AnnouncementMessage, MarqueeMessage, Banner, Category, Product, ProductVariant, Setting } from '../models/index.js'
import { slugify } from '../utils/slug.js'
import {
  defaultAnnouncementMessages,
  defaultMarqueeMessages,
  defaultBanners,
  headerNavMenu,
} from './initial-data.js'

const TRUNCATE_TABLES = [
  'variant_images',
  'product_variants',
  'product_images',
  'reviews',
  'review_images',
  'cart_items',
  'wishlist_items',
  'stock_notifications',
  'price_drop_email_logs',
  'price_drop_events',
  'products',
  'categories',
]

async function resetCatalogTables() {
  const [rows] = await sequelize.query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE()"
  ) as [Array<{ TABLE_NAME: string }>, unknown]
  const existing = new Set(rows.map(r => r.TABLE_NAME))
  const tables = TRUNCATE_TABLES.filter(t => existing.has(t))

  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  try {
    for (const table of tables) {
      try {
        await sequelize.query(`TRUNCATE TABLE \`${table}\``)
      } catch {
        await sequelize.query(`DELETE FROM \`${table}\``)
      }
    }
  } finally {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
  }
}

function hrefToSlug(href: string) {
  const parts = href.split('/').filter(Boolean)
  return parts[parts.length - 1] || slugify(href)
}

function uniqueSlug(base: string, used: Set<string>) {
  let slug = base
  let n = 2
  while (used.has(slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  used.add(slug)
  return slug
}

interface PendingProduct {
  name: string
  isHot?: boolean
  subCategorySlug: string
}

async function seed() {
  await ensureDatabaseExists()
  await sequelize.authenticate()

  await resetCatalogTables()

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12)
  await Admin.findOrCreate({
    where: { email: env.ADMIN_EMAIL },
    defaults: {
      name: 'Threads Admin',
      email: env.ADMIN_EMAIL,
      passwordHash,
      role: 'super_admin',
      status: 'active',
    },
  })

  for (const [index, text] of defaultAnnouncementMessages.entries()) {
    await AnnouncementMessage.findOrCreate({
      where: { text },
      defaults: { text, sortOrder: index, active: true },
    })
  }

  for (const [index, text] of defaultMarqueeMessages.entries()) {
    await MarqueeMessage.findOrCreate({
      where: { text },
      defaults: { text, sortOrder: index, active: true },
    })
  }

  // ── Categories: header nav menu → DB tree (L1 parent / L2 child) ──
  const usedCategorySlugs = new Set<string>()
  const categoryIdBySlug = new Map<string, number>()
  const pendingProducts: PendingProduct[] = []
  let categorySort = 0
  let productSort = 0

  for (const [l1Index, item] of headerNavMenu.entries()) {
    const l1Slug = uniqueSlug(hrefToSlug(item.href), usedCategorySlugs)
    const l1 = await Category.create({
      section: l1Slug,
      name: item.name,
      slug: l1Slug,
      href: item.href,
      imageUrl: null,
      tag: item.isSale ? 'Sale' : undefined,
      navVisible: true,
      homeVisible: false,
      headerHighlight: l1Index === 0,
      sortOrder: categorySort++,
      active: true,
    })
    categoryIdBySlug.set(l1Slug, (l1 as any).get('id') as number)

    for (const sub of item.subCategories ?? []) {
      const subSlug = uniqueSlug(hrefToSlug(sub.href), usedCategorySlugs)
      const subCat = await Category.create({
        section: l1Slug,
        name: sub.name,
        slug: subSlug,
        href: sub.href,
        imageUrl: null,
        tag: undefined,
        navVisible: true,
        homeVisible: true,
        parentId: (l1 as any).get('id') as number,
        sortOrder: categorySort++,
        active: true,
      })
      categoryIdBySlug.set(subSlug, (subCat as any).get('id') as number)

      for (const product of sub.products ?? []) {
        pendingProducts.push({ ...product, subCategorySlug: subSlug })
      }
    }
  }

  // ── Products: sub-category product names → placeholder products ──
  const usedProductSlugs = new Set<string>()
  for (const [index, pending] of pendingProducts.entries()) {
    const slug = uniqueSlug(slugify(pending.name), usedProductSlugs)
    const categoryId = categoryIdBySlug.get(pending.subCategorySlug) ?? null
    const code = `SAS-HDR-${String(index + 1).padStart(4, '0')}`
    const product = await Product.create({
      code,
      name: pending.name,
      slug,
      type: pending.subCategorySlug.replace(/-/g, ' ').toUpperCase(),
      price: 999.00,
      originalPrice: null,
      stockQty: 12,
      category: null,
      categoryId,
      imageUrl: null,
      tag: pending.isHot ? 'Hot' : undefined,
      featured: !!pending.isHot,
      isNew: false,
      hasVariants: false,
      status: 'active',
      gstRate: 5.00,
      sortOrder: productSort++,
    })
    const productId = (product as any).get('id') as number

    await ProductVariant.create({
      productId,
      variantType: 'color',
      label: 'Default',
      price: 999.00,
      stockQty: 12,
      isDefault: true,
      status: 'active',
      sortOrder: 0,
    })
    await Product.update({ hasVariants: true }, { where: { id: productId } })
  }

  for (const [index, banner] of defaultBanners.entries()) {
    await Banner.findOrCreate({
      where: { placement: banner.placement, title: banner.title },
      defaults: { ...banner, sortOrder: index, active: true },
    })
  }

  await Setting.findOrCreate({
    where: { key: 'storefront_stats' },
    defaults: {
      key: 'storefront_stats',
      value: {
        instagramFamily: '300K+',
        artisansNetwork: '2Lakh',
        sustainableArt: '120%',
      },
    },
  })

  await Setting.findOrCreate({
    where: { key: 'home_new_arrivals_config' },
    defaults: {
      key: 'home_new_arrivals_config',
      value: {
        enabled: true,
        limit: 4,
      },
    },
  })

  await Setting.findOrCreate({
    where: { key: 'company_info' },
    defaults: {
      key: 'company_info',
      value: {
        name: 'Threads of TN',
        address: '123, Rangapuri Street, Kanchipuram',
        city: 'Tamil Nadu — 631501',
        gstin: '33ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        phone: '+91 8822664432',
        email: 'hello@threadsoftn.com',
        invoicePrefix: 'INV',
        logoUrl: '/uploads/threads-of-tn-logo.png',
      },
    },
  })

  console.log(`Seed complete. Categories: ${categoryIdBySlug.size}, Products: ${pendingProducts.length}. Local admin: ${env.ADMIN_EMAIL}`)
  await sequelize.close()
}

seed().catch(error => {
  console.error(error)
  process.exit(1)
})
