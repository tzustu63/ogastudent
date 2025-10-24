import Joi from 'joi';
import { BaseModel } from './base-model';

export class Unit extends BaseModel {
  unit_id!: string;
  unit_name!: string;
  unit_name_en?: string;
  description?: string;
  is_active: boolean = true;
  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<Unit>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }

  protected getValidationSchema(): Joi.ObjectSchema {
    return Joi.object({
      unit_id: Joi.string().max(50).required().messages({
        'string.empty': '單位ID不能為空',
        'string.max': '單位ID不能超過50個字元',
        'any.required': '單位ID為必填欄位'
      }),
      unit_name: Joi.string().max(100).required().messages({
        'string.empty': '單位名稱不能為空',
        'string.max': '單位名稱不能超過100個字元',
        'any.required': '單位名稱為必填欄位'
      }),
      unit_name_en: Joi.string().max(100).optional().allow('').messages({
        'string.max': '英文單位名稱不能超過100個字元'
      }),
      description: Joi.string().optional().allow('').messages({
        'string.base': '描述必須為文字格式'
      }),
      is_active: Joi.boolean().default(true).messages({
        'boolean.base': '啟用狀態必須為布林值'
      })
    });
  }

  // 驗證單位資料
  validateUnit(): { isValid: boolean; errors: string[] } {
    const { error } = this.validate(this);
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    // 額外的業務邏輯驗證
    const businessErrors: string[] = [];

    // 檢查單位ID格式（只允許英文、數字和底線）
    if (!/^[a-zA-Z0-9_]+$/.test(this.unit_id)) {
      businessErrors.push('單位ID只能包含英文字母、數字和底線');
    }

    // 檢查單位名稱不能只包含空白
    if (this.unit_name && this.unit_name.trim().length === 0) {
      businessErrors.push('單位名稱不能只包含空白字元');
    }

    return {
      isValid: businessErrors.length === 0,
      errors: businessErrors
    };
  }

  // 取得單位顯示名稱
  getDisplayName(language: 'zh' | 'en' = 'zh'): string {
    if (language === 'en' && this.unit_name_en) {
      return this.unit_name_en;
    }
    return this.unit_name;
  }

  // 檢查單位是否啟用
  isEnabled(): boolean {
    return this.is_active === true;
  }

  // 啟用單位
  enable(): void {
    this.is_active = true;
  }

  // 停用單位
  disable(): void {
    this.is_active = false;
  }

  // 更新單位資訊
  updateInfo(data: Partial<Pick<Unit, 'unit_name' | 'unit_name_en' | 'description'>>): void {
    if (data.unit_name !== undefined) {
      const sanitized = this.sanitizeString(data.unit_name);
      this.unit_name = sanitized || this.unit_name;
    }
    if (data.unit_name_en !== undefined) {
      const sanitized = this.sanitizeString(data.unit_name_en);
      if (sanitized !== undefined) {
        this.unit_name_en = sanitized;
      }
    }
    if (data.description !== undefined) {
      const sanitized = this.sanitizeString(data.description);
      if (sanitized !== undefined) {
        this.description = sanitized;
      }
    }
  }

  // 序列化為API回應格式
  toApiResponse(): Record<string, any> {
    return {
      unit_id: this.unit_id,
      unit_name: this.unit_name,
      unit_name_en: this.unit_name_en,
      description: this.description,
      is_active: this.is_active,
      display_name: this.getDisplayName(),
      created_at: this.created_at?.toISOString(),
      updated_at: this.updated_at?.toISOString()
    };
  }
}