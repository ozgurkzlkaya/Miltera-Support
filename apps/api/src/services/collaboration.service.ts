import { db } from '../db';
import { comments, mentions, notifications } from '../db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  entityType: string;
  entityId: string;
  parentId?: string;
  mentions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Mention {
  id: string;
  commentId: string;
  userId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'comment' | 'reply';
  entityType: string;
  entityId: string;
  commentId?: string;
  isRead: boolean;
  createdAt: Date;
}

export class CollaborationService {
  /**
   * Yeni yorum oluşturur
   */
  async createComment(data: {
    content: string;
    authorId: string;
    entityType: string;
    entityId: string;
    parentId?: string;
    mentions?: string[];
  }): Promise<Comment> {
    try {
      const result = await db.insert(comments).values({
        content: data.content,
        authorId: data.authorId,
        entityType: data.entityType,
        entityId: data.entityId,
        parentId: data.parentId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      const comment = result[0];

      // Mentions ekle
      if (data.mentions && data.mentions.length > 0) {
        await this.addMentions(comment.id, data.mentions);
      }

      // Bildirimler oluştur
      await this.createNotifications(comment, data.mentions);

      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw new Error('Failed to create comment');
    }
  }

  /**
   * Yorumları listeler
   */
  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    try {
      const result = await db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.entityType, entityType),
            eq(comments.entityId, entityId)
          )
        )
        .orderBy(desc(comments.createdAt));

      return result;
    } catch (error) {
      console.error('Error getting comments:', error);
      throw new Error('Failed to get comments');
    }
  }

  /**
   * Yorumu günceller
   */
  async updateComment(commentId: string, content: string): Promise<Comment> {
    try {
      const result = await db
        .update(comments)
        .set({
          content,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, commentId))
        .returning();

      return result[0];
    } catch (error) {
      console.error('Error updating comment:', error);
      throw new Error('Failed to update comment');
    }
  }

  /**
   * Yorumu siler
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      // Önce mentions'ları sil
      await db.delete(mentions).where(eq(mentions.commentId, commentId));
      
      // Sonra yorumu sil
      await db.delete(comments).where(eq(comments.id, commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw new Error('Failed to delete comment');
    }
  }

  /**
   * Mentions ekler
   */
  private async addMentions(commentId: string, userIds: string[]): Promise<void> {
    try {
      const mentionData = userIds.map(userId => ({
        commentId,
        userId,
        createdAt: new Date(),
      }));

      await db.insert(mentions).values(mentionData);
    } catch (error) {
      console.error('Error adding mentions:', error);
      throw new Error('Failed to add mentions');
    }
  }

  /**
   * Bildirimler oluşturur
   */
  private async createNotifications(comment: Comment, mentions?: string[]): Promise<void> {
    try {
      const notificationData = [];

      // Mention bildirimleri
      if (mentions && mentions.length > 0) {
        for (const userId of mentions) {
          if (userId !== comment.authorId) {
            notificationData.push({
              userId,
              type: 'mention' as const,
              entityType: comment.entityType,
              entityId: comment.entityId,
              commentId: comment.id,
              isRead: false,
              createdAt: new Date(),
            });
          }
        }
      }

      // Yorum bildirimleri (entity sahibi için)
      // Bu kısım entity sahibini belirlemek için ek logic gerektirir
      // Şimdilik basit bir implementasyon

      if (notificationData.length > 0) {
        await db.insert(notifications).values(notificationData);
      }
    } catch (error) {
      console.error('Error creating notifications:', error);
      throw new Error('Failed to create notifications');
    }
  }

  /**
   * Kullanıcının bildirimlerini getirir
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const result = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));

      return result;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw new Error('Failed to get user notifications');
    }
  }

  /**
   * Okunmamış bildirim sayısını getirir
   */
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
          )
        );

      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw new Error('Failed to get unread notification count');
    }
  }

  /**
   * Bildirimi okundu olarak işaretler
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Tüm bildirimleri okundu olarak işaretler
   */
  async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }
}

export const collaborationService = new CollaborationService();
