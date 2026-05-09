// ── Navigation Categories ──────────────────────────────
export const mainCategories = [
  { label: 'Organic Sarees', href: '/collections/organic-sarees', hasDropdown: true },
  { label: 'Ethnic Wear',    href: '/collections/ethnic-wear' },
  { label: 'Daily Wear',     href: '/collections/daily-wear' },
  { label: 'Men',            href: '/collections/men' },
  { label: 'Kids',           href: '/collections/kids' },
  { label: 'Teen',           href: '/collections/teen' },
  { label: 'Privacy Wear',   href: '/collections/privacy-wear' },
  { label: 'Organic Cosmetics', href: '/collections/cosmetics' },
  { label: 'Footwear',       href: '/collections/footwear' },
  { label: 'Accessories',    href: '/collections/accessories' },
  { label: 'Jewellery',      href: '/collections/jewellery' },
  { label: 'Home & Living',  href: '/collections/home-living' },
  { label: 'Return Gifts',   href: '/collections/return-gifts' },
  { label: 'Clearance Sale', href: '/sale', isSale: true },
]

// ── Subcategories under Organic Sarees ────────────────
export const organicSareeSubcats = [
  'Cotton', 'Handloom', 'Linen', 'Bridal',
  'Kanchipuram Silk', 'Mysore Silk', 'Tussar Silk',
  'Pen Kalamkari Silk', 'Mulberry Silk', 'Banana Silk',
  'Lotus Silk', 'Eri Silk', 'Muga Silk',
  'Satin', 'Hemp', 'Wool', 'Jute', 'Fancy',
]

// ── Featured Categories (homepage grid) ──────────────
export const featuredCategories = [
  { name: 'Mul Diaries',    href: '/collections/organic-sarees', image: '/categories/mul_diaries.png' },
  { name: 'Linen Luxe',     href: '/collections/organic-sarees', image: '/categories/linen_luxe.png' },
  { name: 'Tissue Tales',   href: '/collections/organic-sarees', image: '/categories/tissue_tales.png' },
  { name: 'Weave Heritage', href: '/collections/organic-sarees', image: '/categories/weave_heritage.png' },
  { name: 'Cloud Cotton',   href: '/collections/organic-sarees', image: '/categories/cloud_cotton.png' },
  { name: 'Ethnic Wear',    href: '/collections/ethnic-wear',    image: '/categories/ethnic_wear.png' },
  { name: 'Men\'s Wear',    href: '/collections/men',            image: '/categories/men.png' },
  { name: 'Kids & Teen',    href: '/collections/kids',           image: '/categories/kids_teen.png' },
  { name: 'Jewellery',      href: '/collections/jewellery',      image: '/categories/jewellery.png' },
  { name: 'Home & Living',  href: '/collections/home-living',    image: '/categories/home_living.png' },
  { name: 'Cosmetics',      href: '/collections/cosmetics',      image: '/categories/cosmetics.png' },
  { name: 'Footwear',       href: '/collections/footwear',       image: '/categories/footwear.png' },
  { name: 'Accessories',    href: '/collections/accessories',    image: '/categories/accessories.png' },
]



// ── New Arrivals Products ────────────────────────────
export const newArrivals = [
  {
    id: 1,
    code: 'SAS-KS-0324',
    name: 'Royal Kanchipuram Bridal',
    type: 'Pure Silk · Zari Border · 6.5m',
    price: 18500,
    originalPrice: 22000,
    isNew: true,
    color: 'from-[#E8C0D0] to-[#9C3A5C]',
    category: 'Kanchipuram Silk',
    image: '/saree1.png',
  },
  {
    id: 2,
    code: 'SAS-MS-0108',
    name: 'Mysore Crepe Silk',
    type: 'Crepe Silk · Floral Motif · 5.5m',
    price: 6200,
    originalPrice: null,
    isNew: true,
    color: 'from-[#D4B890] to-[#8B6430]',
    category: 'Mysore Silk',
    image: '/saree2.png',
  },
  {
    id: 3,
    code: 'SAS-TS-0056',
    name: 'Tussar Kalamkari Silk',
    type: 'Tussar Silk · Hand-painted · 6m',
    price: 4500,
    originalPrice: 5200,
    isNew: false,
    color: 'from-[#C0D4E8] to-[#3A5C9C]',
    category: 'Tussar Silk',
    image: '/saree3.png',
  },
  {
    id: 4,
    code: 'SAS-OC-0012',
    name: 'Organic Chettinad Cotton',
    type: 'Pure Cotton · Daily Wear · 5.5m',
    price: 1350,
    originalPrice: null,
    isNew: true,
    color: 'from-[#D4E8C0] to-[#5C9C3A]',
    category: 'Cotton',
    image: '/saree4.png',
  },
]

// ── Loyalty Tiers ────────────────────────────────────
export const loyaltyTiers = [
  { icon: '🥉', name: 'Silver', perks: ['1× points', 'Birthday discount', 'Early sale access'] },
  { icon: '🥇', name: 'Gold',   perks: ['2× points', 'Free express shipping', 'Priority support'] },
  { icon: '💎', name: 'Diamond',perks: ['3× points', 'Personal stylist', 'Exclusive drops'] },
]

// ── Search mock data ──────────────────────────────────
export const searchSuggestions = [
  { code: 'SAS-KS-0324', name: 'Kanchipuram Bridal Silk', price: 18500, emoji: '🥻' },
  { code: 'SAS-MS-0108', name: 'Mysore Crepe Silk',        price: 6200,  emoji: '🌸' },
  { code: 'SAS-OC-0012', name: 'Chettinad Cotton',         price: 1350,  emoji: '🍃' },
]
