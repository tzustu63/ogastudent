import { Pool } from 'pg';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base-repository';
import { DocumentType } from '../models/document-type';

export class DocumentTypeRepository extends BaseRepository<DocumentType> {
  constructor(pool: Pool) {
    super(pool, 'document_types', 'type_id');
  }

  protected createEntityFromRow(row: any): DocumentType {
    return DocumentType.fromDatabase(row);
  }

  protected getInsertableFields(): string[] {
    return [
      'type_id',
      'type_name',
      'type_name_en',
      'responsible_unit_id',
      'is_required',
      'validation_rules',
      'display_order'
    ];
  }

  protected getUpdatableFields(): string[] {
    return [
      'type_name',
      'type_name_en',
      'responsible_unit_id',
      'is_required',
      'validation_rules',
      'display_order',
      'updated_at'
    ];
  }

  // 根據負責單位查詢文件類型
  async findByUnit(unitId: string, options?: PaginationOptions): Promise<PaginatedResult<DocumentType>> {
    const { page = 1, limit = 10, sortBy = 'display_order', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE responsible_unit_id = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE responsible_unit_id = $1
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
      throw new Error(`根據單位查詢文件類型失敗: ${error}`);
    }
  }

  // 根據多個ID查詢文件類型
  async findByIds(typeIds: string[]): Promise<DocumentType[]> {
    if (typeIds.length === 0) return [];
    
    const placeholders = typeIds.map((_, index) => `$${index + 1}`).join(',');
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE type_id IN (${placeholders})
      ORDER BY display_order, type_name
    `;
    
    try {
      const rows = await this.executeQuery(query, typeIds);
      return rows.map(row => this.createEntityFromRow(row));
    } catch (error) {
      throw new Error(`根據ID查詢文件類型失敗: ${error}`);
    }
  }

  // 取得所有必填文件類型
  async findRequired(): Promise<DocumentType[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE is_required = true
      ORDER BY display_order, type_name
    `;
    
    try {
      const rows = await this.executeQuery(query);
      return rows.map(row => this.createEntityFromRow(row));
    } catch (error) {
      throw new Error(`查詢必填文件類型失敗: ${error}`);
    }
  }

  // 根據名稱搜尋文件類型
  async findByName(name: string): Promise<DocumentType[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE type_name ILIKE $1 OR type_name_en ILIKE $1
      ORDER BY display_order, type_name
    `;
    
    try {
      const rows = await this.executeQuery(query, [`%${name}%`]);
      return rows.map(row => this.createEntityFromRow(row));
    } catch (error) {
      throw new Error(`根據名稱搜尋文件類型失敗: ${error}`);
    }
  }

  // 檢查文件類型名稱是否已存在
  async isNameExists(typeName: string, excludeId?: string): Promise<boolean> {
    let query = `SELECT 1 FROM ${this.tableName} WHERE type_name = $1`;
    const params: any[] = [typeName];
    
    if (excludeId) {
      query += ` AND type_id != $2`;
      params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    try {
      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`檢查文件類型名稱存在性失敗: ${error}`);
    }
  }

  // 更新顯示順序
  async updateDisplayOrder(typeId: string, newOrder: number): Promise<boolean> {
    const query = `
      UPDATE ${this.tableName} 
      SET display_order = $1, updated_at = CURRENT_TIMESTAMP
      WHERE type_id = $2
    `;
    
    try {
      const result = await this.pool.query(query, [newOrder, typeId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      throw new Error(`更新顯示順序失敗: ${error}`);
    }
  }

  // 批量更新顯示順序
  async batchUpdateDisplayOrder(updates: Array<{ type_id: string; display_order: number }>): Promise<boolean> {
    return this.executeInTransaction(async (client) => {
      for (const update of updates) {
        await client.query(
          `UPDATE ${this.tableName} SET display_order = $1, updated_at = CURRENT_TIMESTAMP WHERE type_id = $2`,
          [update.display_order, update.type_id]
        );
      }
      return true;
    });
  }

  // 取得下一個顯示順序號
  async getNextDisplayOrder(): Promise<number> {
    const query = `SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM ${this.tableName}`;
    
    try {
      const result = await this.pool.query(query);
      return result.rows[0].next_order;
    } catch (error) {
      throw new Error(`取得下一個顯示順序失敗: ${error}`);
    }
  }

  // 取得文件類型統計資訊
  async getDocumentTypeStats(): Promise<Array<{
    type_id: string;
    type_name: string;
    responsible_unit_name: string;
    total_documents: number;
    pending_documents: number;
    approved_documents: number;
  }>> {
    const query = `
      SELECT 
        dt.type_id,
        dt.type_name,
        u.unit_name as responsible_unit_name,
        COALESCE(doc_counts.total_documents, 0) as total_documents,
        COALESCE(doc_counts.pending_documents, 0) as pending_documents,
        COALESCE(doc_counts.approved_documents, 0) as approved_documents
      FROM document_types dt
      LEFT JOIN units u ON dt.responsible_unit_id = u.unit_id
      LEFT JOIN (
        SELECT 
          type_id,
          COUNT(*) as total_documents,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_documents,
          COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_documents
        FROM student_documents
        WHERE is_current = true
        GROUP BY type_id
      ) doc_counts ON dt.type_id = doc_counts.type_id
      ORDER BY dt.display_order, dt.type_name
    `;
    
    try {
      const rows = await this.executeQuery(query);
      return rows;
    } catch (error) {
      throw new Error(`取得文件類型統計資訊失敗: ${error}`);
    }
  }
}