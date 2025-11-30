import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { seedDatabase } from './scripts/init';
import authRoutes from './routes/authRoutes';
import licensePlateRoutes from './routes/licensePlateRoutes';
import collectionRoutes from './routes/collectionRoutes';
import statisticsRoutes from './routes/statisticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use(express.json());

// Database check middleware
app.use((req, res, next) => {
  if (!AppDataSource.isInitialized && req.path !== '/health') {
    console.error('Database not initialized');
    return res.status(503).json({ error: 'Database not initialized' });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/license-plates', licensePlateRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/statistics', statisticsRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: AppDataSource.isInitialized ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (must be last)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Database initialized');
    
    // Seed database if needed
    try {
      await seedDatabase();
    } catch (error) {
      console.error('Failed to seed database:', error);
      // Don't exit, continue with server startup
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization error:', error);
    process.exit(1);
  });

