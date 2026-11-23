import app from './app.js';
import config from './config/index.js';
import connectDatabase from './config/database.js';

let server;

const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDatabase();

    // 2. Start HTTP server
    server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`🚀 PrivateDelights API server running on port: ${config.port}`);
      console.log(`🌍 Environment: ${config.env}`);
      console.log(`📡 Base API URL: http://localhost:${config.port}/api/v1`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] Shutting down...', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Handle Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Graceful termination
process.on('SIGTERM', () => {
  console.log('[SIGTERM RECEIVED] Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated.');
    });
  }
});

startServer();
