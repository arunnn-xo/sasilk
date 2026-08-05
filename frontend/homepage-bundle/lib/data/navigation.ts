import { type NavMenuItem } from '@/lib/services/storefront.service'

export const STATIC_NAV_MENU: NavMenuItem[] = [
  {
    label: "ORGANIC SAREES",
    href: "/collections/organic-sarees",
    subCategories: [
      {
        name: "COTTON",
        href: "/collections/cotton-sarees",
        products: [
          { name: "AJRAKH" },
          { name: "ARNI" },
          { name: "BAGRU" },
          { name: "BANDHANI" },
          { name: "BATIK" },
          { name: "BEGAMPURI" },
          { name: "BENGAL" },
          { name: "BOMKAI" },
          { name: "CHANDERI" },
          { name: "CHETTINAD", isHot: true },
          { name: "COIMBATORE" },
          { name: "DHANIA KHALI" },
          { name: "DOBBY" },
          { name: "ERODE" },
          { name: "JAMDHANI" },
          { name: "KALAMKARI" },
          { name: "KALYANI" },
          { name: "KANCHI", isHot: true },
          { name: "KERALA KASAVU" },
          { name: "KHADI" },
          { name: "KOORAINADU" },
          { name: "KORA" },
          { name: "KOTA" },
          { name: "KOTPAD" },
          { name: "KUTCH" },
          { name: "MAHESWARI" },
          { name: "MANGALAGIRI" },
          { name: "MAYURI" },
          { name: "MUL MUL", isHot: true },
          { name: "NARAYANAPET" },
          { name: "PHULKARI" },
          { name: "POCHAMPALLY IKKAT" },
          { name: "SALEM" },
          { name: "SAMBALPURI" },
          { name: "SANGANER" },
          { name: "SUNGUDI", isHot: true },
          { name: "TANT" },
          { name: "VELTHARI" },
          { name: "VENKATAGIRI" },
          { name: "VOYAL" },
        ]
      },
      {
        name: "SILK COTTON",
        href: "/collections/silk-cotton",
        products: [
          { name: "KANCHI x COTTON" },
          { name: "MAHESWARI x COTTON" },
          { name: "KORVAI x COTTON" },
          { name: "MASHRU x COTTON" },
          { name: "ILKAL x COTTON" },
          { name: "CHANDERI x COTTON" },
          { name: "POCHAMPALLY x COTTON" },
          { name: "UPPADA x COTTON" },
          { name: "PAITHANI x COTTON" },
          { name: "DHARMAVARAM x COTTON" },
        ]
      },
      {
        name: "HANDLOOM",
        href: "/collections/handloom",
        products: [
          { name: "COTTON" },
          { name: "SILK" },
          { name: "SILK COTTON" },
          { name: "KHADI" },
          { name: "LINEN" },
          { name: "JUTE" },
        ]
      },
      {
        name: "LINEN",
        href: "/collections/linen",
        products: [
          { name: "PURE LINEN" },
          { name: "LINEN COTTON" },
          { name: "LINEN SILK" },
          { name: "LINEN TISSUE" },
        ]
      },
      {
        name: "BRIDAL",
        href: "/collections/bridal",
        products: [
          { name: "KANCHIPURAM SILK" },
          { name: "MYSORE SILK" },
          { name: "BANARASI SILK" },
          { name: "MODAL SILK" },
          { name: "TUSSAR SILK" },
          { name: "PEN KALAMKARI SILK" },
          { name: "PAITHANI SILK" },
          { name: "MULBERRY SILK" },
          { name: "BANANA SILK (Chinnalampattu)" },
          { name: "LOTUS SILK" },
          { name: "ERI SILK" },
          { name: "MUGA SILK" },
          { name: "KOORA PUDAVAI" },
        ]
      },
      {
        name: "HAND BLOCK PRINT",
        href: "/collections/hand-block-print",
        products: [
          { name: "COTTON HAND BLOCK" },
          { name: "SILK HAND BLOCK" },
          { name: "MODAL HAND BLOCK" },
        ]
      },
      {
        name: "KALAMKARI",
        href: "/collections/kalamkari",
        directLink: true
      },
      {
        name: "KANCHIPURAM SILK",
        href: "/collections/kanchipuram",
        directLink: true
      },
      {
        name: "MYSORE SILK",
        href: "/collections/mysore-silk",
        directLink: true
      },
      {
        name: "BANARASI SILK",
        href: "/collections/banarasi-silk",
        directLink: true
      },
      {
        name: "MODAL SILK",
        href: "/collections/modal-silk",
        directLink: true
      },
      {
        name: "TUSSAR SILK",
        href: "/collections/tussar-silk",
        directLink: true
      },
      {
        name: "PEN KALAMKARI SILK",
        href: "/collections/pen-kalamkari-silk",
        directLink: true
      },
      {
        name: "PAITHANI SILK",
        href: "/collections/paithani-silk",
        directLink: true
      },
      {
        name: "MULBERRY SILK",
        href: "/collections/mulberry-silk",
        directLink: true
      },
      {
        name: "BANANA SILK (Chinnalampattu)",
        href: "/collections/banana-silk",
        directLink: true
      },
      {
        name: "LOTUS SILK",
        href: "/collections/lotus-silk",
        directLink: true
      },
      {
        name: "ERI SILK",
        href: "/collections/eri-silk",
        directLink: true
      },
      {
        name: "MUGA SILK",
        href: "/collections/muga-silk",
        directLink: true
      },
      {
        name: "PALUM PAZHAMUM",
        href: "/collections/palum-pazhamum",
        products: [
          { name: "MULTI COLOR CHECK" },
          { name: "PALUM PAZHAMUM SAREES" },
        ]
      },
      {
        name: "SATIN",
        href: "/collections/satin",
        directLink: true
      },
      {
        name: "HEMP",
        href: "/collections/hemp",
        directLink: true
      },
      {
        name: "WOOL",
        href: "/collections/wool",
        products: [
          { name: "PASHMINA" },
          { name: "MERINO" },
          { name: "KASHMIRI" },
        ]
      },
      {
        name: "JUTE",
        href: "/collections/jute",
        directLink: true
      },
      {
        name: "FANCY",
        href: "/collections/fancy",
        products: [
          { name: "CHIKANKARI" },
          { name: "KANTHA HAND STITCH" },
          { name: "MIRROR WORK" },
          { name: "EMBROIDERY" },
        ]
      }
    ]
  },
  {
    label: "PARTY WEAR",
    href: "/collections/party-wear",
    subCategories: [
      { name: "LEHENGAS & HALF SAREES", href: "/collections/lehengas-half-sarees" },
      { name: "ETHNIC GOWN", href: "/collections/ethnic-gown" },
      { name: "ETHNIC SUIT", href: "/collections/ethnic-suit" },
      { name: "ETHNIC READYMADES", href: "/collections/ethnic-readymades" },
      { name: "WESTERN READYMADES", href: "/collections/western-readymades" },
      { name: "CO-ORDS", href: "/collections/party-co-ords" },
      { name: "3 PIECE SALWAR SET", href: "/collections/party-salwar-set" },
      { name: "DUPATTA", href: "/collections/dupatta" }
    ]
  },
  {
    label: "DAILY WEAR",
    href: "/collections/daily-wear",
    subCategories: [
      { name: "KURTI & TOPS", href: "/collections/kurti-tops" },
      { name: "TUNICS & TSHIRTS", href: "/collections/tunics-tshirts" },
      { name: "CO-ORDS", href: "/collections/daily-co-ords" },
      { name: "3 PIECE SALWAR SET", href: "/collections/daily-salwar-set" },
      { name: "DRESS", href: "/collections/dress" },
      { name: "LEGGIN", href: "/collections/leggin" },
      { name: "CIGRATE / STRAIGHT CUT PANTS", href: "/collections/straight-cut-pants" },
      { name: "PALAZZO / LOOSE PANTS", href: "/collections/palazzo-loose-pants" },
      { name: "SKIRTS", href: "/collections/skirts" },
      { name: "MAXI", href: "/collections/maxi" },
      { name: "PYJAMA SET", href: "/collections/pyjama-set" },
      { name: "PYJAMA PANT", href: "/collections/pyjama-pant" }
    ]
  },
  {
    label: "MEN",
    href: "/collections/men",
    subCategories: [
      { name: "SHIRTS", href: "/collections/men-shirts" },
      { name: "TSHIRTS", href: "/collections/men-tshirts" },
      { name: "CO-ORDS", href: "/collections/men-co-ords" },
      { name: "TROUSERS", href: "/collections/men-trousers" },
      { name: "VESHTI / DHOTHI", href: "/collections/veshti-dhothi" },
      { name: "VESHTI SHIRT SET", href: "/collections/veshti-shirt-set" }
    ]
  },
  {
    label: "KIDS",
    href: "/collections/kids",
    subCategories: [
      {
        name: "BOYS",
        href: "/collections/kids-boys",
        products: [
          { name: "SHIRT" },
          { name: "TSHIRT" },
          { name: "CO-ORDS" },
          { name: "TROUSERS" },
          { name: "TRACK PANT / JOGGER" },
          { name: "VESHTI / DHOTHI" },
          { name: "VESHTI SHIRT SET" },
          { name: "KURTA PANT SET" },
        ]
      },
      {
        name: "GIRLS",
        href: "/collections/kids-girls",
        products: [
          { name: "TOPS & TSHIRTS" },
          { name: "CO-ORDS" },
          { name: "DRESS" },
          { name: "PANTS" },
          { name: "SKIRTS" },
          { name: "PYJAMA SET" },
          { name: "PATTU PAVADAI SET" },
          { name: "ETHNIC GOWN" },
        ]
      }
    ]
  },
  {
    label: "PRIVACY WEAR",
    href: "/collections/privacy-wear",
    subCategories: [
      {
        name: "MEN",
        href: "/collections/privacy-wear-men",
        products: [
          { name: "VEST" },
          { name: "BRIEF" },
          { name: "BOXER" },
        ]
      },
      {
        name: "WOMEN",
        href: "/collections/privacy-wear-women",
        products: [
          { name: "BRAZIER" },
          { name: "UNDERWEAR" },
          { name: "CAMISOLES" },
        ]
      },
      { name: "BOYS", href: "/collections/privacy-wear-boys" },
      { name: "GIRLS", href: "/collections/privacy-wear-girls" }
    ]
  },
  {
    label: "ORGANIC COSMETICS",
    href: "/collections/organic-cosmetics",
    subCategories: [
      { name: "SOAP", href: "/collections/soap" },
      { name: "LIP BALM", href: "/collections/lip-balm" },
      { name: "LIP SCURB", href: "/collections/lip-scrub" },
      { name: "LIP OIL", href: "/collections/lip-oil" },
      { name: "KAJAL", href: "/collections/kajal" },
      { name: "SHAMPOO", href: "/collections/shampoo" },
      { name: "HAIR MASK", href: "/collections/hair-mask" }
    ]
  },
  {
    label: "ACCESSORIES",
    href: "/collections/accessories",
    subCategories: [
      { name: "BAGS", href: "/collections/bags" },
      { name: "WALLET", href: "/collections/wallet" },
      { name: "BELT", href: "/collections/belt" },
      { name: "STOLES", href: "/collections/stoles" },
      { name: "CAPS & HATS", href: "/collections/caps-hats" }
    ]
  },
  {
    label: "JEWELLERY",
    href: "/collections/jewellery",
    subCategories: [
      { name: "KEMP STONE", href: "/collections/kemp-stone" },
      { name: "NAGAS", href: "/collections/nagas" },
      { name: "BHARTHANATIYAM COLLECTIONS", href: "/collections/bharthanatiyam" },
      { name: "BRIDAL COLLECTIONS", href: "/collections/bridal-jewellery" },
      { name: "EARINGS", href: "/collections/earrings" },
      { name: "NECKLACE & HARAM", href: "/collections/necklace-haram" },
      { name: "HIP BELT", href: "/collections/hip-belt" },
      { name: "BANGLES", href: "/collections/bangles" },
      { name: "MAANG TIKKA", href: "/collections/maang-tikka" },
      { name: "OTHERS", href: "/collections/jewellery-others" }
    ]
  },
  {
    label: "HOME & LIVING",
    href: "/collections/home-living",
    subCategories: [
      { name: "BEDSHEETS", href: "/collections/bedsheets" },
      { name: "BEDSPREAD", href: "/collections/bedspread" },
      { name: "PILLOW COVERS", href: "/collections/pillow-covers" },
      { name: "CUSHION COVERS", href: "/collections/cushion-covers" },
      { name: "BATH TOWELS", href: "/collections/bath-towels" },
      { name: "HAND TOWELS", href: "/collections/hand-towels" },
      { name: "KITCHEN TOWELS", href: "/collections/kitchen-towels" },
      { name: "KITCHEN GLOVES", href: "/collections/kitchen-gloves" },
      { name: "POT HOLDERS", href: "/collections/pot-holders" }
    ]
  },
  {
    label: "RETURN GIFTS",
    href: "/collections/return-gifts",
    subCategories: [
      { name: "UNDER ₹50", href: "/collections/return-gifts-under-50" },
      { name: "FROM ₹50 TO ₹100", href: "/collections/return-gifts-50-100" },
      { name: "FROM ₹100 TO ₹200", href: "/collections/return-gifts-100-200" },
      { name: "FROM ₹200 TO ₹300", href: "/collections/return-gifts-200-300" },
      { name: "FROM ₹300 TO ₹400", href: "/collections/return-gifts-300-400" },
      { name: "FROM ₹400 TO ₹500", href: "/collections/return-gifts-400-500" },
      { name: "KIDS", href: "/collections/return-gifts-kids" }
    ]
  },
  {
    label: "CLEARANCE SALE",
    href: "/sale",
    isSale: true
  }
]
