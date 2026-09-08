# Soil Goddess - Standalone Homepage Bundle

This folder contains the complete, self-contained Homepage code and components for the Soil Goddess project.

## Directory Structure

```
homepage-bundle/
├── README.md
├── app/
│   └── page.tsx                     # Main Homepage Route
└── components/
    ├── home/                        # Homepage Specific Sections
    │   ├── HeroSection.tsx          # Hero Banner & Carousel
    │   ├── InstaReels.tsx           # Reel the Weave (3D Coverflow Reel Gallery)
    │   └── HomeComponents.tsx       # Product Grid, Offers Strip, Loyalty Banner, Video Placeholder
    ├── layout/                      # Layout Components
    │   ├── Header.tsx               # Header Navigation
    │   ├── Footer.tsx               # Footer with Gold Badges & Kolam Frame (#FF8F00)
    │   └── AnnouncementBar.tsx      # Top Announcement Ticker
    └── ui/                          # Interactive UI Components
        ├── IntroVideo.tsx           # Intro Video Handler
        ├── FloatingActions.tsx      # Floating Action Buttons (WhatsApp / Quick Call)
        └── CartNavigationHandler.tsx# Cart State Handler
```

## Features Included in this Bundle

1. **Hero Section (`HeroSection.tsx`)**: High-impact luxury hero slider with banner cards.
2. **Product Grid & Collections (`HomeComponents.tsx`)**: Product collection showcases, offer strips, loyalty banners.
3. **Reel the Weave (`InstaReels.tsx`)**: Responsive video reel carousel with 3D Coverflow modal view and continuous infinite loop.
4. **Footer with Custom Gold Badges (`Footer.tsx`)**: Custom `#FF8F00` background, 5 gold trust badges, and SVG Kolam loop border frame.
