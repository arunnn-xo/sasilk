import { Router } from 'express'
import multer from 'multer'
import path from 'node:path'
import crypto from 'node:crypto'
import { requireAdminAuth } from '../../middleware/auth.js'
import { AppError, asyncHandler } from '../../utils/http.js'
import { UPLOADS_DIR } from './controllers/upload.controller.js'

// Import controllers
import { getDashboardStats, getSalesStats, getSalesBreakdown, getTopSellingProducts } from './controllers/dashboard.controller.js'
import { uploadFile, deleteUploadedFile, uploadVideoFile } from './controllers/upload.controller.js'
import {
  getProductVariants,
  createProductVariant,
  getProductVariantById,
  updateProductVariant,
  deleteProductVariant,
  setVariantDefault,
  uploadVariantImage,
  deleteVariantImage,
  uploadVariantMainImage,
  reorderVariantImages,
  getAllVariants,
  getStockList,
  updateStockBatch,
  adjustStock,
  getProductImages,
  uploadProductImage,
  deleteProductImage,
  reorderProductImages,
  createProduct,
  importProducts,
  downloadSampleImport,
  importVariants,
  downloadVariantImportSample,
} from './controllers/product.controller.js'
import {
  getPipelineCounts,
  getPipelineStage,
  getOrderDetail,
  transitionOrder,
  getOrderPdf,
  getConfirmedAddressesPdf,
  sendRecoveryEmail,
} from './controllers/order.controller.js'
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  listBookings,
  checkIn,
  toggleCheckIn,
} from './controllers/event.controller.js'
import {
  createInvoice,
  regenerateInvoice,
  syncInvoice,
  getInvoice,
  getInvoices,
  getInvoicePdf,
  updateInvoiceStatus,
  bulkCreateInvoices,
  exportInvoicesExcel,
  sendInvoiceEmailHandler,
  getOrderInvoicePdf,
} from './controllers/invoice.controller.js'
import {
  getReviews,
  moderateReview,
  deleteReview,
} from './controllers/review.controller.js'
import {
  getCouponUsages,
  getTopCustomers,
  listResource,
  createResource,
  getResourceById,
  updateResource,
  deleteResource,
} from './controllers/resource.controller.js'


function hashedFilename(originalName: string): string {
  const ext = path.extname(originalName) || '.jpg'
  const hash = crypto.randomBytes(12).toString('hex')
  return `${hash}${ext}`
}

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    cb(null, hashedFilename(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError(422, 'Only JPEG, PNG, and WebP images are allowed.'))
    }
  },
})

const uploadExcel = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
      'application/csv',
    ]
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(file.mimetype) || ext === '.csv' || ext === '.xlsx' || ext === '.xls') {
      cb(null, true)
    } else {
      cb(new AppError(422, 'Only Excel (.xlsx, .xls) and CSV files are allowed.'))
    }
  },
})

const uploadVideo = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError(422, 'Only MP4, WebM, and MOV video files are allowed.'))
    }
  },
})

const router = Router()

router.use(requireAdminAuth)

// Dashboard
router.get('/dashboard', asyncHandler(getDashboardStats))
router.get('/dashboard/sales', asyncHandler(getSalesStats))
router.get('/dashboard/sales/products', asyncHandler(getSalesBreakdown))
router.get('/dashboard/top-products', asyncHandler(getTopSellingProducts))

// Uploads
router.post('/uploads', upload.single('file'), asyncHandler(uploadFile))
router.post('/uploads/video', uploadVideo.single('file'), asyncHandler(uploadVideoFile))
router.delete('/uploads/:filename', asyncHandler(deleteUploadedFile))

// Variant Endpoints
router.get('/products/:productId/variants', asyncHandler(getProductVariants))
router.post('/products/:productId/variants', asyncHandler(createProductVariant))
router.get('/products/:productId/variants/:variantId', asyncHandler(getProductVariantById))
router.put('/products/:productId/variants/:variantId', asyncHandler(updateProductVariant))
router.delete('/products/:productId/variants/:variantId', asyncHandler(deleteProductVariant))
router.put('/products/:productId/variants/:variantId/set-default', asyncHandler(setVariantDefault))
router.post('/products/:productId/variants/:variantId/images', upload.single('file'), asyncHandler(uploadVariantImage))
router.delete('/products/:productId/variants/:variantId/images/:imageId', asyncHandler(deleteVariantImage))
router.put('/products/:productId/variants/:variantId/main-image', upload.single('file'), asyncHandler(uploadVariantMainImage))
router.put('/products/:productId/variants/:variantId/images/reorder', asyncHandler(reorderVariantImages))

