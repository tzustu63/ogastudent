import { Pool } from 'pg';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base-repository';
import { Unit } from '../models/unit';

export class UnitRepository extends BaseRepository<Unit> {
  constructor(pool: Pool) {
    super(pool, 'units', 'unit_id');
  }

  protected createEntityFromRow(row: any): Unit {
    return Unit.fromDatabase(row);
  }

  protected getInsertableFields(): string[] {
    return [
      'unit_id',
      'unit_name',
      'unit_name_en',
      'description',
      'is_active'
    ];
  }

  protected getUpdatableFields(): string[] {
    return [
      'unit_name',
      'unit_name_en',
      'description',
      'is_active',
      'updated_at'
    ];
  }

  // 根據名稱搜尋單位
  async findByName(name: string): Promise<Unit[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE unit_name ILIKE $1 OR unit_name_en ILIKE $1
      ORDER BY unit_name
    `;
    
    try {
      const rows = await this.executeQuery(query, [`%${name}%`]);
      return rows.map(row => this.createEntityFromRow(row));
    } catch (error) {
      throw new Error(`根據名稱搜尋單位失敗: ${error}`);
    }
  }

  // 取得所有啟用的單位
  async findActive(options?: PaginationOptions): Promise<PaginatedResult<Unit>> {
    const { page = 1, limit = 10, sortBy = 'unit_name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE is_active = true`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE is_active = true
      ORDER BY ${sortBy} ${sortOrder}
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
      throw new Error(`查詢啟用單位失敗: ${error}`);
    }
  }

  // 檢查單位名稱是否已存在
  async isNameExists(unitName: string, excludeId?: string): Promise<boolean> {
    let query = `SELECT 1 FROM ${this.tableName} WHERE unit_name = $1`;
    const params: any[] = [unitName];
    
    if (excludeId) {
      query += ` AND unit_id != $2`;
      params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    try {
      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`檢查單位名稱存在性失敗: ${error}`);
    }
  }

  // 啟用單位
  async enable(unitId: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName} 
      SET is_active = true, updated_at = CURRENT_TIMESTAMP
      WHERE unit_id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [unitId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`啟用單位失敗: ${error}`);
    }
  }

  // 停用單位
  async disable(unitId: string): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName} 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE unit_id = $1
    `;
    
    try {
      const result = await this.pool.query(query, [unitId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`停用單位失敗: ${error}`);
    }
  }

  // 取得單位統計資訊
  async getUnitStats(): Promise<Array<{ unit_id: string; unit_name: string; user_count: number; document_type_count: number }>> {
    const query = `
      SELECT 
        u.unit_id,
        u.unit_name,
        COALESCE(user_counts.user_count, 0) as user_count,
        COALESCE(doc_type_counts.document_type_count, 0) as document_type_count
      FROM units u
      LEFT JOIN (
        SELECT unit_id, COUNT(*) as user_count
        FROM users 
        WHERE is_active = true
        GROUP BY unit_id
      ) user_counts ON u.unit_id = user_counts.unit_id
      LEFT JOIN (
        SELECT responsible_unit_id, COUNT(*) as document_type_count
        FROM document_types
        GROUP BY responsible_unit_id
      ) doc_type_counts ON u.unit_id = doc_type_counts.responsible_unit_id
      WHERE u.is_active = true
      ORDER BY u.unit_name
    `;
    
    try {
      const rows = await this.executeQuery(query);
      return rows;
    } catch (error) {
      throw new Error(`取得單位統計資訊失敗: ${error}`);
    }
  }
}