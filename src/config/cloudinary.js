import { v2 as cloudinary } from 'cloudinary';
import config from './index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: true
});

export const isCloudinaryConfigured = () => {
  return Boolean(
    config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret &&
    config.cloudinary.cloudName !== 'your_cloud_name'
  );
};

export default cloudinary;
