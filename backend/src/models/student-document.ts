import Joi from 'joi';
import { BaseModel } from './base-model';

export enum ContentType {
  FILE = 'file',
  WEB_URL = 'web_url'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export class StudentDocument extends BaseModel {
  document_id!: string;
  student_id!: string;
  type_id!: string;
  uploader_id!: string;
  content_type!: ContentType;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  web_url?: string;
  remarks?: string;
  status: DocumentStatus = DocumentStatus.PENDING;
  version: number = 1;
  is_current: boolean = true;
  uploaded_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<StudentDocument>) {
    super();
    if (data) {
      Object.assign(this, data);
      
      // 處理字串格式的枚舉
      if (typeof data.content_type === 'string') {
        this.content_type = data.content_type as ContentType;
      }
      if (typeof data.status === 'string') {
        this.status = data.status as DocumentStatus;
      }
      
      // 處理日期字串
      if (typeof data.uploaded_at === 'string') {
        this.uploaded_at = new Date(data.uploaded_at);
      }
    }
  }

  protected getValidationSchema(): Joi.ObjectSchema {
    return Joi.object({
      document_id: Joi.string().max(50).required().messages({
        'string.empty': '文件ID不能為空',
        'string.max': '文件ID不能超過50個字元',
        'any.required': '文件ID為必填欄位'
      }),
      student_id: Joi.string().max(50).required().messages({
        'string.empty': '學生ID不能為空',
        'string.max': '學生ID不能超過50個字元',
        'any.required': '學生ID為必填欄位'
      }),
      type_id: Joi.string().max(50).required().messages({
        'string.empty': '文件類型ID不能為空',
        'string.max': '文件類型ID不能超過50個字元',
        'any.required': '文件類型ID為必填欄位'
      }),
      uploader_id: Joi.string().max(50).required().messages({
        'string.empty': '上傳者ID不能為空',
        'string.max': '上傳者ID不能超過50個字元',
        'any.required': '上傳者ID為必填欄位'
      }),
      content_type: Joi.string().valid(...Object.values(ContentType)).required().messages({
        'any.only': '內容類型必須為有效值',
        'any.required': '內容類型為必填欄位'
      }),
      file_path: Joi.string().max(500).optional().allow('').messages({
        'string.max': '檔案路徑不能超過500個字元'
      }),
      file_name: Joi.string().max(255).optional().allow('').messages({
        'string.max': '檔案名稱不能超過255個字元'
      }),
      file_size: Joi.number().integer().min(0).optional().messages({
        'number.base': '檔案大小必須為數字',
        'number.integer': '檔案大小必須為整數',
        'number.min': '檔案大小不能小於0'
      }),
      mime_type: Joi.string().max(100).optional().allow('').messages({
        'string.max': 'MIME類型不能超過100個字元'
      }),
      web_url: Joi.string().uri().optional().allow('').messages({
        'string.uri': '網頁連結格式不正確'
      }),
      remarks: Joi.string().optional().allow('').messages({
        'string.base': '備註必須為文字格式'
      }),
      status: Joi.string().valid(...Object.values(DocumentStatus)).default(DocumentStatus.PENDING).messages({
        'any.only': '文件狀態必須為有效值'
      }),
      version: Joi.number().integer().min(1).default(1).messages({
        'number.base': '版本號必須為數字',
        'number.integer': '版本號必須為整數',
        'number.min': '版本號不能小於1'
      }),
      is_current: Joi.boolean().default(true).messages({
        'boolean.base': '當前版本標記必須為布林值'
      }),
      uploaded_at: Joi.date().optional().messages({
        'date.base': '上傳時間必須為有效日期'
      }),
      updated_at: Joi.date().optional().messages({
        'date.base': '更新時間必須為有效日期'
      })
    });
  }

  // 驗證學生文件資料
  validateStudentDocument(): { isValid: boolean; errors: string[] } {
    const { error } = this.validate(this);
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    // 額外的業務邏輯驗證
    const businessErrors: string[] = [];

    // 根據內容類型驗證必要欄位
    if (this.content_type === ContentType.FILE) {
      if (!this.file_path) {
        businessErrors.push('檔案類型的文件必須提供檔案路徑');
      }
      if (!this.file_name) {
        businessErrors.push('檔案類型的文件必須提供檔案名稱');
      }
      if (this.web_url) {
        businessErrors.push('檔案類型的文件不應包含網頁連結');
      }
    } else if (this.content_type === ContentType.WEB_URL) {
      if (!this.web_url) {
        businessErrors.push('網頁連結類型的文件必須提供網頁連結');
      }
      if (this.web_url && !this.validateUrl(this.web_url)) {
        businessErrors.push('網頁連結格式不正確');
      }
      if (this.file_path || this.file_name) {
        businessErrors.push('網頁連結類型的文件不應包含檔案資訊');
      }
    }

    // 檢查檔案大小合理性
    if (this.file_size !== undefined && this.file_size < 0) {
      businessErrors.push('檔案大小不能為負數');
    }

    // 檢查版本號合理性
    if (this.version < 1) {
      businessErrors.push('版本號必須大於等於1');
    }

    return {
      isValid: businessErrors.length === 0,
      errors: businessErrors
    };
  }

