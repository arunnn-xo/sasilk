import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'

export function getCloudinaryConfig() {
  const envCloudName = process.env.CLOUDINARY_CLOUD_NAME
  const cloud_name = (!envCloudName || envCloudName.trim().toLowerCase() === 'root')
    ? 'dwn1w1hof'
    : envCloudName.trim()

  const api_key = process.env.CLOUDINARY_API_KEY || '999916596537249'
  const api_secret = process.env.CLOUDINARY_API_SECRET || 'oqPQeePYXmbxR_dYIIV9RwNaaRU'

  return { cloud_name, api_key, api_secret }
}

// Initial config
const initialConfig = getCloudinaryConfig()
cloudinary.config({
  cloud_name: initialConfig.cloud_name,
  api_key: initialConfig.api_key,
  api_secret: initialConfig.api_secret,
  secure: true,
})

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'sasilk'
): Promise<{ secure_url: string; public_id: string; width: number; height: number }> {
  // Ensure config is always active and fresh
  const cfg = getCloudinaryConfig()
  cloudinary.config({
    cloud_name: cfg.cloud_name,
    api_key: cfg.api_key,
    api_secret: cfg.api_secret,
    secure: true,
  })

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) {
          console.error('[Cloudinary] Upload error:', error)
          return reject(new Error(error.message || 'Cloudinary upload failed'))
        }
        if (!result) return reject(new Error('No response from Cloudinary'))
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          width: result.width || 0,
          height: result.height || 0,
        })
      }
    )
    const readable = new Readable()
    readable.push(buffer)
    readable.push(null)
    readable.pipe(uploadStream)
  })
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const cfg = getCloudinaryConfig()
    cloudinary.config({
      cloud_name: cfg.cloud_name,
      api_key: cfg.api_key,
      api_secret: cfg.api_secret,
      secure: true,
    })
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error('[Cloudinary] Delete error:', err)
  }
}

export default cloudinary
