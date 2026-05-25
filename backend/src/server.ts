import express from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { connectDB, connectRedis, closeConnections } from './config/db';
import { wsManager } from './services/websocket';
import { initializeQueue, shutdownQueue } from './queues/generationQueue';
import assignmentRoutes from './routes/assignments';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Ensure uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  },
});

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || '*');
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/assignments', assignmentRoutes);

// File upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ fileUrl, filename: req.file.originalname });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
async function startServer(): Promise<void> {
  // Connect to databases
  await connectDB();
  await connectRedis();

  // Initialize job queue
  initializeQueue();

  // Create HTTP server
  const server = http.createServer(app);

  // Initialize WebSocket
  wsManager.initialize(server);

  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║                                          ║
║   VedaAI Backend Server                 ║
║   Running on http://localhost:${PORT}      ║
║   WebSocket on ws://localhost:${PORT}/ws   ║
║                                          ║
╚══════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n Shutting down server...');
    shutdownQueue();
    wsManager.shutdown();
    await closeConnections();
    server.close(() => {
      console.log(' Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
