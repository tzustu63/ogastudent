import { Pool } from 'pg';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base-repository';
import { User, UserRole } from '../models/user';

export interface UserFilter {
  unit_id?: string;
  role?: UserRole;
  is_active?: boolean;
  search?: string; // 搜尋姓名、使用者名稱或電子郵件
}

export class UserRepository extends BaseRepository<User> {
  constructor(pool: Pool) {
    super(pool, 'users', 'user_id');
  }

  protected createEntityFromRow(row: any): User {
    return User.fromDatabase(row);
  }

  protected getInsertableFields(): string[] {
    return [
      'user_id',
      'username',
      'email',
      'name',
      'unit_id',
      'role',
      'password_hash',
      'is_active'
    ];
  }

  protected getUpdatableFields(): string[] {
    return [
      'username',
      'email',
      'name',
      'unit_id',
      'role',
      'password_hash',
      'is_active',
      'last_login',
      'updated_at'
    ];
  }

  // 根據使用者名稱查詢
  async findByUsername(username: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE username = $1`;
    
    try {
      const result = await this.pool.query(query, [username]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`根據使用者名稱查詢失敗: ${error}`);
    }
  }

  // 根據電子郵件查詢
  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1`;
    
    try {
      const result = await this.pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`根據電子郵件查詢失敗: ${error}`);
    }
  }

  // 根據單位查詢使用者
  async findByUnit(unitId: string, options?: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE unit_id = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE unit_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [unitId]),
        this.pool.query(dataQuery, [unitId, limit, offset])
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
      throw new Error(`根據單位查詢使用者失敗: ${error}`);
    }
  }

  // 根據角色查詢使用者
  async findByRole(role: UserRole, options?: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE role = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE role = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [role]),
        this.pool.query(dataQuery, [role, limit, offset])
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
      throw new Error(`根據角色查詢使用者失敗: ${error}`);
    }
  }

  // 複合條件搜尋使用者
  async findWithFilters(filters: UserFilter, options?: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // 建構WHERE條件
    if (filters.unit_id) {
      conditions.push(`unit_id = $${paramIndex++}`);
      params.push(filters.unit_id);
    }
    
    if (filters.role) {
      conditions.push(`role = $${paramIndex++}`);
      params.push(filters.role);
    }
    
    if (filters.is_active !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      params.push(filters.is_active);
    }
    
    if (filters.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
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
      throw new Error(`搜尋使用者失敗: ${error}`);
    }
  }

  // 檢查使用者名稱是否已存在
  async isUsernameExists(username: string, excludeId?: string): Promise<boolean> {
    let query = `SELECT 1 FROM ${this.tableName} WHERE username = $1`;
    const params: any[] = [username];
    
    if (excludeId) {
      query += ` AND user_id != $2`;
      params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    try {
      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`檢查使用者名稱存在性失敗: ${error}`);
    }
  }

  // 檢查電子郵件是否已存在
  async isEmailExists(email: string, excludeId?: string): Promise<boolean> {
    let query = `SELECT 1 FROM ${this.tableName} WHERE email = $1`;
    const params: any[] = [email];
    
    if (excludeId) {
      query += ` AND user_id != $2`;
      params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    try {
      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`檢查電子郵件存在性失敗: ${error}`);
    }
  }

  // 更新最後登入時間
  async updateLastLogin(userId: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName} 
      SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`更新最後登入時間失敗: ${error}`);
    }
  }

  // 啟用使用者
  async enable(userId: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName} 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`啟用使用者失敗: ${error}`);
    }
  }

  // 停用使用者
  async disable(userId: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName} 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`停用使用者失敗: ${error}`);
    }
  }

  // 變更使用者角色
  async changeRole(userId: string, newRole: UserRole, newUnitId?: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName} 
      SET role = $1, unit_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $3
    `;
    
    try {
      const result = await this.pool.query(query, [newRole, newUnitId || null, userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`變更使用者角色失敗: ${error}`);
    }
  }

  // 取得使用者統計資訊
  async getUserStats(): Promise<{
    total_users: number;
    active_users: number;
    users_by_role: Array<{ role: string; count: number }>;
    users_by_unit: Array<{ unit_id: string; unit_name: string; count: number }>;
  }> {
    const queries = [
      // 總使用者數和啟用使用者數
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
       FROM ${this.tableName}`,
      
      // 按角色統計
      `SELECT role, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE is_active = true 
       GROUP BY role 
       ORDER BY role`,
      
      // 按單位統計
      `SELECT 
        u.unit_id, 
        COALESCE(units.unit_name, '未指定單位') as unit_name,
        COUNT(*) as count
       FROM ${this.tableName} u
       LEFT JOIN units ON u.unit_id = units.unit_id
       WHERE u.is_active = true
       GROUP BY u.unit_id, units.unit_name
       ORDER BY count DESC`
    ];
    
    try {
      const [totalResult, roleResult, unitResult] = await Promise.all(
        queries.map(query => this.pool.query(query))
      );
      
      return {
        total_users: parseInt(totalResult.rows[0].total_users),
        active_users: parseInt(totalResult.rows[0].active_users),
        users_by_role: roleResult.rows,
        users_by_unit: unitResult.rows
      };
    } catch (error) {
      throw new Error(`取得使用者統計資訊失敗: ${error}`);
    }
  }
}