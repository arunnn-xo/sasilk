import {
  BadgePercent,
  Bell,
  Boxes,
  ClipboardList,
  Clock,
  Flag,
  Image,
  LayoutDashboard,
  Layers,
  ListTree,
  Megaphone,
  MessageSquare,
  Package,
  ScrollText,
  Settings,
  ShoppingBag,
  Send,
  Sparkles,
  Truck,
  Users,
  XCircle,
  Mail,
  Film,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type FieldKind = 'text' | 'number' | 'textarea' | 'boolean' | 'json' | 'select' | 'image' | 'video' | 'datetime'

export type ResourceField = {
  name: string
  label: string
  kind?: FieldKind
  options?: string[]
  required?: boolean
  dimensionHint?: string
  dimensionLabel?: string
}

export type ResourceConfig = {
  path: string
  api: string
  title: string
  eyebrow: string
  Icon: LucideIcon
  fields: ResourceField[]
  columns: string[]
  hideSerialNumber?: boolean
  hideActions?: boolean
  hideAddNew?: boolean
}

export type SidebarItem = {
  path: string
  label: string
  Icon: LucideIcon
  badgeKey?: string
}

export type SidebarSection = {
  label: string
  Icon: LucideIcon
  children: SidebarItem[]
}

export type SidebarEntry = SidebarItem | SidebarSection

export function isSidebarSection(entry: SidebarEntry): entry is SidebarSection {
  return 'children' in entry
}

export const sidebarItems: SidebarEntry[] = [
  { path: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/announcements', label: 'Announcement Bar', Icon: Megaphone },
  { path: '/reels', label: 'Reel the Weave', Icon: Film },
  { path: '/marquee-messages', label: 'Marquee Messages', Icon: ScrollText },
  { path: '/banners', label: 'Banners', Icon: Image },
  {
    label: 'Products',
    Icon: Package,
    children: [
      { path: '/categories', label: 'Categories', Icon: Boxes },
      { path: '/subcategories', label: 'Sub Categories', Icon: ListTree },
      { path: '/child-categories', label: 'Child Categories', Icon: ListTree },
      { path: '/products', label: 'Products', Icon: ShoppingBag },
      { path: '/variants', label: 'Variants', Icon: Layers },
      { path: '/stock', label: 'Stock', Icon: ClipboardList },
    ],
  },
  { path: '/customers', label: 'Customers', Icon: Users },
  { path: '/coupons', label: 'Coupons', Icon: BadgePercent },
  { path: '/guest-coupon', label: 'Guest Coupon', Icon: BadgePercent },
  { path: '/reviews', label: 'Reviews', Icon: MessageSquare },
  {
    label: 'Orders',
    Icon: ShoppingBag,
    children: [
      { path: '/orders/pending-payment', label: 'Abandoned Checkouts', Icon: ShoppingBag, badgeKey: 'pending-payment' },
      { path: '/orders/pending', label: 'New Orders', Icon: ShoppingBag, badgeKey: 'pending' },
      { path: '/orders/confirmed', label: 'Confirmed', Icon: Package, badgeKey: 'confirmed' },
      { path: '/orders/packing', label: 'Packing', Icon: Package, badgeKey: 'packing' },
      { path: '/orders/dispatched', label: 'Dispatched', Icon: Truck, badgeKey: 'dispatched' },
      { path: '/orders/out-for-delivery', label: 'Out for Delivery', Icon: Truck, badgeKey: 'out-for-delivery' },
      { path: '/orders/delivered', label: 'Delivered', Icon: Truck, badgeKey: 'delivered' },
      { path: '/orders/cancelled', label: 'Cancelled', Icon: XCircle, badgeKey: 'cancelled' },
      { path: '/orders/rto', label: 'RTO', Icon: Truck, badgeKey: 'rto' },
      { path: '/orders/returned', label: 'Returned', Icon: Truck, badgeKey: 'returned' },
    ],
  },
  { path: '/notifications', label: 'Notifications', Icon: Bell },
  { path: '/email-campaigns', label: 'Email Campaigns', Icon: Send },
  { path: '/enquiries', label: 'Contact Enquiries', Icon: Mail },
  { path: '/settings', label: 'Shipping Status', Icon: Settings },
]

export const resources: ResourceConfig[] = [
  {
    path: '/announcements',
    api: 'announcement-messages',
    title: 'Announcement Bar',
    eyebrow: 'Top Header',
    Icon: Megaphone,
    columns: ['text', 'active'],
    fields: [
      { name: 'text', label: 'Message', required: true },
      { name: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    path: '/reels',
    api: 'reels',
    title: 'Reel the Weave',
    eyebrow: 'Homepage Reels Section',
    Icon: Film,
    columns: ['id', 'imageUrl', 'title', 'views', 'sortOrder', 'active'],
    fields: [
      {
        name: 'imageUrl',
        label: 'Reel Image',
        kind: 'image',
        required: true,
        dimensionHint: 'reel-card',
        dimensionLabel: 'Recommended: 400×700px, 9:16 ratio. Minimum: 300×530px.',
      },
      {
        name: 'videoUrl',
        label: 'Reel Video (plays on click, optional)',
        kind: 'video',
        dimensionLabel: 'MP4, WebM, or MOV — Max 50 MB.',
      },
      { name: 'title', label: 'Title' },
      { name: 'views', label: 'Views Display (e.g. 1L, 52K)', required: true },
      { name: 'sortOrder', label: 'Sort Order', kind: 'number' },
      { name: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    path: '/marquee-messages',
    api: 'marquee-messages',
    title: 'Marquee Messages',
    eyebrow: 'Home Center Marquee',
    Icon: ScrollText,
    columns: ['text', 'active'],
    fields: [
      { name: 'text', label: 'Message', required: true },
      { name: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    path: '/banners',
    api: 'banners',
    title: 'Banners',
    eyebrow: 'Hero and Below Header',
    Icon: Flag,
    columns: ['id', 'placement', 'title', 'imageUrl', 'active'],
    fields: [
      { name: 'placement', label: 'Placement', kind: 'select', options: ['home_hero'], required: true },
      { name: 'title', label: 'Title', required: true },
      { name: 'subtitle', label: 'Subtitle', kind: 'textarea' },
      {
        name: 'imageUrl',
        label: 'Banner Image',
        kind: 'image',
        required: true,
        dimensionHint: 'banner-hero',
        dimensionLabel: 'Recommended: 1920×1080px, 16:9 ratio. Minimum: 1200×675px.',
      },
      { name: 'ctaLabel', label: 'CTA Label' },
      { name: 'ctaUrl', label: 'CTA URL' },
      { name: 'sortOrder', label: 'Sort Order', kind: 'number' },
      { name: 'active', label: 'Active', kind: 'boolean' },
    ],
  },
  {
    path: '/categories',
    api: 'categories',
    title: 'Categories',
    eyebrow: 'Women, Kids, Main Nav',
    Icon: Boxes,
    columns: ['id', 'section', 'name', 'navVisible', 'homeVisible', 'headerHighlight', 'active'],
    fields: [
      { name: 'section', label: 'Section', kind: 'select', options: ['collections-for', 'shop-by', 'browse-all'], required: true },
      { name: 'name', label: 'Name', required: true },
      { name: 'href', label: 'Storefront Link', required: true },
      {
        name: 'imageUrl',
        label: 'Category Image',
        kind: 'image',
        dimensionHint: 'category-card',
        dimensionLabel: 'Recommended: 800×1067px, 3:4 ratio. Minimum: 600×800px.',
      },
      { name: 'tag', label: 'Tag' },
      { name: 'navVisible', label: 'Show in Header Nav', kind: 'boolean' },
      { name: 'headerHighlight', label: 'Header Highlight ✦', kind: 'boolean' },
      { name: 'homeVisible', label: 'Show on Home', kind: 'boolean' },
      { name: 'sortOrder', label: 'Sort Order', kind: 'number' },
      { name: 'active', label: 'Active', kind: 'boolean' },
      { name: 'metadata', label: 'Metadata JSON', kind: 'json' },
    ],
  },
  {
    path: '/products',
    api: 'products',
    title: 'Products',
    eyebrow: 'Catalog',
    Icon: Package,
    columns: ['id', 'imageUrl', 'code', 'name', 'category', 'price', 'status'],
    fields: [
      { name: 'code', label: 'Product Code' },
      { name: 'name', label: 'Name', required: true },
      { name: 'type', label: 'Type' },
      { name: 'description', label: 'Description', kind: 'textarea' },
      { name: 'category', label: 'Category' },
      { name: 'categoryId', label: 'Category ID', kind: 'number' },
      { name: 'price', label: 'Price', kind: 'number', required: true },
      { name: 'originalPrice', label: 'Original Price', kind: 'number' },
      { name: 'stockQty', label: 'Stock Qty', kind: 'number' },
      {
        name: 'imageUrl',
        label: 'Product Image',
        kind: 'image',
        dimensionHint: 'product-card',
        dimensionLabel: 'Recommended: 800×1000px, 4:5 ratio. Minimum: 600×750px.',
      },
      { name: 'color', label: 'Color/Gradient' },
      { name: 'status', label: 'Status', kind: 'select', options: ['draft', 'active', 'archived'] },
      { name: 'featured', label: 'Featured', kind: 'boolean' },
      { name: 'isNew', label: 'New Arrival', kind: 'boolean' },
      { name: 'hasVariants', label: 'Has Variants', kind: 'boolean' },
      { name: 'gender', label: 'Audience', kind: 'select', options: ['women', 'men', 'kids', 'unisex'] },
      { name: 'ageGroup', label: 'Age Group (e.g. 2-5Y)' },
      { name: 'sortOrder', label: 'Sort Order', kind: 'number' },
      { name: 'metadata', label: 'Metadata JSON', kind: 'json' },
    ],
  },
  {
    path: '/customers',
    api: 'customers',
    title: 'Customers',
    eyebrow: 'Accounts',
    Icon: Users,
    columns: ['name', 'email', 'mobile'],
    hideSerialNumber: false,
    hideActions: true,
    hideAddNew: true,
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'mobile', label: 'Mobile' },
      { name: 'status', label: 'Status', kind: 'select', options: ['active', 'inactive'] },
      { name: 'emailVerified', label: 'Email Verified', kind: 'boolean' },
    ],
  },
  {
    path: '/coupons',
    api: 'coupons',
    title: 'Coupons',
    eyebrow: 'Promotions',
    Icon: BadgePercent,
    columns: ['id', 'code', 'type', 'value', 'minCartValue', 'usedCount', 'active', 'expiresAt', 'eligibility'],
    fields: [
      { name: 'code', label: 'Coupon Code', required: true },
      { name: 'type', label: 'Type', kind: 'select', options: ['percentage', 'fixed'], required: true },
      { name: 'value', label: 'Value', kind: 'number', required: true },
      { name: 'minCartValue', label: 'Min Cart Value', kind: 'number' },
      { name: 'maxDiscount', label: 'Max Discount (for %)', kind: 'number' },
      { name: 'usageLimit', label: 'Total Usage Limit', kind: 'number' },
      { name: 'perUserLimit', label: 'Per User Limit', kind: 'number' },
      { name: 'startsAt', label: 'Starts At', kind: 'datetime' },
      { name: 'expiresAt', label: 'Expires At', kind: 'datetime' },
      { name: 'active', label: 'Active', kind: 'boolean' },
      { name: 'description', label: 'Description', kind: 'textarea' },
    ],
  },
  {
    path: '/orders',
    api: 'orders',
    title: 'Orders',
    eyebrow: 'Order Desk',
    Icon: ShoppingBag,
    columns: ['id', 'orderNumber', 'customerEmail', 'status', 'grandTotal'],
    fields: [
      { name: 'status', label: 'Status', kind: 'select', options: ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'] },
      { name: 'paymentStatus', label: 'Payment Status', kind: 'select', options: ['pending', 'paid', 'failed', 'refunded'] },
      { name: 'metadata', label: 'Metadata JSON', kind: 'json' },
    ],
  },
  {
    path: '/enquiries',
    api: 'enquiries',
    title: 'Contact Enquiries',
    eyebrow: 'Customer Inquiries',
    Icon: Mail,
    columns: ['name', 'email', 'phonenumber', 'message', 'createdAt'],
    hideAddNew: true,
    hideActions: true,
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'phonenumber', label: 'Phone Number', required: true },
      { name: 'message', label: 'Message', kind: 'textarea', required: true },
    ],
  },
]