  // 檢查是否為檔案類型
  isFile(): boolean {
    return this.content_type === ContentType.FILE;
  }

  // 檢查是否為網頁連結類型
  isWebUrl(): boolean {
    return this.content_type === ContentType.WEB_URL;
  }

  // 檢查是否為當前版本
  isCurrent(): boolean {
    return this.is_current === true;
  }

  // 檢查文件狀態
  isPending(): boolean {
    return this.status === DocumentStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === DocumentStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === DocumentStatus.REJECTED;
  }

  isUnderReview(): boolean {
    return this.status === DocumentStatus.UNDER_REVIEW;
  }

  // 更新文件狀態
  updateStatus(newStatus: DocumentStatus, remarks?: string): void {
    this.status = newStatus;
    if (remarks !== undefined) {
      this.remarks = remarks;
    }
  }

  // 核准文件
  approve(remarks?: string): void {
    this.updateStatus(DocumentStatus.APPROVED, remarks);
  }

  // 拒絕文件
  reject(remarks?: string): void {
    this.updateStatus(DocumentStatus.REJECTED, remarks);
  }

  // 設為審核中
  setUnderReview(remarks?: string): void {
    this.updateStatus(DocumentStatus.UNDER_REVIEW, remarks);
  }

  // 設為待審核
  setPending(remarks?: string): void {
    this.updateStatus(DocumentStatus.PENDING, remarks);
  }

  // 設為當前版本
  setCurrent(): void {
    this.is_current = true;
  }

  // 設為舊版本
  setObsolete(): void {
    this.is_current = false;
  }

  // 增加版本號
  incrementVersion(): void {
    this.version += 1;
  }

  // 更新檔案資訊
  updateFileInfo(fileName: string, fileSize: number, mimeType: string, filePath: string): void {
    if (this.content_type !== ContentType.FILE) {
      throw new Error('只有檔案類型的文件可以更新檔案資訊');
    }

    this.file_name = fileName;
    this.file_size = fileSize;
    this.mime_type = mimeType;
    this.file_path = filePath;
  }

  // 更新網頁連結
  updateWebUrl(webUrl: string): void {
    if (this.content_type !== ContentType.WEB_URL) {
      throw new Error('只有網頁連結類型的文件可以更新網頁連結');
    }

    if (!this.validateUrl(webUrl)) {
      throw new Error('網頁連結格式不正確');
    }

    this.web_url = webUrl;
  }

  // 更新備註
  updateRemarks(remarks?: string): void {
    if (remarks) {
      const sanitized = this.sanitizeString(remarks);
      this.remarks = sanitized;
    } else {
      this.remarks = undefined;
    }
  }

  // 取得檔案擴展名
  getFileExtension(): string | null {
    if (!this.file_name) return null;
    
    const parts = this.file_name.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || null : null;
  }

  // 格式化檔案大小
  getFormattedFileSize(): string | null {
    if (!this.file_size) return null;

    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.file_size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  // 取得狀態顯示名稱
  getStatusDisplayName(): string {
    const statusNames: Record<DocumentStatus, string> = {
      [DocumentStatus.PENDING]: '待審核',
      [DocumentStatus.APPROVED]: '已核准',
      [DocumentStatus.REJECTED]: '已拒絕',
      [DocumentStatus.UNDER_REVIEW]: '審核中'
    };

    return statusNames[this.status] || '未知狀態';
  }

  // 取得內容類型顯示名稱
  getContentTypeDisplayName(): string {
    const typeNames: Record<ContentType, string> = {
      [ContentType.FILE]: '檔案',
      [ContentType.WEB_URL]: '網頁連結'
    };

    return typeNames[this.content_type] || '未知類型';
  }

  // 序列化為API回應格式
  toApiResponse(): Record<string, any> {
    return {
      document_id: this.document_id,
      student_id: this.student_id,
      type_id: this.type_id,
      uploader_id: this.uploader_id,
      content_type: this.content_type,
      content_type_display_name: this.getContentTypeDisplayName(),
      file_path: this.file_path,
      file_name: this.file_name,
      file_size: this.file_size,
      formatted_file_size: this.getFormattedFileSize(),
      file_extension: this.getFileExtension(),
      mime_type: this.mime_type,
      web_url: this.web_url,
      remarks: this.remarks,
      status: this.status,
      status_display_name: this.getStatusDisplayName(),
      version: this.version,
      is_current: this.is_current,
      uploaded_at: this.uploaded_at?.toISOString(),
      updated_at: this.updated_at?.toISOString()
    };
  }

  // 序列化為簡要資訊格式
  toBriefInfo(): Record<string, any> {
    return {
      document_id: this.document_id,
      type_id: this.type_id,
      content_type: this.content_type,
      file_name: this.file_name,
      web_url: this.web_url,
      status: this.status,
      status_display_name: this.getStatusDisplayName(),
      version: this.version,
      is_current: this.is_current,
      uploaded_at: this.uploaded_at?.toISOString()
    };
  }
}