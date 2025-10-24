import { Pool } from 'pg';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base-repository';
import { StudentDocument, ContentType, DocumentStatus } from '../models/student-document';

export interface DocumentFilter {
  student_id?: string;
  type_id?: string;
  uploader_id?: string;
  content_type?: ContentType;
  status?: DocumentStatus;
  is_current?: boolean;
  uploaded_from?: Date;
  uploaded_to?: Date;
}

export class StudentDocumentRepository extends BaseRepository<StudentDocument> {
  constructor(pool: Pool) {
    super(pool, 'student_documents', 'document_id');
  }

  protected createEntityFromRow(row: any): StudentDocument {
    return StudentDocument.fromDatabase(row);
  }

  protected getInsertableFields(): string[] {
    return [
      'document_id',
      'student_id',
      'type_id',
      'uploader_id',
      'content_type',
      'file_path',
      'file_name',
      'file_size',
      'mime_type',
      'web_url',
      'remarks',
      'status',
      'version',
      'is_current'
    ];
  }

  protected getUpdatableFields(): string[] {
    return [
      'file_path',
      'file_name',
      'file_size',
      'mime_type',
      'web_url',
      'remarks',
      'status',
      'version',
      'is_current',
      'updated_at'
    ];
  }

  // 根據學生ID查詢文件
  async findByStudent(studentId: string, options?: PaginationOptions): Promise<PaginatedResult<StudentDocument>> {
    const { page = 1, limit = 10, sortBy = 'uploaded_at', sortOrder = 'DESC' } = options || {};
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
      throw new Error(`根據學生ID查詢文件失敗: ${error}`);
    }
  }

  // 根據學生ID和文件類型查詢當前版本文件
  async findCurrentByStudentAndType(studentId: string, typeId: string): Promise<StudentDocument | null> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE student_id = $1 AND type_id = $2 AND is_current = true
      ORDER BY version DESC
      LIMIT 1
    `;
    
    try {
      const result = await this.pool.query(query, [studentId, typeId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`查詢學生當前文件失敗: ${error}`);
    }
  }

  // 根據學生ID查詢所有當前版本文件
  async findCurrentByStudent(studentId: string): Promise<any[]> {
    const query = `
      SELECT 
        sd.*,
        u.name as uploader_name,
        u.unit_id as uploader_unit_id,
        un.unit_name as uploader_unit_name
      FROM ${this.tableName} sd
      LEFT JOIN users u ON sd.uploader_id = u.user_id
      LEFT JOIN units un ON u.unit_id = un.unit_id
      WHERE sd.student_id = $1 AND sd.is_current = true
      ORDER BY sd.type_id
    `;
    
    try {
      const rows = await this.executeQuery(query, [studentId]);
      return rows.map(row => {
        const doc = this.createEntityFromRow(row);
        return {
          ...doc,
          uploader: {
            user_id: row.uploader_id,
            name: row.uploader_name || '未知',
            unitName: row.uploader_unit_name || '未知單位'
          }
        };
      });
    } catch (error) {
      throw new Error(`查詢學生所有當前文件失敗: ${error}`);
    }
  }

  // 根據文件類型查詢文件
  async findByType(typeId: string, options?: PaginationOptions): Promise<PaginatedResult<StudentDocument>> {
    const { page = 1, limit = 10, sortBy = 'uploaded_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE type_id = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE type_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [typeId]),
        this.pool.query(dataQuery, [typeId, limit, offset])
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
      throw new Error(`根據文件類型查詢文件失敗: ${error}`);
    }
  }

  // 根據上傳者查詢文件
  async findByUploader(uploaderId: string, options?: PaginationOptions): Promise<PaginatedResult<StudentDocument>> {
    const { page = 1, limit = 10, sortBy = 'uploaded_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE uploader_id = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE uploader_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [uploaderId]),
        this.pool.query(dataQuery, [uploaderId, limit, offset])
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
      throw new Error(`根據上傳者查詢文件失敗: ${error}`);
    }
  }

  // 複合條件搜尋文件
  async findWithFilters(filters: DocumentFilter, options?: PaginationOptions): Promise<PaginatedResult<StudentDocument>> {
    const { page = 1, limit = 10, sortBy = 'uploaded_at', sortOrder = 'DESC' } = options || {};
    const offset = (page - 1) * limit;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // 建構WHERE條件
    if (filters.student_id) {
      conditions.push(`student_id = $${paramIndex++}`);
      params.push(filters.student_id);
    }
    
    if (filters.type_id) {
      conditions.push(`type_id = $${paramIndex++}`);
      params.push(filters.type_id);
    }
    
    if (filters.uploader_id) {
      conditions.push(`uploader_id = $${paramIndex++}`);
      params.push(filters.uploader_id);
    }
    
    if (filters.content_type) {
      conditions.push(`content_type = $${paramIndex++}`);
      params.push(filters.content_type);
    }
    
    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }
    
    if (filters.is_current !== undefined) {
      conditions.push(`is_current = $${paramIndex++}`);
      params.push(filters.is_current);
    }
    
    if (filters.uploaded_from) {
      conditions.push(`uploaded_at >= $${paramIndex++}`);
      params.push(filters.uploaded_from);
    }
    
    if (filters.uploaded_to) {
      conditions.push(`uploaded_at <= $${paramIndex++}`);
      params.push(filters.uploaded_to);
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
      throw new Error(`搜尋文件失敗: ${error}`);
    }
  }

  // 建立新版本文件（將舊版本設為非當前）
  async createNewVersion(document: StudentDocument): Promise<StudentDocument> {
    return this.executeInTransaction(async (client) => {
      // 將同學生同類型的所有文件設為非當前版本
      await client.query(
        `UPDATE ${this.tableName} 
         SET is_current = false, updated_at = CURRENT_TIMESTAMP
         WHERE student_id = $1 AND type_id = $2`,
        [document.student_id, document.type_id]
      );
      
      // 插入新版本文件
      const fields = this.getInsertableFields();
      const data = document.toDatabaseInsert();
      
      const insertFields = fields.filter(field => data[field] !== undefined);
      const insertValues = insertFields.map(field => data[field]);
      
      const placeholders = insertFields.map((_, index) => `$${index + 1}`).join(', ');
      const fieldsList = insertFields.join(', ');
      
      const insertQuery = `
        INSERT INTO ${this.tableName} (${fieldsList})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, insertValues);
      return this.createEntityFromRow(result.rows[0]);
    });
  }

  // 取得學生文件完成度統計
  async getStudentCompletionStats(studentId: string): Promise<{
    total_required: number;
    completed: number;
    completion_rate: number;
    missing_document_types: string[];
  }> {
    const query = `
      WITH required_types AS (
        SELECT type_id, type_name
        FROM document_types
        WHERE is_required = true
      ),
      student_docs AS (
        SELECT DISTINCT type_id
        FROM ${this.tableName}
        WHERE student_id = $1 AND is_current = true AND status IN ('pending', 'approved', 'under_review')
      )
      SELECT 
        COUNT(rt.type_id) as total_required,
        COUNT(sd.type_id) as completed,
        CASE 
          WHEN COUNT(rt.type_id) > 0 
          THEN ROUND((COUNT(sd.type_id)::decimal / COUNT(rt.type_id)) * 100, 2)
          ELSE 0 
        END as completion_rate,
        ARRAY_AGG(
          CASE WHEN sd.type_id IS NULL THEN rt.type_name END
        ) FILTER (WHERE sd.type_id IS NULL) as missing_document_types
      FROM required_types rt
      LEFT JOIN student_docs sd ON rt.type_id = sd.type_id
    `;
    
    try {
      const result = await this.pool.query(query, [studentId]);
      const row = result.rows[0];
      
      return {
        total_required: parseInt(row.total_required),
        completed: parseInt(row.completed),
        completion_rate: parseFloat(row.completion_rate),
        missing_document_types: row.missing_document_types || []
      };
    } catch (error) {
      throw new Error(`取得學生文件完成度統計失敗: ${error}`);
    }
  }

  // 取得文件統計資訊
  async getDocumentStats(): Promise<{
    total_documents: number;
    documents_by_status: Array<{ status: string; count: number }>;
    documents_by_type: Array<{ type_id: string; type_name: string; count: number }>;
    documents_by_content_type: Array<{ content_type: string; count: number }>;
    pending_review_count: number;
  }> {
    const queries = [
      // 總文件數
      `SELECT COUNT(*) as total_documents FROM ${this.tableName} WHERE is_current = true`,
      
      // 按狀態統計
      `SELECT status, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE is_current = true
       GROUP BY status 
       ORDER BY status`,
      
      // 按文件類型統計
      `SELECT 
        sd.type_id, 
        dt.type_name,
        COUNT(*) as count 
       FROM ${this.tableName} sd
       JOIN document_types dt ON sd.type_id = dt.type_id
       WHERE sd.is_current = true
       GROUP BY sd.type_id, dt.type_name
       ORDER BY count DESC`,
      
      // 按內容類型統計
      `SELECT content_type, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE is_current = true
       GROUP BY content_type 
       ORDER BY content_type`,
      
      // 待審核文件數
      `SELECT COUNT(*) as pending_review_count 
       FROM ${this.tableName} 
       WHERE is_current = true AND status IN ('pending', 'under_review')`
    ];
    
    try {
      const [totalResult, statusResult, typeResult, contentTypeResult, pendingResult] = await Promise.all(
        queries.map(query => this.pool.query(query))
      );
      
      return {
        total_documents: parseInt(totalResult.rows[0].total_documents),
        documents_by_status: statusResult.rows,
        documents_by_type: typeResult.rows,
        documents_by_content_type: contentTypeResult.rows,
        pending_review_count: parseInt(pendingResult.rows[0].pending_review_count)
      };
    } catch (error) {
      throw new Error(`取得文件統計資訊失敗: ${error}`);
    }
  }
}