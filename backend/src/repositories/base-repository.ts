import { Pool, PoolClient } from 'pg';
import { BaseModel } from '../models/base-model';

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface IRepository<T extends BaseModel> {
  findById(id: string): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export abstract class BaseRepository<T extends BaseModel> implements IRepository<T> {
  protected pool: Pool;
  protected tableName: string;
  protected primaryKey: string;

  constructor(pool: Pool, tableName: string, primaryKey: string = 'id') {
    this.pool = pool;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  // 抽象方法，由子類實作
  protected abstract createEntityFromRow(row: any): T;
  protected abstract getInsertableFields(): string[];
  protected abstract getUpdatableFields(): string[];

  // 基本CRUD操作
  async findById(id: string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    
    try {
      const result = await this.pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`查詢 ${this.tableName} 失敗: ${error}`);
    }
  }

  async findAll(options: PaginationOptions = { page: 1, limit: 10 }): Promise<PaginatedResult<T>> {
    const { page, limit, sortBy, sortOrder = 'ASC' } = options;
    const offset = (page - 1) * limit;
    
    // 建構排序子句
    let orderClause = '';
    if (sortBy) {
      orderClause = `ORDER BY ${sortBy} ${sortOrder}`;
    }
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName}`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      ${orderClause}
      LIMIT $1 OFFSET $2
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery),
        this.pool.query(dataQuery, [limit, offset])
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
      throw new Error(`查詢 ${this.tableName} 列表失敗: ${error}`);
    }
  }

  async create(entity: T): Promise<T> {
    const fields = this.getInsertableFields();
    const data = entity.toDatabaseInsert();
    
    // 過濾出實際要插入的欄位和值
    const insertFields = fields.filter(field => data[field] !== undefined);
    const insertValues = insertFields.map(field => data[field]);
    
    const placeholders = insertFields.map((_, index) => `$${index + 1}`).join(', ');
    const fieldsList = insertFields.join(', ');
    
    const query = `
      INSERT INTO ${this.tableName} (${fieldsList})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    try {
      const result = await this.pool.query(query, insertValues);
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`建立 ${this.tableName} 失敗: ${error}`);
    }
  }

  async update(id: string, entity: Partial<T>): Promise<T | null> {
    const fields = this.getUpdatableFields();
    const data = (entity as any).toDatabaseUpdate ? (entity as any).toDatabaseUpdate() : entity;
    
    // 過濾出實際要更新的欄位和值
    const updateFields = fields.filter(field => data[field] !== undefined);
    
    if (updateFields.length === 0) {
      throw new Error('沒有可更新的欄位');
    }
    
    const updateValues = updateFields.map(field => data[field]);
    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName} 
      SET ${setClause}
      WHERE ${this.primaryKey} = $${updateFields.length + 1}
      RETURNING *
    `;
    
    try {
      const result = await this.pool.query(query, [...updateValues, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`更新 ${this.tableName} 失敗: ${error}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
    
    try {
      const result = await this.pool.query(query, [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`刪除 ${this.tableName} 失敗: ${error}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const query = `SELECT 1 FROM ${this.tableName} WHERE ${this.primaryKey} = $1 LIMIT 1`;
    
    try {
      const result = await this.pool.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`檢查 ${this.tableName} 存在性失敗: ${error}`);
    }
  }

  async count(): Promise<number> {
    const query = `SELECT COUNT(*) FROM ${this.tableName}`;
    
    try {
      const result = await this.pool.query(query);
      return parseInt(result.rows[0].count);
    } catch (error) {
      throw new Error(`計算 ${this.tableName} 數量失敗: ${error}`);
    }
  }

  // 輔助方法：執行自定義查詢
  protected async executeQuery(query: string, params: any[] = []): Promise<any[]> {
    try {
      const result = await this.pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`執行查詢失敗: ${error}`);
    }
  }

  // 輔助方法：在交易中執行操作
  protected async executeInTransaction<R>(
    operation: (client: PoolClient) => Promise<R>
  ): Promise<R> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await operation(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // 輔助方法：建構WHERE子句
  protected buildWhereClause(conditions: Record<string, any>): { clause: string; values: any[] } {
    const keys = Object.keys(conditions).filter(key => conditions[key] !== undefined);
    
    if (keys.length === 0) {
      return { clause: '', values: [] };
    }
    
    const clause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    const values = keys.map(key => conditions[key]);
    
    return { clause: `WHERE ${clause}`, values };
  }
}