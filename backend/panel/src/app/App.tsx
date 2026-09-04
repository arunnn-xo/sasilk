import { Fragment, useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import AdminLayout from '../layouts/AdminLayout'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import ResourceListPage from '../pages/ResourceListPage'
import ResourceFormPage from '../pages/ResourceFormPage'
import AnnouncementFormPage from '../pages/AnnouncementFormPage'
import BannerFormPage from '../pages/BannerFormPage'
import CategoriesPage from '../pages/CategoriesPage'
import CategoryFormPage from '../pages/CategoryFormPage'
import ProductsListPage from '../pages/ProductsListPage'
import ProductFormPage from '../pages/ProductFormPage'
import CouponFormPage from '../pages/CouponFormPage'
import CouponsListPage from '../pages/CouponsListPage'
import GuestCouponPage from '../pages/GuestCouponPage'
import SubcategoriesPage from '../pages/SubcategoriesPage'
import VariantsPage from '../pages/VariantsPage'
import StockPage from '../pages/StockPage'
import OrdersLayout from '../pages/OrdersLayout'
import OrderDetailPage from '../pages/OrderDetailPage'
import InvoiceManagementPage from '../pages/InvoiceManagementPage'
import ReviewsPage from '../pages/ReviewsPage'
import EmailCampaignsPage from '../pages/EmailCampaignsPage'
import NotificationsPage from '../pages/NotificationsPage'
import SettingsPage from '../pages/SettingsPage'
import EventsPage from '../pages/EventsPage'
import EventFormPage from '../pages/EventFormPage'
import EventBookingsPage from '../pages/EventBookingsPage'
import { getAdminMe } from '../services/api'
import { resources } from './resources'

const orderPaths = ['orders', 'orders/pending-payment', 'orders/pending', 'orders/confirmed', 'orders/packing', 'orders/dispatched', 'orders/out-for-delivery', 'orders/delivered', 'orders/cancelled', 'orders/rto', 'orders/returned']

function AuthGuard() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getAdminMe()
      .then(() => setChecking(false))
      .catch(() => navigate('/login', { replace: true }))
  }, [navigate])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--burgundy)]" />
      </div>
    )
  }

  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          {resources.map(resource => {
            if (resource.path === '/orders') return null
            const basePath = resource.path.replace('/', '')
            if (basePath === 'categories' || basePath === 'products') return null
            return (
              <Fragment key={resource.path}>
                <Route path={basePath} element={basePath === 'coupons' ? <CouponsListPage /> : <ResourceListPage config={resource} />} />
                <Route 
                  path={`${basePath}/new`} 
                  element={
                    basePath === 'announcements' 
                      ? <AnnouncementFormPage /> 
                      : basePath === 'banners'
                        ? <BannerFormPage />
                  : basePath === 'categories'
                    ? <CategoryFormPage />
                    : basePath === 'products'
                      ? <ProductFormPage />
                      : basePath === 'coupons'
                        ? <CouponFormPage />
                        : <ResourceFormPage config={resource} />
                } 
              />
              <Route 
                path={`${basePath}/edit/:id`} 
                element={
                  basePath === 'announcements' 
                    ? <AnnouncementFormPage /> 
                    : basePath === 'banners'
                      ? <BannerFormPage />
                      : basePath === 'categories'
                        ? <CategoryFormPage />
                        : basePath === 'products'
                          ? <ProductFormPage />
                          : basePath === 'coupons'
                            ? <CouponFormPage />
                            : <ResourceFormPage config={resource} />
                } 
              />
              </Fragment>
            )
          })}
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<CategoryFormPage />} />
          <Route path="categories/edit/:id" element={<CategoryFormPage />} />
          <Route path="products" element={<ProductsListPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/edit/:id" element={<ProductFormPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="guest-coupon" element={<GuestCouponPage />} />
          <Route path="invoices" element={<InvoiceManagementPage />} />
          <Route path="subcategories" element={<SubcategoriesPage />} />
          <Route path="subcategories/new" element={<SubcategoriesPage />} />
          <Route path="subcategories/edit/:id" element={<SubcategoriesPage />} />
          <Route path="child-categories" element={<SubcategoriesPage level="child" />} />
          <Route path="child-categories/new" element={<SubcategoriesPage level="child" />} />
          <Route path="child-categories/edit/:id" element={<SubcategoriesPage level="child" />} />
          <Route path="variants" element={<VariantsPage />} />
          <Route path="stock" element={<StockPage />} />
          <Route path="email-campaigns" element={<EmailCampaignsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/new" element={<EventFormPage />} />
        <Route path="events/:id" element={<EventFormPage />} />
        <Route path="events/:eventId/bookings" element={<EventBookingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Order pipeline routes */}
          {orderPaths.map(path => (
            <Route key={path} path={path} element={<OrdersLayout />} />
          ))}
          <Route path="orders/:id" element={<OrderDetailPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
