import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import SyncScheduler from './jobs/SyncScheduler';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});


// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || '';
if (!mongoUri) {
  throw new Error('MONGODB_URI is not set in environment variables');
}

// Instantiate the sync scheduler
const syncScheduler = new SyncScheduler();

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    // Start the sync scheduler after DB connection
    syncScheduler.start();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Gracefully stop the scheduler on process exit
process.on('SIGINT', () => {
  syncScheduler.stop();
  process.exit();
});
process.on('SIGTERM', () => {
  syncScheduler.stop();
  process.exit();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 