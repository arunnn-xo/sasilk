import { sequelize } from '../src/database/sequelize.js'
import { Product, ProductVariant, ProductImage, VariantImage, Category, initAssociations } from '../src/models/index.js'

initAssociations()

const PRODUCTS_DATA = [
  {
    code: 'SG-KPS-001',
    name: 'Kanchipuram Pure Zari Bridal Silk Saree',
    slug: 'kanchipuram-pure-zari-bridal-silk-saree',
    type: 'Kanchipuram Silk',
    categoryName: 'Silk',
    price: 18500.00,
    originalPrice: 24000.00,
    imageUrl: '/saree1.png',
    tag: 'Bestseller',
    gender: 'women',
    weightKg: 0.850,
    lengthCm: 630.00,
    breadthCm: 115.00,
    heightCm: 4.00,
    gstRate: 5.00,
    featured: true,
    isNew: true,
    isBestSeller: true,
    description:
      'Exquisite handwoven Kanchipuram bridal silk saree with authentic Korvai weaving technique and pure gold zari borders. Features traditional temple gopuram motifs along the pallu and body, woven with heavy mulberry silk threads for timeless wedding elegance.',
    metadata: {
      fabric: '100% Pure Mulberry Silk',
      weave: 'Handloom Korvai Technique',
      zari: 'Pure Gold & Silver Zari',
      occasion: 'Bridal / Wedding / Muhurtham',
      blouseIncluded: true,
      blouseLength: '0.80 meters unstitched',
      sareeLength: '5.5 meters',
      washCare: 'Dry clean only. Store wrapped in pure cotton cloth away from moisture.',
    },
    images: [
      { imageUrl: '/saree1.png', altText: 'Kanchipuram Bridal Silk Saree - Front Pallu View' },
      { imageUrl: '/saree2.png', altText: 'Kanchipuram Bridal Silk Saree - Border Detail' },
      { imageUrl: '/saree3.png', altText: 'Kanchipuram Bridal Silk Saree - Body Weave' },
      { imageUrl: '/saree4.png', altText: 'Kanchipuram Bridal Silk Saree - Draped View' },
    ],
    variants: [
      {
        variantType: 'color',
        label: 'Crimson Bridal Red & Antique Gold',
        colorName: 'Bridal Red',
        colorHex: '#8B0000',
        size: 'Free Size',
        sku: 'SG-KPS-001-RED',
        price: 18500.00,
        originalPrice: 24000.00,
        stockQty: 12,
        lowStockThreshold: 3,
        imageUrl: '/saree1.png',
        isDefault: true,
        sortOrder: 0,
      },
      {
        variantType: 'color',
        label: 'Royal Sapphire Blue & Gold Zari',
        colorName: 'Sapphire Blue',
        colorHex: '#0F2C59',
        size: 'Free Size',
        sku: 'SG-KPS-001-BLU',
        price: 18500.00,
        originalPrice: 24000.00,
        stockQty: 10,
        lowStockThreshold: 3,
        imageUrl: '/saree2.png',
        isDefault: false,
        sortOrder: 1,
      },
      {
        variantType: 'color',
        label: 'Emerald Green & Copper Zari',
        colorName: 'Emerald Green',
        colorHex: '#0E4731',
        size: 'Free Size',
        sku: 'SG-KPS-001-GRN',
        price: 19200.00,
        originalPrice: 25000.00,
        stockQty: 8,
        lowStockThreshold: 2,
        imageUrl: '/saree3.png',
        isDefault: false,
        sortOrder: 2,
      },
      {
        variantType: 'color',
        label: 'Mustard Haldi Yellow & Temple Maroon',
        colorName: 'Haldi Mustard',
        colorHex: '#D49B00',
        size: 'Free Size',
        sku: 'SG-KPS-001-YLW',
        price: 18500.00,
        originalPrice: 24000.00,
        stockQty: 10,
        lowStockThreshold: 3,
        imageUrl: '/saree4.png',
        isDefault: false,
        sortOrder: 3,
      },
    ],
  },
  {
    code: 'SG-BKS-002',
    name: 'Banarasi Handloom Katan Silk Saree',
    slug: 'banarasi-handloom-katan-silk-saree',
    type: 'Banarasi Silk',
    categoryName: 'Silk',
    price: 14200.00,
    originalPrice: 18500.00,
    imageUrl: '/saree2.png',
    tag: 'Festive',
    gender: 'women',
    weightKg: 0.780,
    lengthCm: 630.00,
    breadthCm: 114.00,
    heightCm: 3.50,
    gstRate: 5.00,
    featured: true,
    isNew: true,
    isBestSeller: false,
    description:
      'Masterpiece Banarasi Katan silk saree woven by master artisans in Varanasi. Adorned with intricate Kadwa flora jaal motifs, a rich floral kadhwa border, and an elaborate brocade pallu. Perfect for festive celebrations, royal receptions, and formal events.',
    metadata: {
      fabric: 'Pure Katan Silk',
      weave: 'Traditional Kadwa Weave',
      zari: 'Fine Silver & Gold Metallic Zari',
      occasion: 'Festive / Reception / Sangeet',
      blouseIncluded: true,
      blouseLength: '0.80 meters running brocade',
      sareeLength: '5.5 meters',
      washCare: 'Dry clean only. Roll fold to preserve kadwa zari relief.',
    },
    images: [
      { imageUrl: '/saree2.png', altText: 'Banarasi Katan Silk Saree - Main Overview' },
      { imageUrl: '/saree5.png', altText: 'Banarasi Katan Silk Saree - Pallu Brocade' },
      { imageUrl: '/saree6.png', altText: 'Banarasi Katan Silk Saree - Border Detail' },
      { imageUrl: '/saree1.png', altText: 'Banarasi Katan Silk Saree - Model Drape' },
    ],
    variants: [
      {
        variantType: 'color',
        label: 'Midnight Purple & Rose Gold Zari',
        colorName: 'Midnight Purple',
        colorHex: '#4A0E4E',
        size: 'Free Size',
        sku: 'SG-BKS-002-PUR',
        price: 14200.00,
        originalPrice: 18500.00,
        stockQty: 10,
        lowStockThreshold: 3,
        imageUrl: '/saree2.png',
        isDefault: true,
        sortOrder: 0,
      },
      {
        variantType: 'color',
        label: 'Rani Pink & Champagne Gold',
        colorName: 'Rani Pink',
        colorHex: '#C2185B',
        size: 'Free Size',
        sku: 'SG-BKS-002-PNK',
        price: 14200.00,
        originalPrice: 18500.00,
        stockQty: 10,
        lowStockThreshold: 3,
        imageUrl: '/saree5.png',
        isDefault: false,
        sortOrder: 1,
      },
      {
        variantType: 'color',
        label: 'Teal Peacock Blue & Silver Zari',
        colorName: 'Teal Peacock',
        colorHex: '#00695C',
        size: 'Free Size',
        sku: 'SG-BKS-002-TEL',
        price: 14800.00,
        originalPrice: 19000.00,
        stockQty: 8,
        lowStockThreshold: 2,
        imageUrl: '/saree6.png',
        isDefault: false,
        sortOrder: 2,
      },
      {
        variantType: 'color',
        label: 'Sunset Orange & Golden Butta',
        colorName: 'Sunset Orange',
        colorHex: '#E65100',
        size: 'Free Size',
        sku: 'SG-BKS-002-ORG',
        price: 14200.00,
        originalPrice: 18500.00,
        stockQty: 8,
        lowStockThreshold: 2,
        imageUrl: '/saree1.png',
        isDefault: false,
        sortOrder: 3,
      },
    ],
  },
  {
    code: 'SG-CTS-003',
    name: 'Chanderi Tussar Silk Zari Butta Saree',
    slug: 'chanderi-tussar-silk-zari-butta-saree',
    type: 'Chanderi Silk',
    categoryName: 'Silk',
    price: 9800.00,
    originalPrice: 12900.00,
    imageUrl: '/saree3.png',
    tag: 'Trending',
    gender: 'women',
    weightKg: 0.650,
    lengthCm: 630.00,
    breadthCm: 114.00,
    heightCm: 3.00,
    gstRate: 5.00,
    featured: true,
    isNew: true,
    isBestSeller: true,
    description:
      'Feather-light Chanderi Tussar handloom saree featuring hand-woven meenakari zari buttas across the body. Its sheer, shimmering gossamer texture provides effortless drape and breathable comfort for day ceremonies and evening soirees.',
    metadata: {
      fabric: 'Chanderi Silk Cotton Blend (Tussar Warp)',
      weave: 'Handloom Eknaliya Weave',
      zari: 'Tested Antique Gold Zari',
      occasion: 'Cocktail / Puja / Formal Gathering',
      blouseIncluded: true,
      blouseLength: '0.80 meters contrasting border blouse',
      sareeLength: '5.5 meters',
      washCare: 'Dry clean recommended. Gentle hand wash in cold water with mild silk detergent.',
    },
    images: [
      { imageUrl: '/saree3.png', altText: 'Chanderi Tussar Silk Saree - Body Overview' },
      { imageUrl: '/saree4.png', altText: 'Chanderi Tussar Silk Saree - Butta & Pallu' },
      { imageUrl: '/saree5.png', altText: 'Chanderi Tussar Silk Saree - Border Detail' },
      { imageUrl: '/saree6.png', altText: 'Chanderi Tussar Silk Saree - Draped Silhouette' },
    ],
    variants: [
      {
        variantType: 'color',
        label: 'Pastel Mint Green & Gold Zari',
        colorName: 'Mint Green',
        colorHex: '#66BB6A',
        size: 'Free Size',
        sku: 'SG-CTS-003-MNT',
        price: 9800.00,
        originalPrice: 12900.00,
        stockQty: 14,
        lowStockThreshold: 3,
        imageUrl: '/saree3.png',
        isDefault: true,
        sortOrder: 0,
      },
      {
        variantType: 'color',
        label: 'Peach Coral & Copper Zari',
        colorName: 'Peach Coral',
        colorHex: '#FF7043',
        size: 'Free Size',
        sku: 'SG-CTS-003-PCH',
        price: 9800.00,
        originalPrice: 12900.00,
        stockQty: 12,
        lowStockThreshold: 3,
        imageUrl: '/saree4.png',
        isDefault: false,
        sortOrder: 1,
      },
      {
        variantType: 'color',
        label: 'Powder Lavender & Silver Butta',
        colorName: 'Powder Lavender',
        colorHex: '#9575CD',
        size: 'Free Size',
        sku: 'SG-CTS-003-LAV',
        price: 10200.00,
        originalPrice: 13500.00,
        stockQty: 10,
        lowStockThreshold: 2,
        imageUrl: '/saree5.png',
        isDefault: false,
        sortOrder: 2,
      },
      {
        variantType: 'color',
        label: 'Ivory Cream & Antique Gold',
        colorName: 'Ivory Cream',
        colorHex: '#FFF8E1',
        size: 'Free Size',
        sku: 'SG-CTS-003-IVR',
        price: 9800.00,
        originalPrice: 12900.00,
        stockQty: 12,
        lowStockThreshold: 3,
        imageUrl: '/saree6.png',
        isDefault: false,
        sortOrder: 3,
      },
    ],
  },
]

