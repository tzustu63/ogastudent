import Joi from 'joi';
import { BaseModel } from './base-model';

export enum ActionType {
  DOCUMENT_UPLOAD = 'document_upload',
  DOCUMENT_UPDATE = 'document_update',
  DOCUMENT_DELETE = 'document_delete',
  DOCUMENT_APPROVE = 'document_approve',
  DOCUMENT_REJECT = 'document_reject',
  DOCUMENT_REVIEW = 'document_review',
  STUDENT_CREATE = 'student_create',
  STUDENT_UPDATE = 'student_update',
  STUDENT_DELETE = 'student_delete',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  PERMISSION_CHANGE = 'permission_change'
}

export class TrackingRecord extends BaseModel {
  record_id!: string;
  student_id?: string;
  document_id?: string;
  user_id!: string;
  action_type!: ActionType;
  description?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;

  constructor(data?: Partial<TrackingRecord>) {
    super();
    if (data) {
      Object.assign(this, data);
      
      // 處理字串格式的action_type
      if (typeof data.action_type === 'string') {
        this.action_type = data.action_type as ActionType;
      }
      
      // 處理JSON字串格式的metadata
      if (typeof data.metadata === 'string') {
        try {
          this.metadata = JSON.parse(data.metadata);
        } catch {
          this.metadata = undefined;
        }
      }
    }
  }

  protected getValidationSchema(): Joi.ObjectSchema {
    return Joi.object({
      record_id: Joi.string().max(50).required(),
      student_id: Joi.string().max(50).optional().allow(null),
      document_id: Joi.string().max(50).optional().allow(null),
      user_id: Joi.string().max(50).required(),
      action_type: Joi.string().valid(...Object.values(ActionType)).required(),
      description: Joi.string().optional().allow(''),
      metadata: Joi.object().optional(),
      ip_address: Joi.string().ip().optional().allow(''),
      user_agent: Joi.string().optional().allow('')
    });
  }

  // 驗證追蹤記錄資料
  validateTrackingRecord(): { isValid: boolean; errors: string[] } {
    const { error } = this.validate(this);
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    return { isValid: true, errors: [] };
  }

  // 檢查是否為文件相關操作
  isDocumentAction(): boolean {
    return [
      ActionType.DOCUMENT_UPLOAD,
      ActionType.DOCUMENT_UPDATE,
      ActionType.DOCUMENT_DELETE,
      ActionType.DOCUMENT_APPROVE,
      ActionType.DOCUMENT_REJECT,
      ActionType.DOCUMENT_REVIEW
    ].includes(this.action_type);
  }

  // 檢查是否為學生相關操作
  isStudentAction(): boolean {
    return [
      ActionType.STUDENT_CREATE,
      ActionType.STUDENT_UPDATE,
      ActionType.STUDENT_DELETE
    ].includes(this.action_type);
  }

  // 檢查是否為使用者相關操作
  isUserAction(): boolean {
    return [
      ActionType.USER_LOGIN,
      ActionType.USER_LOGOUT,
      ActionType.PERMISSION_CHANGE
    ].includes(this.action_type);
  }

  // 設定元資料
  setMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  // 取得元資料
  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  // 取得操作類型顯示名稱
  getActionTypeDisplayName(): string {
    const actionNames: Record<ActionType, string> = {
      [ActionType.DOCUMENT_UPLOAD]: '上傳文件',
      [ActionType.DOCUMENT_UPDATE]: '更新文件',
      [ActionType.DOCUMENT_DELETE]: '刪除文件',
      [ActionType.DOCUMENT_APPROVE]: '核准文件',
      [ActionType.DOCUMENT_REJECT]: '拒絕文件',
      [ActionType.DOCUMENT_REVIEW]: '審核文件',
      [ActionType.STUDENT_CREATE]: '建立學生',
      [ActionType.STUDENT_UPDATE]: '更新學生',
      [ActionType.STUDENT_DELETE]: '刪除學生',
      [ActionType.USER_LOGIN]: '使用者登入',
      [ActionType.USER_LOGOUT]: '使用者登出',
      [ActionType.PERMISSION_CHANGE]: '權限變更'
    };

    return actionNames[this.action_type] || '未知操作';
  }

  // 序列化為API回應格式
  toApiResponse(): Record<string, any> {
    return {
      record_id: this.record_id,
      student_id: this.student_id,
      document_id: this.document_id,
      user_id: this.user_id,
      action_type: this.action_type,
      action_type_display_name: this.getActionTypeDisplayName(),
      description: this.description,
      metadata: this.metadata,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      created_at: this.created_at?.toISOString()
    };
  }

  // 序列化為資料庫格式
  toDatabaseInsert(): Record<string, any> {
    const data = super.toDatabaseInsert();
    
    // 將metadata轉換為JSON字串
    if (this.metadata) {
      data.metadata = JSON.stringify(this.metadata);
    }
    
    return data;
  }
}