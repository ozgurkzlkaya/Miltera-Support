import { Hono } from 'hono';
import { backupService } from '../services/backup.service';
import { authMiddleware } from '../helpers/auth.helpers';

const backup = new Hono();

// Apply auth middleware to all routes
backup.use('*', authMiddleware);

// Create full backup
backup.post('/full', async (c) => {
  try {
    const body = await c.req.json();
    const options = body.options || {};
    
    const result = await backupService.createFullBackup(options);
    
    return c.json({
      success: true,
      backup: result,
    });
  } catch (error) {
    console.error('Error creating full backup:', error);
    return c.json({
      success: false,
      error: 'Failed to create full backup',
    }, 500);
  }
});

// Create table backup
backup.post('/table/:tableName', async (c) => {
  try {
    const { tableName } = c.req.param();
    const body = await c.req.json();
    const options = body.options || {};
    
    const result = await backupService.createTableBackup(tableName, options);
    
    return c.json({
      success: true,
      backup: result,
    });
  } catch (error) {
    console.error('Error creating table backup:', error);
    return c.json({
      success: false,
      error: 'Failed to create table backup',
    }, 500);
  }
});

// List all backups
backup.get('/list', async (c) => {
  try {
    const backups = await backupService.listBackups();
    
    return c.json({
      success: true,
      backups,
    });
  } catch (error) {
    console.error('Error listing backups:', error);
    return c.json({
      success: false,
      error: 'Failed to list backups',
    }, 500);
  }
});

// Delete backup
backup.delete('/:filename', async (c) => {
  try {
    const { filename } = c.req.param();
    
    await backupService.deleteBackup(filename);
    
    return c.json({
      success: true,
      message: 'Backup deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return c.json({
      success: false,
      error: 'Failed to delete backup',
    }, 500);
  }
});

// Cleanup old backups
backup.post('/cleanup', async (c) => {
  try {
    const body = await c.req.json();
    const keepDays = body.keepDays || 30;
    
    const deletedCount = await backupService.cleanupOldBackups(keepDays);
    
    return c.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old backups`,
    });
  } catch (error) {
    console.error('Error cleaning up backups:', error);
    return c.json({
      success: false,
      error: 'Failed to cleanup old backups',
    }, 500);
  }
});

// Get backup size
backup.get('/:filename/size', async (c) => {
  try {
    const { filename } = c.req.param();
    
    const size = await backupService.getBackupSize(filename);
    
    return c.json({
      success: true,
      size,
    });
  } catch (error) {
    console.error('Error getting backup size:', error);
    return c.json({
      success: false,
      error: 'Failed to get backup size',
    }, 500);
  }
});

export default backup;
