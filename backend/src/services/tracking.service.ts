import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { TrackingRecord, ActionType } from '../models/tracking-record';
import { TrackingRecordRepository, TrackingFilter } from '../repositories/tracking-record-repository';
import { PaginationOptions, PaginatedResult } from '../repositories/base-repository';

export interface CreateTrackingRecordInput {
  student_id?: string | undefined;
  document_id?: string | undefined;
  user_id: string;
  action_type: ActionType;
  description?: string | undefined;
  metadata?: Record<string, any> | undefined;
  ip_address?: string | undefined;
  user_agent?: string | undefined;
}

export class TrackingService {
  private trackingRepository: TrackingRecordRepository;

  constructor(pool: Pool) {
    this.trackingRepository = new TrackingRecordRepository(pool);
  }

  // 建立追蹤記錄
  async createTrackingRecord(input: CreateTrackingRecordInput): Promise<TrackingRecord> {
    const data: Partial<TrackingRecord> = {
      record_id: uuidv4(),
      user_id: input.user_id,
      action_type: input.action_type
    };
    
    if (input.student_id !== undefined) data.student_id = input.student_id;
    if (input.document_id !== undefined) data.document_id = input.document_id;
    if (input.description !== undefined) data.description = input.description;
    if (input.metadata !== undefined) data.metadata = input.metadata;
    if (input.ip_address !== undefined) data.ip_address = input.ip_address;
    if (input.user_agent !== undefined) data.user_agent = input.user_agent;
    
    const trackingRecord = new TrackingRecord(data);

    // 驗證追蹤記錄
    const validation = trackingRecord.validateTrackingRecord();
    if (!validation.isValid) {
      throw new Error(`追蹤記錄驗證失敗: ${validation.errors.join(', ')}`);
    }

    const created = await this.trackingRepository.create(trackingRecord);
    if (!created) {
      throw new Error('建立追蹤記錄失敗');
    }

    return created;
  }

  // 取得追蹤記錄
  async getTrackingRecord(recordId: string): Promise<TrackingRecord | null> {
    return await this.trackingRepository.findById(recordId);
  }

  // 根據篩選條件查詢追蹤記錄
  async getTrackingRecords(
    filters: TrackingFilter,
    options?: PaginationOptions
  ): Promise<PaginatedResult<TrackingRecord>> {
    return await this.trackingRepository.findWithFilters(filters, options);
  }

  // 根據學生ID查詢追蹤記錄
  async getTrackingRecordsByStudent(
    studentId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<TrackingRecord>> {
    return await this.trackingRepository.findByStudent(studentId, options);
  }

  // 根據文件ID查詢追蹤記錄
  async getTrackingRecordsByDocument(
    documentId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<TrackingRecord>> {
    return await this.trackingRepository.findByDocument(documentId, options);
  }

  // 根據使用者ID查詢追蹤記錄
  async getTrackingRecordsByUser(
    userId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<TrackingRecord>> {
    return await this.trackingRepository.findByUser(userId, options);
  }

  // 根據操作類型查詢追蹤記錄
  async getTrackingRecordsByActionType(
    actionType: ActionType,
    options?: PaginationOptions
  ): Promise<PaginatedResult<TrackingRecord>> {
    return await this.trackingRepository.findByActionType(actionType, options);
  }

  // 取得最近的活動記錄
  async getRecentActivities(limit: number = 50): Promise<TrackingRecord[]> {
    return await this.trackingRepository.getRecentActivities(limit);
  }

  // 取得使用者活動統計
  async getUserActivityStats(userId: string, days: number = 30) {
    return await this.trackingRepository.getUserActivityStats(userId, days);
  }

  // 取得系統活動統計
  async getSystemActivityStats(days: number = 30) {
    return await this.trackingRepository.getSystemActivityStats(days);
  }

  // 記錄文件上傳
  async logDocumentUpload(
    userId: string,
    studentId: string,
    documentId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TrackingRecord> {
    return await this.createTrackingRecord({
      user_id: userId,
      student_id: studentId,
      document_id: documentId,
      action_type: ActionType.DOCUMENT_UPLOAD,
      description: '上傳文件',
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  // 記錄文件更新
  async logDocumentUpdate(
    userId: string,
    studentId: string,
    documentId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TrackingRecord> {
    return await this.createTrackingRecord({
      user_id: userId,
      student_id: studentId,
      document_id: documentId,
      action_type: ActionType.DOCUMENT_UPDATE,
      description: '更新文件',
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  // 記錄文件刪除
  async logDocumentDelete(
    userId: string,
    studentId: string,
    documentId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TrackingRecord> {
    return await this.createTrackingRecord({
      user_id: userId,
      student_id: studentId,
      document_id: documentId,
      action_type: ActionType.DOCUMENT_DELETE,
      description: '刪除文件',
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  // 記錄學生建立
  async logStudentCreate(
    userId: string,
    studentId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TrackingRecord> {
    return await this.createTrackingRecord({
      user_id: userId,
      student_id: studentId,
      action_type: ActionType.STUDENT_CREATE,
      description: '建立學生資料',
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  // 記錄學生更新
  async logStudentUpdate(
    userId: string,
    studentId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TrackingRecord> {
    return await this.createTrackingRecord({
      user_id: userId,
      student_id: studentId,
      action_type: ActionType.STUDENT_UPDATE,
      description: '更新學生資料',
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  // 記錄使用者登入
  async logUserLogin(
    userId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TrackingRecord> {
    return await this.createTrackingRecord({
      user_id: userId,
      action_type: ActionType.USER_LOGIN,
      description: '使用者登入',
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  // 記錄使用者登出
  async logUserLogout(
    userId: string,
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<TrackingRecord> {
    return await this.createTrackingRecord({
      user_id: userId,
      action_type: ActionType.USER_LOGOUT,
      description: '使用者登出',
      metadata,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }
}
