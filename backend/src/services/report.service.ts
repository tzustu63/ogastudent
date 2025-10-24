import { Pool } from 'pg';

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  averageCompletion: number;
  pendingDocuments: number;
  completedDocuments: number;
  documentsByType: Array<{
    typeName: string;
    count: number;
    completionRate: number;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    studentName: string;
    documentType: string;
    timestamp: string;
  }>;
}

export interface AuditReportParams {
  startDate?: string;
  endDate?: string;
  unitId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export class ReportService {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * 取得儀表板統計資料
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // 學生統計
    const studentStatsQuery = `
      SELECT 
        COUNT(*) as total_students,
        COUNT(*) FILTER (WHERE status = 'active') as active_students
      FROM students
    `;
    const studentStats = await this.pool.query(studentStatsQuery);

    // 文件統計
    const documentStatsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending_documents,
        COUNT(*) FILTER (WHERE status = 'approved') as completed_documents
      FROM student_documents
      WHERE is_current = true
    `;
    const documentStats = await this.pool.query(documentStatsQuery);

    // 平均完成度
    const completionQuery = `
      SELECT 
        AVG(completion_rate) as average_completion
      FROM (
        SELECT 
          s.student_id,
          (COUNT(sd.document_id)::float / 18 * 100) as completion_rate
        FROM students s
        LEFT JOIN student_documents sd ON s.student_id = sd.student_id AND sd.is_current = true
        GROUP BY s.student_id
      ) as student_completion
    `;
    const completionResult = await this.pool.query(completionQuery);

    // 各類型文件統計
    const documentsByTypeQuery = `
      SELECT 
        dt.type_name as type_name,
        COUNT(sd.document_id) as count,
        (COUNT(sd.document_id)::float / NULLIF((SELECT COUNT(*) FROM students), 0) * 100) as completion_rate
      FROM document_types dt
      LEFT JOIN student_documents sd ON dt.type_id = sd.type_id AND sd.is_current = true
      GROUP BY dt.type_id, dt.type_name
      ORDER BY dt.display_order, dt.type_name
    `;
    const documentsByType = await this.pool.query(documentsByTypeQuery);

    // 最近活動
    const recentActivitiesQuery = `
      SELECT 
        tr.record_id as id,
        tr.action_type as action,
        s.name as student_name,
        dt.type_name as document_type,
        tr.created_at as timestamp
      FROM tracking_records tr
      LEFT JOIN students s ON tr.student_id = s.student_id
      LEFT JOIN student_documents sd ON tr.document_id = sd.document_id
      LEFT JOIN document_types dt ON sd.type_id = dt.type_id
      ORDER BY tr.created_at DESC
      LIMIT 10
    `;
    const recentActivities = await this.pool.query(recentActivitiesQuery);

    return {
      totalStudents: parseInt(studentStats.rows[0]?.total_students || '0'),
      activeStudents: parseInt(studentStats.rows[0]?.active_students || '0'),
      averageCompletion: parseFloat((parseFloat(completionResult.rows[0]?.average_completion || '0')).toFixed(1)),
      pendingDocuments: parseInt(documentStats.rows[0]?.pending_documents || '0'),
      completedDocuments: parseInt(documentStats.rows[0]?.completed_documents || '0'),
      documentsByType: documentsByType.rows.map(row => ({
        typeName: row.type_name,
        count: parseInt(row.count),
        completionRate: parseFloat((parseFloat(row.completion_rate || '0')).toFixed(1))
      })),
      recentActivities: recentActivities.rows.map(row => ({
        id: row.id,
        action: row.action,
        studentName: row.student_name || '未知',
        documentType: row.document_type || '未知',
        timestamp: row.timestamp
      }))
    };
  }

  /**
   * 取得稽核報表
   */
  async getAuditReport(params: AuditReportParams = {}): Promise<{
    records: any[];
    total: number;
  }> {
    const {
      startDate,
      endDate,
      unitId,
      action,
      page = 1,
      limit = 10
    } = params;

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (startDate) {
      conditions.push(`tr.created_at >= $${paramIndex}`);
      values.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`tr.created_at <= $${paramIndex}`);
      values.push(endDate);
      paramIndex++;
    }

    if (unitId) {
      conditions.push(`u.unit_id = $${paramIndex}`);
      values.push(unitId);
      paramIndex++;
    }

    if (action) {
      conditions.push(`tr.action_type = $${paramIndex}`);
      values.push(action);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 查詢總數
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tracking_records tr
      LEFT JOIN users u ON tr.user_id = u.user_id
      ${whereClause}
    `;
    const countResult = await this.pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // 查詢記錄
    const recordsQuery = `
      SELECT 
        tr.record_id as id,
        tr.student_id,
        s.name as student_name,
        tr.action_type as action,
        dt.type_name as document_type,
        u.name as user_name,
        un.unit_name as unit_name,
        tr.created_at as timestamp,
        tr.description
      FROM tracking_records tr
      LEFT JOIN students s ON tr.student_id = s.student_id
      LEFT JOIN users u ON tr.user_id = u.user_id
      LEFT JOIN units un ON u.unit_id = un.unit_id
      LEFT JOIN student_documents sd ON tr.document_id = sd.document_id
      LEFT JOIN document_types dt ON sd.type_id = dt.type_id
      ${whereClause}
      ORDER BY tr.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const recordsResult = await this.pool.query(recordsQuery, [...values, limit, offset]);

    return {
      records: recordsResult.rows.map(row => ({
        id: row.id,
        studentId: row.student_id,
        studentName: row.student_name || '未知',
        action: row.action,
        documentType: row.document_type || '未知',
        userName: row.user_name || '未知',
        unitName: row.unit_name || '未知',
        timestamp: row.timestamp,
        description: row.description || ''
      })),
      total
    };
  }

  /**
   * 匯出稽核報表為 Excel
   */
  async exportAuditReport(params: AuditReportParams = {}): Promise<Buffer> {
    // 取得所有記錄（不分頁）
    const result = await this.getAuditReport({
      ...params,
      page: 1,
      limit: 10000 // 最多匯出 10000 筆
    });

    // 簡單的 CSV 格式（可以用 Excel 開啟）
    const headers = ['學生', '操作', '文件類型', '操作者', '單位', '時間', '說明'];
    const rows = result.records.map(record => [
      record.studentName,
      record.action,
      record.documentType,
      record.userName,
      record.unitName,
      new Date(record.timestamp).toLocaleString('zh-TW'),
      record.description
    ]);

    // 加入 BOM 以支援中文
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return Buffer.from(csvContent, 'utf-8');
  }

  /**
   * 產生稽核報表（TrackingController 使用的別名）
   */
  async generateAuditReport(filters: any = {}): Promise<any> {
    return await this.getAuditReport(filters);
  }

  /**
   * 匯出稽核報表為 CSV（TrackingController 使用的別名）
   */
  async exportAuditReportToCSV(filters: any = {}): Promise<string> {
    const buffer = await this.exportAuditReport(filters);
    return buffer.toString('utf-8').replace('\uFEFF', ''); // 移除 BOM，因為 TrackingController 會自己加
  }

  /**
   * 產生完成度報表
   */
  async generateCompletionReport(filters: any = {}): Promise<any> {
    const { unit_id, program } = filters;
    
    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let paramIndex = 1;

    if (unit_id) {
      conditions.push(`u.unit_id = $${paramIndex}`);
      values.push(unit_id);
      paramIndex++;
    }

    if (program) {
      conditions.push(`s.program = $${paramIndex}`);
      values.push(program);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const query = `
      SELECT 
        s.student_id,
        s.name as student_name,
        s.program,
        COUNT(sd.document_id) as uploaded_documents,
        (COUNT(sd.document_id)::float / 18 * 100) as completion_rate,
        COUNT(sd.document_id) FILTER (WHERE sd.status = 'approved') as approved_documents,
        COUNT(sd.document_id) FILTER (WHERE sd.status = 'pending') as pending_documents
      FROM students s
      LEFT JOIN student_documents sd ON s.student_id = sd.student_id AND sd.is_current = true
      LEFT JOIN users u ON s.student_id = u.user_id
      WHERE ${whereClause}
      GROUP BY s.student_id, s.name, s.program
      ORDER BY s.name
    `;

    const result = await this.pool.query(query, values);

    return {
      records: result.rows.map(row => ({
        studentId: row.student_id,
        studentName: row.student_name,
        program: row.program,
        uploadedDocuments: parseInt(row.uploaded_documents),
        completionRate: parseFloat((parseFloat(row.completion_rate || '0')).toFixed(1)),
        approvedDocuments: parseInt(row.approved_documents),
        pendingDocuments: parseInt(row.pending_documents)
      })),
      total: result.rows.length
    };
  }

  /**
   * 匯出完成度報表為 CSV
   */
  async exportCompletionReportToCSV(filters: any = {}): Promise<string> {
    const result = await this.generateCompletionReport(filters);

    const headers = ['學生ID', '學生姓名', '系所', '已上傳文件數', '完成度(%)', '已核准', '待審核'];
    const rows = result.records.map((record: any) => [
      record.studentId,
      record.studentName,
      record.program || '未知',
      record.uploadedDocuments,
      record.completionRate.toFixed(1),
      record.approvedDocuments,
      record.pendingDocuments
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }
}
