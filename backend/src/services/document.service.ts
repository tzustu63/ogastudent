import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { StudentDocument, ContentType, DocumentStatus } from '../models/student-document';
import { StudentDocumentRepository, DocumentFilter } from '../repositories/student-document-repository';
import { TrackingRecordRepository } from '../repositories/tracking-record-repository';
import { TrackingRecord, ActionType } from '../models/tracking-record';
import { fileStorageService, FileMetadata } from './file-storage.service';
import { urlValidationService } from './url-validation.service';
import { PaginationOptions, PaginatedResult } from '../repositories/base-repository';

export interface UploadDocumentParams {
  student_id: string;
  type_id: string;
  uploader_id: string;
  file?: Express.Multer.File;
  web_url?: string;
  remarks?: string;
}

export interface UpdateDocumentParams {
  document_id: string;
  file?: Express.Multer.File;
  web_url?: string;
  remarks?: string;
  status?: DocumentStatus;
}

export class DocumentService {
  private documentRepository: StudentDocumentRepository;
  private trackingRepository: TrackingRecordRepository;
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
    this.documentRepository = new StudentDocumentRepository(pool);
    this.trackingRepository = new TrackingRecordRepository(pool);
  }

  /**
   * 取得所有文件類型
   */
  async getDocumentTypes(): Promise<any[]> {
    const query = `
      SELECT 
        type_id,
        type_name,
        type_name_en,
        responsible_unit_id,
        is_required,
        validation_rules,
        display_order,
        created_at,
        updated_at
      FROM document_types 
      ORDER BY display_order ASC, type_name ASC
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }

  /**
   * 上傳檔案文件
   */
  async uploadFileDocument(params: UploadDocumentParams): Promise<StudentDocument> {
    const { student_id, type_id, uploader_id, file, remarks } = params;

    if (!file) {
      throw new Error('未提供檔案');
    }

    // 儲存檔案並取得元資料
    const storageResult = await fileStorageService.saveFile(file);
    if (!storageResult.success || !storageResult.metadata) {
      throw new Error(storageResult.error || '檔案儲存失敗');
    }

    const metadata = storageResult.metadata;

    // 檢查是否已存在當前版本文件
    const existingDoc = await this.documentRepository.findCurrentByStudentAndType(
      student_id,
      type_id
    );

    // 建立新文件記錄
    const document = new StudentDocument({
      document_id: uuidv4(),
      student_id,
      type_id,
      uploader_id,
      content_type: ContentType.FILE,
      file_path: fileStorageService.getRelativePath(metadata.path),
      file_name: metadata.originalName,
      file_size: metadata.size,
      mime_type: metadata.mimeType,
      remarks: remarks || '',
      status: DocumentStatus.PENDING,
      version: existingDoc ? existingDoc.version + 1 : 1,
      is_current: true,
      uploaded_at: new Date()
    });

    // 驗證文件資料
    const validation = document.validateStudentDocument();
    if (!validation.isValid) {
      // 如果驗證失敗，刪除已上傳的檔案
      await fileStorageService.deleteFile(metadata.path);
      throw new Error(`文件驗證失敗: ${validation.errors.join(', ')}`);
    }

    // 儲存文件記錄（如果有舊版本會自動設為非當前）
    const savedDocument = await this.documentRepository.createNewVersion(document);

    // 建立追蹤記錄
    await this.createTrackingRecord({
      student_id,
      document_id: savedDocument.document_id,
      user_id: uploader_id,
      action_type: ActionType.DOCUMENT_UPLOAD,
      description: `上傳檔案文件: ${metadata.originalName}`,
      metadata: {
        file_name: metadata.originalName,
        file_size: metadata.size,
        mime_type: metadata.mimeType,
        version: savedDocument.version
      }
    });

    return savedDocument;
  }

  /**
   * 上傳網頁連結文件
   */
  async uploadWebLinkDocument(params: UploadDocumentParams): Promise<StudentDocument> {
    const { student_id, type_id, uploader_id, web_url, remarks } = params;

    if (!web_url) {
      throw new Error('未提供網頁連結');
    }

    // 驗證URL格式和安全性
    const validationResult = await urlValidationService.validateUrl(web_url, false);
    if (!validationResult.isValid) {
      throw new Error(validationResult.error || '網頁連結格式不正確');
    }

    // 執行安全檢查
    const securityCheck = await urlValidationService.performSecurityCheck(web_url);
    if (!securityCheck.isSafe) {
      throw new Error(`網頁連結安全檢查失敗: ${securityCheck.issues.join(', ')}`);
    }

    // 標準化URL
    const normalizedUrl = urlValidationService.normalizeUrl(web_url);

    // 檢查是否已存在當前版本文件
    const existingDoc = await this.documentRepository.findCurrentByStudentAndType(
      student_id,
      type_id
    );

    // 建立新文件記錄
    const document = new StudentDocument({
      document_id: uuidv4(),
      student_id,
      type_id,
      uploader_id,
      content_type: ContentType.WEB_URL,
      web_url: normalizedUrl,
      remarks: remarks || '',
      status: DocumentStatus.PENDING,
      version: existingDoc ? existingDoc.version + 1 : 1,
      is_current: true,
      uploaded_at: new Date()
    });

    // 驗證文件資料
    const validation = document.validateStudentDocument();
    if (!validation.isValid) {
      throw new Error(`文件驗證失敗: ${validation.errors.join(', ')}`);
    }

    // 儲存文件記錄
    const savedDocument = await this.documentRepository.createNewVersion(document);

    // 建立追蹤記錄
    await this.createTrackingRecord({
      student_id,
      document_id: savedDocument.document_id,
      user_id: uploader_id,
      action_type: ActionType.DOCUMENT_UPLOAD,
      description: `上傳網頁連結文件: ${normalizedUrl}`,
      metadata: {
        web_url: normalizedUrl,
        original_url: web_url,
        version: savedDocument.version
      }
    });

    return savedDocument;
  }

  /**
   * 取得文件詳細資訊
   */
  async getDocument(documentId: string): Promise<StudentDocument | null> {
    return await this.documentRepository.findById(documentId);
  }

  /**
   * 取得學生的所有當前文件
   */
  async getStudentDocuments(studentId: string): Promise<StudentDocument[]> {
    return await this.documentRepository.findCurrentByStudent(studentId);
  }

  /**
   * 取得學生的文件（分頁）
   */
  async getStudentDocumentsPaginated(
    studentId: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<StudentDocument>> {
    return await this.documentRepository.findByStudent(studentId, options);
  }

  /**
   * 搜尋文件
   */
  async searchDocuments(
    filters: DocumentFilter,
    options?: PaginationOptions
  ): Promise<PaginatedResult<StudentDocument>> {
    return await this.documentRepository.findWithFilters(filters, options);
  }

  /**
   * 更新文件
   */
  async updateDocument(params: UpdateDocumentParams): Promise<StudentDocument> {
    const { document_id, file, web_url, remarks, status } = params;

    // 取得現有文件
    const existingDoc = await this.documentRepository.findById(document_id);
    if (!existingDoc) {
      throw new Error('文件不存在');
    }

    // 如果提供了新檔案
    if (file) {
      if (existingDoc.content_type !== ContentType.FILE) {
        throw new Error('此文件不是檔案類型，無法更新檔案');
      }

      // 儲存新檔案
      const storageResult = await fileStorageService.saveFile(file);
      if (!storageResult.success || !storageResult.metadata) {
        throw new Error(storageResult.error || '檔案儲存失敗');
      }

      const metadata = storageResult.metadata;

      // 刪除舊檔案
      if (existingDoc.file_path) {
        const oldFilePath = fileStorageService.getAbsolutePath(existingDoc.file_path);
        await fileStorageService.deleteFile(oldFilePath);
      }

      // 更新檔案資訊
      existingDoc.updateFileInfo(
        metadata.originalName,
        metadata.size,
        metadata.mimeType,
        fileStorageService.getRelativePath(metadata.path)
      );
    }

    // 如果提供了新網頁連結
    if (web_url) {
      if (existingDoc.content_type !== ContentType.WEB_URL) {
        throw new Error('此文件不是網頁連結類型，無法更新網頁連結');
      }

      existingDoc.updateWebUrl(web_url);
    }

    // 更新備註
    if (remarks !== undefined) {
      existingDoc.updateRemarks(remarks);
    }

    // 更新狀態
    if (status) {
      existingDoc.updateStatus(status);
    }

    // 儲存更新
    const updatedDoc = await this.documentRepository.update(existingDoc.document_id, existingDoc);

    if (!updatedDoc) {
      throw new Error('更新文件失敗');
    }

    // 建立追蹤記錄
    await this.createTrackingRecord({
      student_id: updatedDoc.student_id,
      document_id: updatedDoc.document_id,
      user_id: updatedDoc.uploader_id,
      action_type: ActionType.DOCUMENT_UPDATE,
      description: '更新文件',
      metadata: {
        updated_fields: {
          file: !!file,
          web_url: !!web_url,
          remarks: !!remarks,
          status: !!status
        }
      }
    });

    return updatedDoc;
  }

  /**
   * 刪除文件
   */
  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    // 取得文件資訊
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('文件不存在');
    }

    // 如果是檔案類型，刪除實體檔案
    if (document.content_type === ContentType.FILE && document.file_path) {
      const filePath = fileStorageService.getAbsolutePath(document.file_path);
      await fileStorageService.deleteFile(filePath);
    }

    // 刪除資料庫記錄
    const deleted = await this.documentRepository.delete(documentId);

    if (deleted) {
      // 建立追蹤記錄
      await this.createTrackingRecord({
        student_id: document.student_id,
        document_id: documentId,
        user_id: userId,
        action_type: ActionType.DOCUMENT_DELETE,
        description: `刪除文件: ${document.file_name || document.web_url}`,
        metadata: {
          content_type: document.content_type,
          file_name: document.file_name,
          web_url: document.web_url
        }
      });
    }

    return deleted;
  }

  /**
   * 下載文件
   */
  async downloadDocument(documentId: string): Promise<{
    buffer: Buffer;
    metadata: FileMetadata;
  } | null> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('文件不存在');
    }

    if (document.content_type !== ContentType.FILE) {
      throw new Error('此文件不是檔案類型，無法下載');
    }

    if (!document.file_path) {
      throw new Error('檔案路徑不存在');
    }

    const filePath = fileStorageService.getAbsolutePath(document.file_path);
    const buffer = await fileStorageService.readFile(filePath);
    
    if (!buffer) {
      throw new Error('檔案讀取失敗');
    }

    const metadata = await fileStorageService.getFileInfo(filePath);
    if (!metadata) {
      throw new Error('無法取得檔案資訊');
    }

    // 使用資料庫中儲存的原始檔名，而不是檔案系統中的檔名
    // 因為檔案系統中的檔名包含時間戳和隨機字串
    if (document.file_name) {
      metadata.originalName = document.file_name;
    }

    return { buffer, metadata };
  }

  /**
   * 更新文件狀態
   */
  async updateDocumentStatus(
    documentId: string,
    status: DocumentStatus,
    userId: string,
    remarks?: string
  ): Promise<StudentDocument> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('文件不存在');
    }

    document.updateStatus(status, remarks);
    const updatedDoc = await this.documentRepository.update(document.document_id, document);

    if (!updatedDoc) {
      throw new Error('更新文件狀態失敗');
    }

    // 建立追蹤記錄
    await this.createTrackingRecord({
      student_id: updatedDoc.student_id,
      document_id: updatedDoc.document_id,
      user_id: userId,
      action_type: status === DocumentStatus.APPROVED ? ActionType.DOCUMENT_APPROVE : ActionType.DOCUMENT_UPDATE,
      description: `更新文件狀態為: ${updatedDoc.getStatusDisplayName()}`,
      metadata: {
        old_status: document.status,
        new_status: status,
        remarks
      }
    });

    return updatedDoc;
  }

  /**
   * 取得學生文件完成度
   */
  async getStudentCompletion(studentId: string) {
    return await this.documentRepository.getStudentCompletionStats(studentId);
  }

  /**
   * 取得文件統計資訊
   */
  async getDocumentStats() {
    return await this.documentRepository.getDocumentStats();
  }

  /**
   * 建立追蹤記錄
   */
  private async createTrackingRecord(params: {
    student_id: string;
    document_id?: string;
    user_id: string;
    action_type: ActionType;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    const trackingRecord = new TrackingRecord({
      record_id: uuidv4(),
      ...(params.student_id && { student_id: params.student_id }),
      ...(params.document_id && { document_id: params.document_id }),
      user_id: params.user_id,
      action_type: params.action_type,
      description: params.description,
      metadata: params.metadata || {},
      created_at: new Date()
    });

    await this.trackingRepository.create(trackingRecord);
  }
}