// Standalone Variant & Stock Endpoints
router.get('/variants', asyncHandler(getAllVariants))
router.get('/stock', asyncHandler(getStockList))
router.put('/stock/batch', asyncHandler(updateStockBatch))
router.post('/stock/adjust', asyncHandler(adjustStock))

// Product Gallery Image Endpoints
router.get('/products/:productId/images', asyncHandler(getProductImages))
router.post('/products/:productId/images', upload.single('file'), asyncHandler(uploadProductImage))
router.delete('/products/:productId/images/:imageId', asyncHandler(deleteProductImage))
router.put('/products/:productId/images/reorder', asyncHandler(reorderProductImages))

// Order Pipeline Endpoints
router.get('/orders/pipeline/counts', asyncHandler(getPipelineCounts))
router.get('/orders/pipeline/:stage', asyncHandler(getPipelineStage))
router.get('/orders/:id/detail', asyncHandler(getOrderDetail))
router.put('/orders/:id/transition', asyncHandler(transitionOrder))
router.get('/orders/confirmed/addresses/pdf', asyncHandler(getConfirmedAddressesPdf))
router.get('/orders/:id/pdf', asyncHandler(getOrderPdf))
router.post('/orders/:id/send-recovery-email', asyncHandler(sendRecoveryEmail))

// Invoice Endpoints
router.post('/orders/:id/invoice', asyncHandler(createInvoice))
router.put('/orders/:id/invoice/regenerate', asyncHandler(regenerateInvoice))
router.put('/orders/:id/invoice/sync-status', asyncHandler(syncInvoice))
router.get('/orders/:id/invoice', asyncHandler(getInvoice))

// Invoice Management
router.get('/invoices', asyncHandler(getInvoices))
router.get('/invoices/:id/pdf', asyncHandler(getInvoicePdf))
router.put('/invoices/:id/status', asyncHandler(updateInvoiceStatus))
router.post('/invoices/bulk', asyncHandler(bulkCreateInvoices))
router.get('/invoices/export/excel', asyncHandler(exportInvoicesExcel))
router.post('/invoices/:id/send-email', asyncHandler(sendInvoiceEmailHandler))
router.get('/orders/:id/invoice/pdf', asyncHandler(getOrderInvoicePdf))

// Coupon usages
router.get('/coupons/:id/usages', asyncHandler(getCouponUsages))
router.get('/coupons/top-customers', asyncHandler(getTopCustomers))

// Reviews
router.get('/reviews', asyncHandler(getReviews))
router.put('/reviews/:id/moderate', asyncHandler(moderateReview))
router.delete('/reviews/:id', asyncHandler(deleteReview))

// Product create with auto-default-variant (interceptor before generic post('/:resource'))
router.post('/products', asyncHandler(createProduct))

// Product Import
router.get('/products/import/sample', asyncHandler(downloadSampleImport))
router.post('/products/import', uploadExcel.single('file'), asyncHandler(importProducts))

// Variant Import
router.get('/products/variants/import/sample', asyncHandler(downloadVariantImportSample))
router.post('/products/variants/import', uploadExcel.single('file'), asyncHandler(importVariants))

// Events (Book Now) — registered before the generic /:resource catch-all
router.get('/events', asyncHandler(listEvents))
router.post('/events', asyncHandler(createEvent))
router.get('/events/:id', asyncHandler(getEvent))
router.put('/events/:id', asyncHandler(updateEvent))
router.delete('/events/:id', asyncHandler(deleteEvent))
router.get('/events/:id/bookings', asyncHandler(listBookings))
router.post('/events/:id/checkin', asyncHandler(checkIn))
router.put('/events/bookings/:bookingId/check-in', asyncHandler(toggleCheckIn))

// Generic Resource Endpoints
router.get('/:resource', asyncHandler(listResource))
router.post('/:resource', asyncHandler(createResource))
router.get('/:resource/:id', asyncHandler(getResourceById))
router.put('/:resource/:id', asyncHandler(updateResource))
router.delete('/:resource/:id', asyncHandler(deleteResource))

export default router
