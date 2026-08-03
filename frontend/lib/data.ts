// ── Navigation Categories ──────────────────────────────
export const mainCategories = [
  { label: 'Organic Sarees',    href: '/collections/organic-sarees', hasDropdown: true },
  { label: 'Party Wear',        href: '/collections/party-wear' },
  { label: 'Daily Wear',        href: '/collections/daily-wear' },
  { label: 'Men',               href: '/collections/men' },
  { label: 'Kids',              href: '/collections/kids' },
  { label: 'Privacy Wear',      href: '/collections/privacy-wear' },
  { label: 'Organic Cosmetics', href: '/collections/cosmetics' },
  { label: 'Accessories',       href: '/collections/accessories' },
  { label: 'Jewellery',         href: '/collections/jewellery' },
  { label: 'Home & Living',     href: '/collections/home-living' },
  { label: 'Return Gifts',      href: '/collections/return-gifts' },
  { label: 'Clearance Sale',    href: '/sale', isSale: true },
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
  { name: 'Organic Sarees',    href: '/collections/organic-sarees', image: '/categories/organic_sarees_cat.png' },
  { name: 'Party Wear',        href: '/collections/party-wear',     image: '/categories/party_wear_cat.png' },
  { name: 'Daily Wear',        href: '/collections/daily-wear',     image: '/categories/daily_wear_cat.png' },
  { name: 'Men\'s Wear',       href: '/collections/men',            image: '/categories/men_cat.png' },
  { name: 'Kids',              href: '/collections/kids',           image: '/categories/kids_cat.png' },
  { name: 'Privacy Wear',      href: '/collections/privacy-wear',   image: '/categories/privacy_wear_cat.png' },
  { name: 'Organic Cosmetics', href: '/collections/cosmetics',      image: '/categories/organic_cosmetics_cat.png' },
  { name: 'Accessories',       href: '/collections/accessories',    image: '/categories/accessories_cat.png' },
  { name: 'Jewellery',         href: '/collections/jewellery',      image: '/categories/jewellery_cat.png' },
  { name: 'Home & Living',     href: '/collections/home-living',    image: '/categories/home_living_cat.png' },
  { name: 'Return Gifts',      href: '/collections/return-gifts',   image: '/categories/return_gifts_cat.png' },
  { name: 'Clearance Sale',    href: '/sale',                       image: '/categories/clearance_sale_cat.png' },
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
  { code: 'SAS-KS-0324', name: 'Kanchipuram Bridal Silk', price: 18500, emoji: '🥻', color: 'Red', occasion: 'Marriage, Bridal, Wedding Anniversary', category: 'Kanchipuram Silk' },
  { code: 'SAS-MS-0108', name: 'Mysore Crepe Silk',        price: 6200,  emoji: '🌸', color: 'Gold, Mustard', occasion: 'Festive, Diwali, Birthday', category: 'Mysore Silk' },
  { code: 'SAS-OC-0012', name: 'Chettinad Cotton',         price: 1350,  emoji: '🍃', color: 'Green, Maroon', occasion: 'Daily Wear, Casual', category: 'Cotton' },
  { code: 'SAS-KS-0450', name: 'Kanchipuram Baby Shower',  price: 14500, emoji: '👶', color: 'Yellow, Pink', occasion: 'Baby Shower', category: 'Kanchipuram Silk' },
  { code: 'SAS-TS-0120', name: 'Tussar Silk Gift',         price: 4800,  emoji: '🎁', color: 'Blue, Beige', occasion: 'Mothers Day Sale, Womens Day Sale', category: 'Tussar Silk' },
]
