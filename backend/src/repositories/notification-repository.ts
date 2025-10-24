import { Pool } from 'pg';
import { PaginationOptions, PaginatedResult } from './base-repository';
import { Notification, NotificationType, NotificationStatus } from '../models/notification';

export interface NotificationFilter {
  recipientId?: string;
  senderId?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  unreadOnly?: boolean;
  scheduledBefore?: Date;
  scheduledAfter?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
}

export class NotificationRepository {
  protected pool: Pool;
  protected tableName: string = 'notifications';
  protected primaryKey: string = 'notification_id';

  constructor(pool: Pool) {
    this.pool = pool;
  }

  protected mapRowToEntity(row: any): Notification {
    return new Notification(row);
  }

  async findById(id: string): Promise<Notification | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async create(notification: Notification): Promise<Notification> {
    const query = `
      INSERT INTO ${this.tableName} (
        notification_id, recipient_id, sender_id, type, title, content,
        status, metadata, scheduled_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      notification.notificationId,
      notification.recipientId,
      notification.senderId,
      notification.type,
      notification.title,
      notification.content,
      notification.status,
      notification.metadata ? JSON.stringify(notification.metadata) : null,
      notification.scheduledAt
    ];
    
    const result = await this.pool.query(query, values);
    return this.mapRowToEntity(result.rows[0]);
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async findByRecipient(
    recipientId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Notification> & { total?: number; page?: number; limit?: number; totalPages?: number }> {
    return this.findByFilter({ recipientId }, options);
  }

  async findUnreadByRecipient(recipientId: string): Promise<Notification[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE recipient_id = $1 AND read_at IS NULL
      ORDER BY created_at DESC
    `;
    
    const result = await this.pool.query(query, [recipientId]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async findByFilter(
    filter: NotificationFilter,
    options?: PaginationOptions
  ): Promise<PaginatedResult<Notification> & { total?: number; page?: number; limit?: number; totalPages?: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (filter.recipientId) {
      conditions.push(`recipient_id = $${paramIndex++}`);
      params.push(filter.recipientId);
    }

    if (filter.senderId) {
      conditions.push(`sender_id = $${paramIndex++}`);
      params.push(filter.senderId);
    }

    if (filter.type) {
      conditions.push(`type = $${paramIndex++}`);
      params.push(filter.type);
    }

    if (filter.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filter.status);
    }

    if (filter.unreadOnly) {
      conditions.push('read_at IS NULL');
    }

    if (filter.scheduledBefore) {
      conditions.push(`scheduled_at <= $${paramIndex++}`);
      params.push(filter.scheduledBefore);
    }

    if (filter.scheduledAfter) {
      conditions.push(`scheduled_at >= $${paramIndex++}`);
      params.push(filter.scheduledAfter);
    }

    if (filter.createdAfter) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filter.createdAfter);
    }

    if (filter.createdBefore) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filter.createdBefore);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 計算總數
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;
    const countResult = await this.pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // 查詢資料
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT * FROM ${this.tableName}
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    
    const dataResult = await this.pool.query(dataQuery, [...params, limit, offset]);
    const data = dataResult.rows.map(row => this.mapRowToEntity(row));

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      },
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findPendingScheduled(): Promise<Notification[]> {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE status = $1 
        AND scheduled_at IS NOT NULL 
        AND scheduled_at <= NOW()
      ORDER BY scheduled_at ASC
    `;
    
    const result = await this.pool.query(query, [NotificationStatus.PENDING]);
    return result.rows.map(row => this.mapRowToEntity(row));
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    const query = `
      UPDATE ${this.tableName}
      SET status = $1, read_at = NOW(), updated_at = NOW()
      WHERE ${this.primaryKey} = $2
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [NotificationStatus.READ, notificationId]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const query = `
      UPDATE ${this.tableName}
      SET status = $1, read_at = NOW(), updated_at = NOW()
      WHERE recipient_id = $2 AND read_at IS NULL
    `;
    
    const result = await this.pool.query(query, [NotificationStatus.READ, recipientId]);
    return result.rowCount || 0;
  }

  async updateStatus(
    notificationId: string,
    status: NotificationStatus,
    sentAt?: Date
  ): Promise<Notification | null> {
    const updates: string[] = ['status = $1', 'updated_at = NOW()'];
    const params: any[] = [status, notificationId];
    let paramIndex = 3;

    if (sentAt && status === NotificationStatus.SENT) {
      updates.push(`sent_at = $${paramIndex++}`);
      params.splice(2, 0, sentAt);
    }

    const query = `
      UPDATE ${this.tableName}
      SET ${updates.join(', ')}
      WHERE ${this.primaryKey} = $2
      RETURNING *
    `;
    
    const result = await this.pool.query(query, params);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0]) : null;
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) FROM ${this.tableName}
      WHERE recipient_id = $1 AND read_at IS NULL
    `;
    
    const result = await this.pool.query(query, [recipientId]);
    return parseInt(result.rows[0].count);
  }

  async deleteOldNotifications(daysOld: number): Promise<number> {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
        AND status = $1
    `;
    
    const result = await this.pool.query(query, [NotificationStatus.READ]);
    return result.rowCount || 0;
  }
}
