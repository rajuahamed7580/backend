import dotenv from 'dotenv';
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/privatedelights',
  jwt: {
    secret: process.env.JWT_SECRET || 'privatedelights_super_secret_jwt_key_2026_xyz',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  superAdmin: {
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@privatedelights.com',
    password: process.env.SUPER_ADMIN_PASSWORD || 'AdminPassword123!'
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  clientUrls: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : ['http://localhost:3000', 'http://localhost:5173']
};

export default config;
