import { Pool } from 'pg';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base-repository';
import { Student, StudentStatus } from '../models/student';

export interface StudentFilter {
  nationality?: string;
  program?: string;
  status?: StudentStatus;
  enrollment_date_from?: Date;
  enrollment_date_to?: Date;
  search?: string; // 搜尋姓名、學生ID或電子郵件
}

export class StudentRepository extends BaseRepository<Student> {
  constructor(pool: Pool) {
    super(pool, 'students', 'student_id');
  }

  protected createEntityFromRow(row: any): Student {
    return Student.fromDatabase(row);
  }

  protected getInsertableFields(): string[] {
    return [
      'student_id',
      'name',
      'email',
      'nationality',
      'program',
      'enrollment_date',
      'expected_graduation_date',
      'status',
      'passport_number',
      'phone',
      'emergency_contact'
    ];
  }

  protected getUpdatableFields(): string[] {
    return [
      'name',
      'email',
      'nationality',
      'program',
      'enrollment_date',
      'expected_graduation_date',
      'status',
      'passport_number',
      'phone',
      'emergency_contact',
      'updated_at'
    ];
  }

  // 根據電子郵件查詢
  async findByEmail(email: string): Promise<Student | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE email = $1`;
    
    try {
      const result = await this.pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`根據電子郵件查詢學生失敗: ${error}`);
    }
  }

  // 根據護照號碼查詢
  async findByPassportNumber(passportNumber: string): Promise<Student | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE passport_number = $1`;
    
    try {
      const result = await this.pool.query(query, [passportNumber]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.createEntityFromRow(result.rows[0]);
    } catch (error) {
      throw new Error(`根據護照號碼查詢學生失敗: ${error}`);
    }
  }

  // 根據國籍查詢學生
  async findByNationality(nationality: string, options?: PaginationOptions): Promise<PaginatedResult<Student>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE nationality = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE nationality = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [nationality]),
        this.pool.query(dataQuery, [nationality, limit, offset])
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
      throw new Error(`根據國籍查詢學生失敗: ${error}`);
    }
  }

  // 根據就讀科系查詢學生
  async findByProgram(program: string, options?: PaginationOptions): Promise<PaginatedResult<Student>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE program ILIKE $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE program ILIKE $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [`%${program}%`]),
        this.pool.query(dataQuery, [`%${program}%`, limit, offset])
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
      throw new Error(`根據科系查詢學生失敗: ${error}`);
    }
  }

  // 根據狀態查詢學生
  async findByStatus(status: StudentStatus, options?: PaginationOptions): Promise<PaginatedResult<Student>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const countQuery = `SELECT COUNT(*) FROM ${this.tableName} WHERE status = $1`;
    const dataQuery = `
      SELECT * FROM ${this.tableName} 
      WHERE status = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const [countResult, dataResult] = await Promise.all([
        this.pool.query(countQuery, [status]),
        this.pool.query(dataQuery, [status, limit, offset])
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
      throw new Error(`根據狀態查詢學生失敗: ${error}`);
    }
  }

  // 複合條件搜尋學生
  async findWithFilters(filters: StudentFilter, options?: PaginationOptions): Promise<PaginatedResult<Student>> {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = options || {};
    const offset = (page - 1) * limit;
    
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    // 建構WHERE條件
    if (filters.nationality) {
      conditions.push(`nationality = $${paramIndex++}`);
      params.push(filters.nationality);
    }
    
    if (filters.program) {
      conditions.push(`program ILIKE $${paramIndex++}`);
      params.push(`%${filters.program}%`);
    }
    
    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(filters.status);
    }
    
    if (filters.enrollment_date_from) {
      conditions.push(`enrollment_date >= $${paramIndex++}`);
      params.push(filters.enrollment_date_from);
    }
    
    if (filters.enrollment_date_to) {
      conditions.push(`enrollment_date <= $${paramIndex++}`);
      params.push(filters.enrollment_date_to);
    }
    
    if (filters.search) {
      conditions.push(`(name ILIKE $${paramIndex} OR student_id ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
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
      throw new Error(`搜尋學生失敗: ${error}`);
    }
  }

  // 檢查電子郵件是否已存在
  async isEmailExists(email: string, excludeId?: string): Promise<boolean> {
    let query = `SELECT 1 FROM ${this.tableName} WHERE email = $1`;
    const params: any[] = [email];
    
    if (excludeId) {
      query += ` AND student_id != $2`;
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

  // 檢查護照號碼是否已存在
  async isPassportNumberExists(passportNumber: string, excludeId?: string): Promise<boolean> {
    let query = `SELECT 1 FROM ${this.tableName} WHERE passport_number = $1`;
    const params: any[] = [passportNumber];
    
    if (excludeId) {
      query += ` AND student_id != $2`;
      params.push(excludeId);
    }
    
    query += ` LIMIT 1`;
    
    try {
      const result = await this.pool.query(query, params);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`檢查護照號碼存在性失敗: ${error}`);
    }
  }

  // 取得即將畢業的學生（6個月內）
  async findNearGraduation(): Promise<Student[]> {
    const query = `
      SELECT * FROM ${this.tableName} 
      WHERE status = 'active' 
        AND expected_graduation_date IS NOT NULL
        AND expected_graduation_date <= CURRENT_DATE + INTERVAL '6 months'
      ORDER BY expected_graduation_date
    `;
    
    try {
      const rows = await this.executeQuery(query);
      return rows.map(row => this.createEntityFromRow(row));
    } catch (error) {
      throw new Error(`查詢即將畢業學生失敗: ${error}`);
    }
  }

  // 取得學生統計資訊
  async getStudentStats(): Promise<{
    total_students: number;
    active_students: number;
    students_by_status: Array<{ status: string; count: number }>;
    students_by_nationality: Array<{ nationality: string; count: number }>;
    students_by_program: Array<{ program: string; count: number }>;
    near_graduation_count: number;
  }> {
    const queries = [
      // 總學生數和在學學生數
      `SELECT 
        COUNT(*) as total_students,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_students
       FROM ${this.tableName}`,
      
      // 按狀態統計
      `SELECT status, COUNT(*) as count 
       FROM ${this.tableName} 
       GROUP BY status 
       ORDER BY status`,
      
      // 按國籍統計（前10名）
      `SELECT nationality, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE nationality IS NOT NULL
       GROUP BY nationality 
       ORDER BY count DESC 
       LIMIT 10`,
      
      // 按科系統計（前10名）
      `SELECT program, COUNT(*) as count 
       FROM ${this.tableName} 
       WHERE program IS NOT NULL
       GROUP BY program 
       ORDER BY count DESC 
       LIMIT 10`,
      
      // 即將畢業學生數
      `SELECT COUNT(*) as near_graduation_count
       FROM ${this.tableName} 
       WHERE status = 'active' 
         AND expected_graduation_date IS NOT NULL
         AND expected_graduation_date <= CURRENT_DATE + INTERVAL '6 months'`
    ];
    
    try {
      const [totalResult, statusResult, nationalityResult, programResult, graduationResult] = await Promise.all(
        queries.map(query => this.pool.query(query))
      );
      
      return {
        total_students: parseInt(totalResult.rows[0].total_students),
        active_students: parseInt(totalResult.rows[0].active_students),
        students_by_status: statusResult.rows,
        students_by_nationality: nationalityResult.rows,
        students_by_program: programResult.rows,
        near_graduation_count: parseInt(graduationResult.rows[0].near_graduation_count)
      };
    } catch (error) {
      throw new Error(`取得學生統計資訊失敗: ${error}`);
    }
  }
}