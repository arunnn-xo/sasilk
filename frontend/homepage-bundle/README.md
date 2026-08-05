# Soil Goddess - Complete Standalone Homepage Bundle

This folder is a 100% self-contained, standalone Next.js package containing all code, components, services, data, public assets (images, videos, icons, motifs), and configuration files required for the Homepage.

## Directory Structure

```
homepage-bundle/
├── README.md
├── package.json                     # Project dependencies
├── tailwind.config.js               # Tailwind CSS design system tokens
├── tsconfig.json                    # TypeScript configuration
├── next.config.js                   # Next.js configuration
├── app/
│   ├── page.tsx                     # Main Homepage Route Entry Point
│   ├── layout.tsx                   # Root Layout
│   └── globals.css                  # Core CSS Design System & Custom Tokens
├── public/                          # All Homepage Media Assets
│   ├── logo.png                     # Brand Logo
│   ├── kolam-border.svg             # Kolam Border Pattern
│   ├── saree1.png to saree6.png     # Saree Thumbnails & Reel Videos
│   ├── borderdesign/                # Flower motifs, kolam corners, borders
│   ├── footer-icons/                # 5 Gold Trust Badges (Skin Friendly, Naturally Derived, etc.)
│   ├── introvideo/                  # Intro Video MP4
│   ├── categories/                  # Category Banners & Images
│   └── sectionicon/                 # Section Ornaments & Dividers
├── components/
│   ├── home/                        # Homepage Specific Sections (HeroSection, InstaReels, HomeComponents)
│   ├── layout/                      # Layout Components (Header, Footer with #FF8F00 bg, AnnouncementBar)
│   └── ui/                          # Interactive UI Components (IntroVideo, CouponPopup, FloatingActions, CartHandler)
└── lib/                             # Shared Services & State
    ├── context/                     # Cart Context State
    ├── services/                    # Storefront & Order Services
    └── data/                        # Navigation & Mega Menu Data
```

## Features Included in this Standalone Bundle

1. **Complete Media Assets (`public/`)**: All images, video reels, gold trust badges, Kolam borders, section icons, and brand logos.
2. **Hero Section (`HeroSection.tsx`)**: High-impact luxury hero slider with banner cards.
3. **Product Grid & Collections (`HomeComponents.tsx`)**: Product collection showcases, offer strips, loyalty banners.
4. **Reel the Weave (`InstaReels.tsx`)**: Video reel carousel with 3D Coverflow modal view and continuous infinite loop.
5. **Footer with Custom Gold Badges (`Footer.tsx`)**: Warm amber `#FF8F00` background, 5 gold trust badges, and SVG Kolam loop border frame.
6. **Services & Data (`lib/`)**: Cart context, storefront service, and navigation data.
