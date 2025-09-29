import { Hono } from 'hono';
import { collaborationService } from '../services/collaboration.service';
import { authMiddleware } from '../helpers/auth.helpers';

const collaboration = new Hono();

// Apply auth middleware to all routes
collaboration.use('*', authMiddleware);

// Get comments for an entity
collaboration.get('/comments/:entityType/:entityId', async (c) => {
  try {
    const { entityType, entityId } = c.req.param();
    
    const comments = await collaborationService.getComments(entityType, entityId);
    
    return c.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    return c.json({
      success: false,
      error: 'Failed to get comments',
    }, 500);
  }
});

// Create a new comment
collaboration.post('/comments', async (c) => {
  try {
    const body = await c.req.json();
    const { content, entityType, entityId, parentId, mentions } = body;
    const userId = c.get('userId');

    if (!content || !entityType || !entityId) {
      return c.json({
        success: false,
        error: 'Missing required fields',
      }, 400);
    }

    const comment = await collaborationService.createComment({
      content,
      authorId: userId,
      entityType,
      entityId,
      parentId,
      mentions,
    });

    return c.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return c.json({
      success: false,
      error: 'Failed to create comment',
    }, 500);
  }
});

// Update a comment
collaboration.put('/comments/:commentId', async (c) => {
  try {
    const { commentId } = c.req.param();
    const { content } = await c.req.json();
    const userId = c.get('userId');

    if (!content) {
      return c.json({
        success: false,
        error: 'Content is required',
      }, 400);
    }

    // TODO: Add authorization check to ensure user can edit this comment
    const comment = await collaborationService.updateComment(commentId, content);

    return c.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return c.json({
      success: false,
      error: 'Failed to update comment',
    }, 500);
  }
});

// Delete a comment
collaboration.delete('/comments/:commentId', async (c) => {
  try {
    const { commentId } = c.req.param();
    const userId = c.get('userId');

    // TODO: Add authorization check to ensure user can delete this comment
    await collaborationService.deleteComment(commentId);

    return c.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({
      success: false,
      error: 'Failed to delete comment',
    }, 500);
  }
});

// Get user notifications
collaboration.get('/notifications', async (c) => {
  try {
    const userId = c.get('userId');
    
    const notifications = await collaborationService.getUserNotifications(userId);
    
    return c.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return c.json({
      success: false,
      error: 'Failed to get notifications',
    }, 500);
  }
});

// Get unread notification count
collaboration.get('/notifications/unread-count', async (c) => {
  try {
    const userId = c.get('userId');
    
    const count = await collaborationService.getUnreadNotificationCount(userId);
    
    return c.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return c.json({
      success: false,
      error: 'Failed to get unread notification count',
    }, 500);
  }
});

// Mark notification as read
collaboration.put('/notifications/:notificationId/read', async (c) => {
  try {
    const { notificationId } = c.req.param();
    const userId = c.get('userId');

    // TODO: Add authorization check to ensure user can mark this notification as read
    await collaborationService.markNotificationAsRead(notificationId);

    return c.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({
      success: false,
      error: 'Failed to mark notification as read',
    }, 500);
  }
});

// Mark all notifications as read
collaboration.put('/notifications/read-all', async (c) => {
  try {
    const userId = c.get('userId');
    
    await collaborationService.markAllNotificationsAsRead(userId);
    
    return c.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return c.json({
      success: false,
      error: 'Failed to mark all notifications as read',
    }, 500);
  }
});

export default collaboration;
