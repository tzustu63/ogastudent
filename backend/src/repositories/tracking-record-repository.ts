import { Pool } from 'pg';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base-repository';
import { TrackingRecord, ActionType } from '../models/tracking-record';

export interface TrackingFilter {
  student_id?: string;
  document_id?: string;
  user_id?: string;
  action_type?: ActionType;
  date_from?: Date;
  date_to?: Date;
  ip_address?: string;
}

export class TrackingRecordRepository extends BaseRepository<TrackingRecord> {
  constructor(pool: Pool) {
    super(pool, 'tracking_records', 'record_id');
  }

  protected createEntityFromRow(row: any): TrackingRecord {
    return TrackingRecord.fromDatabase(row);
  }

  protected getInsertableFields(): string[] {
    return [
      'record_id',
      'student_id',
      'document_id',
      'user_id',
      'action_type',
      'description',
      'metadata',
      'ip_address',
      'user_agent'
    ];
  }

  protected getUpdatableFields(): string[] {
    return []; // 追蹤記錄通常不允許更新
  }

  // 覆寫update方法，追蹤記錄不允許更新
  async update(_id: string, _entity: Partial<TrackingRecord>): Promise<TrackingRecord | null> {
    throw new Error('追蹤記錄不允許更新');
  }

  // 根據學生ID查詢追蹤記錄
  async findByStudent(studentId: string, options?: PaginationOptions): Promise<PaginatedResult<TrackingRecord>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE student_id = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE student_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [studentId]),
        this.pool.query(dataQuery, [studentId, limit, offset])
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      
      const data = dataResult.rows.map(row => this.createEntityFromRow(row));
      
      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`根據學生ID查詢追蹤記錄失敗: ${error}`);
    }
  }

  // 根據文件ID查詢追蹤記錄
  async findByDocument(documentId: string, options?: PaginationOptions): Promise<PaginatedResult<TrackingRecord>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE document_id = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE document_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [documentId]),
        this.pool.query(dataQuery, [documentId, limit, offset])
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      
      const data = dataResult.rows.map(row => this.createEntityFromRow(row));
      
      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`根據文件ID查詢追蹤記錄失敗: ${error}`);
    }
  }

  // 根據使用者ID查詢追蹤記錄
  async findByUser(userId: string, options?: PaginationOptions): Promise<PaginatedResult<TrackingRecord>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE user_id = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE user_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [userId]),
        this.pool.query(dataQuery, [userId, limit, offset])
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      
      const data = dataResult.rows.map(row => this.createEntityFromRow(row));
      
      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`根據使用者ID查詢追蹤記錄失敗: ${error}`);
    }
  }

  // 根據操作類型查詢追蹤記錄
  async findByActionType(actionType: ActionType, options?: PaginationOptions): Promise<PaginatedResult<TrackingRecord>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE action_type = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE action_type = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [actionType]),
        this.pool.query(dataQuery, [actionType, limit, offset])
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      
      const data = dataResult.rows.map(row => this.createEntityFromRow(row));
      
      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`根據操作類型查詢追蹤記錄失敗: ${error}`);
    }
  }

  // 複合條件搜尋追蹤記錄
  async findWithFilters(filters: TrackingFilter, options?: PaginationOptions): Promise<PaginatedResult<TrackingRecord>> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // 建構WHERE條件
    if (filters.student_id) {
      conditions.push(`student_id = $${paramIndex++}`);
      params.push(filters.student_id);
    }
    
    if (filters.document_id) {
      conditions.push(`document_id = $${paramIndex++}`);
      params.push(filters.document_id);
    }
    
    if (filters.user_id) {
      conditions.push(`user_id = $${paramIndex++}`);
      params.push(filters.user_id);
    }
    
    if (filters.action_type) {
      conditions.push(`action_type = $${paramIndex++}`);
      params.push(filters.action_type);
    }
    
    if (filters.date_from) {
      conditions.push(`created_at >= $${paramIndex++}`);
      params.push(filters.date_from);
    }
    
    if (filters.date_to) {
      conditions.push(`created_at <= $${paramIndex++}`);
      params.push(filters.date_to);
    }
    
    if (filters.ip_address) {
      conditions.push(`ip_address = $${paramIndex++}`);
      params.push(filters.ip_address);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} ${whereClause}`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, params),
        this.pool.query(dataQuery, [...params, limit, offset])
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalItems / limit);
      
      const data = dataResult.rows.map(row => this.createEntityFromRow(row));
      
      return {
        data,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`搜尋追蹤記錄失敗: ${error}`);
    }
  }

  // 取得最近的活動記錄
  async getRecentActivities(limit: number = 50): Promise<TrackingRecord[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    
    try {
      const rows = await this.executeQuery(query, [limit]);
      return rows.map(row => this.createEntityFromRow(row));
    } catch (error) {
      throw new Error(`取得最近活動記錄失敗: ${error}`);
    }
  }

  // 取得使用者活動統計
  async getUserActivityStats(userId: string, days: number = 30): Promise<{
    total_actions: number;
    actions_by_type: Array<{ action_type: string; count: number }>;
    daily_activity: Array<{ date: string; count: number }>;
  }> {
    const queries = [
      // 總操作數
      `SELECT COUNT(*) as total_actions 
       FROM ${this.tableName} 
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'`,
      
      // 按操作類型統計
      `SELECT action_type, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY action_type 
       ORDER BY count DESC`,
      
      // 每日活動統計
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM ${this.tableName} 
       WHERE user_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    ];
    
    try {
      const [totalResult, typeResult, dailyResult] = await Promise.all(
        queries.map(query => this.pool.query(query, [userId]))
      );
      
      return {
        total_actions: parseInt(totalResult.rows[0].total_actions),
        actions_by_type: typeResult.rows,
        daily_activity: dailyResult.rows
      };
    } catch (error) {
      throw new Error(`取得使用者活動統計失敗: ${error}`);
    }
  }

  // 取得系統活動統計
  async getSystemActivityStats(days: number = 30): Promise<{
    total_actions: number;
    actions_by_type: Array<{ action_type: string; count: number }>;
    actions_by_user: Array<{ user_id: string; count: number }>;
    daily_activity: Array<{ date: string; count: number }>;
  }> {
    const queries = [
      // 總操作數
      `SELECT COUNT(*) as total_actions 
       FROM ${this.tableName} 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'`,
      
      // 按操作類型統計
      `SELECT action_type, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY action_type 
       ORDER BY count DESC`,
      
      // 按使用者統計（前10名）
      `SELECT user_id, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY user_id 
       ORDER BY count DESC 
       LIMIT 10`,
      
      // 每日活動統計
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM ${this.tableName} 
       WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    ];
    
    try {
      const [totalResult, typeResult, userResult, dailyResult] = await Promise.all(
        queries.map(query => this.pool.query(query))
      );
      
      return {
        total_actions: parseInt(totalResult.rows[0].total_actions),
        actions_by_type: typeResult.rows,
        actions_by_user: userResult.rows,
        daily_activity: dailyResult.rows
      };
    } catch (error) {
      throw new Error(`取得系統活動統計失敗: ${error}`);
    }
  }

  // 清理舊的追蹤記錄（保留指定天數）
  async cleanupOldRecords(retentionDays: number = 365): Promise<number> {
    const query = `
      DELETE FROM ${this.tableName} 
      WHERE created_at < CURRENT_DATE - INTERVAL '${retentionDays} days'
    `;
    
    try {
      const result = await this.pool.query(query);
      return result.rowCount || 0;
    } catch (error) {
      throw new Error(`清理舊追蹤記錄失敗: ${error}`);
    }
  }
}