async function addProducts() {
  const transaction = await sequelize.transaction()
  try {
    console.log('--- Starting creation of 3 Professional Products with 4 Variants each ---')

    // Find category ID for Silk
    const silkCategory = await Category.findOne({ where: { name: 'silk' } })
    const defaultCategoryId = silkCategory ? (silkCategory as any).id : null

    for (const [prodIndex, pData] of PRODUCTS_DATA.entries()) {
      console.log(`\nCreating Product ${prodIndex + 1}: ${pData.name}...`)

      // Calculate total stock from all 4 variants
      const totalStock = pData.variants.reduce((sum, v) => sum + v.stockQty, 0)

      // 1. Create or update Product
      let product = await Product.findOne({ where: { code: pData.code }, transaction })
      if (!product) {
        product = await Product.create(
          {
            code: pData.code,
            name: pData.name,
            slug: pData.slug,
            type: pData.type,
            category: pData.categoryName,
            categoryId: defaultCategoryId,
            price: pData.price,
            originalPrice: pData.originalPrice,
            stockQty: totalStock,
            lowStockThreshold: 10,
            imageUrl: pData.imageUrl,
            tag: pData.tag,
            weightKg: pData.weightKg,
            lengthCm: pData.lengthCm,
            breadthCm: pData.breadthCm,
            heightCm: pData.heightCm,
            color: pData.variants[0].colorName,
            gender: pData.gender,
            hasVariants: true,
            status: 'active',
            featured: pData.featured,
            isNew: pData.isNew,
            isBestSeller: pData.isBestSeller,
            sortOrder: prodIndex,
            gstRate: pData.gstRate,
            metaTitle: `${pData.name} | Soil Goddess Handloom Sarees`,
            metaDescription: pData.description.slice(0, 160),
            metadata: pData.metadata,
          },
          { transaction }
        )
      } else {
        await product.update(
          {
            name: pData.name,
            slug: pData.slug,
            type: pData.type,
            category: pData.categoryName,
            categoryId: defaultCategoryId,
            price: pData.price,
            originalPrice: pData.originalPrice,
            stockQty: totalStock,
            imageUrl: pData.imageUrl,
            tag: pData.tag,
            weightKg: pData.weightKg,
            hasVariants: true,
            status: 'active',
            featured: pData.featured,
            isNew: pData.isNew,
            isBestSeller: pData.isBestSeller,
            metadata: pData.metadata,
          },
          { transaction }
        )
      }

      const productId = (product as any).id

      // 2. Clear old variants and images for fresh clean professional state
      await ProductVariant.destroy({ where: { productId }, transaction })
      await ProductImage.destroy({ where: { productId }, transaction })

      // 3. Insert Product Gallery Images
      for (const [imgIndex, img] of pData.images.entries()) {
        await ProductImage.create(
          {
            productId,
            imageUrl: img.imageUrl,
            altText: img.altText,
            sortOrder: imgIndex,
          },
          { transaction }
        )
      }

      // 4. Create 4 Variants
      for (const vData of pData.variants) {
        const variant = await ProductVariant.create(
          {
            productId,
            variantType: vData.variantType,
            label: vData.label,
            colorName: vData.colorName,
            colorHex: vData.colorHex,
            size: vData.size,
            sku: vData.sku,
            price: vData.price,
            originalPrice: vData.originalPrice,
            stockQty: vData.stockQty,
            lowStockThreshold: vData.lowStockThreshold,
            imageUrl: vData.imageUrl,
            isDefault: vData.isDefault,
            status: 'active',
            gstRate: pData.gstRate,
            sortOrder: vData.sortOrder,
          },
          { transaction }
        )

        const variantId = (variant as any).id

        // Add Variant Image
        await VariantImage.create(
          {
            variantId,
            imageUrl: vData.imageUrl,
            altText: `${pData.name} - ${vData.label}`,
            sortOrder: 0,
          },
          { transaction }
        )

        console.log(`  ✓ Variant created: [${vData.sku}] ${vData.label} (Stock: ${vData.stockQty}, Price: ₹${vData.price})`)
      }
    }

    await transaction.commit()
    console.log('\n✅ All 3 Products with 4 Variants each created successfully in database!')
  } catch (err) {
    await transaction.rollback()
    console.error('❌ Failed to add products:', err)
    process.exit(1)
  }
}

addProducts().then(() => {
  process.exit(0)
})
