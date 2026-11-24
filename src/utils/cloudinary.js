import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';
import config from '../config/index.js';
import AppError from './AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicUploadsDir = path.join(__dirname, '../../public/uploads');

export const uploadBufferToStorage = async (buffer, originalname = 'image.jpg', options = {}) => {
  // 1. If Cloudinary credentials are provided, upload to Cloudinary
  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        folder: 'privatedelights',
        resource_type: 'auto',
        ...options
      };

      const stream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) {
            return reject(new AppError(500, `Cloudinary upload failed: ${error.message}`));
          }
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            storage: 'cloudinary'
          });
        }
      );

      stream.end(buffer);
    });
  }

  // 2. Fallback: Save locally if Cloudinary credentials are not configured yet
  await fs.promises.mkdir(publicUploadsDir, { recursive: true });
  const ext = path.extname(originalname) || '.jpg';
  const uniqueName = `upload-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(publicUploadsDir, uniqueName);

  await fs.promises.writeFile(filePath, buffer);

  const localUrl = `http://localhost:${config.port}/uploads/${uniqueName}`;

  return {
    url: localUrl,
    public_id: uniqueName,
    format: ext.replace('.', ''),
    bytes: buffer.length,
    storage: 'local'
  };
};

export const deleteFromStorage = async (publicId) => {
  if (isCloudinaryConfigured() && publicId && !publicId.startsWith('upload-')) {
    try {
      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, error.message);
      return null;
    }
  }

  // If local file
  if (publicId && publicId.startsWith('upload-')) {
    const filePath = path.join(publicUploadsDir, publicId);
    if (fs.existsSync(filePath)) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('[LocalStorage] Failed to delete file:', err.message);
      }
    }
  }

  return null;
};

// Aliases for compatibility
export const uploadBufferToCloudinary = uploadBufferToStorage;
export const deleteFromCloudinary = deleteFromStorage;
