import cron from 'node-cron';
import SyncService from '../services/SyncService';
import { createLogger, format, transports } from 'winston';

// Configure Winston logger for scheduler
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'sync-scheduler' },
  transports: [
    new transports.File({ filename: 'logs/scheduler-error.log', level: 'error' }),
    new transports.File({ filename: 'logs/scheduler.log' }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
});

export class SyncScheduler {
  private syncService: SyncService;
  private syncJob?: import('node-cron').ScheduledTask;
  private cleanupJob?: import('node-cron').ScheduledTask;

  constructor() {
    this.syncService = new SyncService();
  }

  /**
   * Start the scheduled jobs
   */
  start(): void {
    logger.info('Starting sync scheduler...');

    // Schedule daily sync at 12 PM
    this.syncJob = cron.schedule('* 12 * * *', async () => {
      await this.runDailySync();
    }, {
      timezone: 'Asia/Kathmandu'
    });

    // Schedule cleanup job to run every Sunday at 2 AM
    this.cleanupJob = cron.schedule('0 2 * * 0', async () => {
      await this.runCleanup();
    }, {
      timezone: 'UTC'
    });

    logger.info('Sync scheduler started successfully');
    logger.info('Daily sync scheduled for 12:00 PM UTC');
    logger.info('Cleanup job scheduled for Sundays at 2:00 AM UTC');
  }

  /**
   * Stop the scheduled jobs
   */
  stop(): void {
    logger.info('Stopping sync scheduler...');
    
    if (this.syncJob) {
      this.syncJob.stop();
      logger.info('Daily sync job stopped');
    }

    if (this.cleanupJob) {
      this.cleanupJob.stop();
      logger.info('Cleanup job stopped');
    }

    logger.info('Sync scheduler stopped');
  }

  /**
   * Run the daily sync process
   */
  private async runDailySync(): Promise<void> {
    const startTime = new Date();
    logger.info('Starting daily sync process...');

    try {
      // Test connection first
      const isConnected = await this.syncService.testConnection();
      if (!isConnected) {
        logger.error('WooCommerce connection failed, skipping sync');
        return;
      }

      // Run the sync
      const result = await this.syncService.syncOrders();
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      logger.info('Daily sync completed successfully', {
        synced: result.synced,
        errors: result.errors,
        duration: `${duration}ms`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

      // Get sync statistics
      const stats = await this.syncService.getSyncStats();
      logger.info('Sync statistics', stats);

    } catch (error) {
      logger.error('Daily sync failed:', error);
      
      // You could add notification logic here (email, Slack, etc.)
      // await this.sendNotification('Daily sync failed', error);
    }
  }

  /**
   * Run the cleanup process
   */
  private async runCleanup(): Promise<void> {
    const startTime = new Date();
    logger.info('Starting cleanup process...');

    try {
      const result = await this.syncService.cleanupOldOrders();
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      logger.info('Cleanup completed successfully', {
        deletedOrders: result.deletedOrders,
        deletedProducts: result.deletedProducts,
        duration: `${duration}ms`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      });

    } catch (error) {
      logger.error('Cleanup failed:', error);
      
      // TODO: add notification logic here (email, Slack, etc.)
    }
  }

  /**
   * Manually trigger a sync (for testing or manual runs)
   */
  async triggerManualSync(): Promise<{ synced: number; errors: number }> {
    logger.info('Manual sync triggered');
    return await this.syncService.syncOrders();
  }

  /**
   * Manually trigger cleanup (for testing or manual runs)
   */
  async triggerManualCleanup(): Promise<{ deletedOrders: number; deletedProducts: number }> {
    logger.info('Manual cleanup triggered');
    return await this.syncService.cleanupOldOrders();
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean;
    nextSyncTime?: string;
    nextCleanupTime?: string;
  } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);

    const nextSunday = new Date(now);
    const daysUntilSunday = (7 - nextSunday.getDay()) % 7;
    nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
    nextSunday.setHours(2, 0, 0, 0);

    return {
      isRunning: !!(this.syncJob && this.cleanupJob),
      nextSyncTime: tomorrow.toISOString(),
      nextCleanupTime: nextSunday.toISOString()
    };
  }
}

export default SyncScheduler; 