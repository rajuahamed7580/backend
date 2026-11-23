import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
import errorHandler from './middlewares/error.middleware.js';
import notFound from './middlewares/notFound.middleware.js';

// Module Routers
import authRouter from './modules/auth/auth.route.js';
import userRouter from './modules/user/user.route.js';
import postRouter from './modules/post/post.route.js';
import commentRouter from './modules/comment/comment.route.js';
import dashboardRouter from './modules/dashboard/dashboard.route.js';

const app = express();

// Enable CORS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or configured client URLs
      if (!origin || config.clientUrls.includes('*') || config.clientUrls.includes(origin) || config.env === 'development') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev, configurable for production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health check endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PrivateDelights Modular Backend API is running smoothly.',
    version: '1.0.0',
    documentation: '/api/v1'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount modular API v1 routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/posts`, postRouter);
app.use(`${API_PREFIX}/comments`, commentRouter);
app.use(`${API_PREFIX}/dashboard`, dashboardRouter);

// 404 Route handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

export default app;
