import Joi from 'joi';
import { BaseModel } from './base-model';

export interface ValidationRules {
  formats?: string[];
  max_size?: string;
  min_size?: string;
  required_fields?: string[];
  custom_rules?: Record<string, any>;
}

export class DocumentType extends BaseModel {
  type_id!: string;
  type_name!: string;
  type_name_en?: string;
  responsible_unit_id!: string;
  is_required: boolean = true;
  validation_rules?: ValidationRules;
  display_order: number = 0;
  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<DocumentType>) {
    super();
    if (data) {
      Object.assign(this, data);
      // 處理JSON字串格式的validation_rules
      if (typeof data.validation_rules === 'string') {
        try {
          this.validation_rules = JSON.parse(data.validation_rules);
        } catch {
          this.validation_rules = undefined;
        }
      }
    }
  }

  protected getValidationSchema(): Joi.ObjectSchema {
    return Joi.object({
      type_id: Joi.string().max(50).required().messages({
        'string.empty': '文件類型ID不能為空',
        'string.max': '文件類型ID不能超過50個字元',
        'any.required': '文件類型ID為必填欄位'
      }),
      type_name: Joi.string().max(100).required().messages({
        'string.empty': '文件類型名稱不能為空',
        'string.max': '文件類型名稱不能超過100個字元',
        'any.required': '文件類型名稱為必填欄位'
      }),
      type_name_en: Joi.string().max(100).optional().allow('').messages({
        'string.max': '英文文件類型名稱不能超過100個字元'
      }),
      responsible_unit_id: Joi.string().max(50).required().messages({
        'string.empty': '負責單位ID不能為空',
        'string.max': '負責單位ID不能超過50個字元',
        'any.required': '負責單位ID為必填欄位'
      }),
      is_required: Joi.boolean().default(true).messages({
        'boolean.base': '必填狀態必須為布林值'
      }),
      validation_rules: Joi.object().optional().messages({
        'object.base': '驗證規則必須為物件格式'
      }),
      display_order: Joi.number().integer().min(0).default(0).messages({
        'number.base': '顯示順序必須為數字',
        'number.integer': '顯示順序必須為整數',
        'number.min': '顯示順序不能小於0'
      })
    });
  }

  // 驗證文件類型資料
  validateDocumentType(): { isValid: boolean; errors: string[] } {
    const { error } = this.validate(this);
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    // 額外的業務邏輯驗證
    const businessErrors: string[] = [];

    // 檢查類型ID格式
    if (!/^[a-zA-Z0-9_]+$/.test(this.type_id)) {
      businessErrors.push('文件類型ID只能包含英文字母、數字和底線');
    }

    // 驗證validation_rules格式
    if (this.validation_rules) {
      const rulesValidation = this.validateValidationRules(this.validation_rules);
      if (!rulesValidation.isValid) {
        businessErrors.push(...rulesValidation.errors);
      }
    }

    return {
      isValid: businessErrors.length === 0,
      errors: businessErrors
    };
  }

  // 驗證validation_rules格式
  private validateValidationRules(rules: ValidationRules): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 檢查檔案格式
    if (rules.formats && Array.isArray(rules.formats)) {
      const validFormats = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'xlsx', 'xls'];
      const invalidFormats = rules.formats.filter(format => !validFormats.includes(format.toLowerCase()));
      if (invalidFormats.length > 0) {
        errors.push(`不支援的檔案格式: ${invalidFormats.join(', ')}`);
      }
    }

    // 檢查檔案大小格式
    if (rules.max_size && typeof rules.max_size === 'string') {
      if (!/^\d+[KMGT]?B$/i.test(rules.max_size)) {
        errors.push('檔案大小格式錯誤，應為如 "10MB" 的格式');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 取得文件類型顯示名稱
  getDisplayName(language: 'zh' | 'en' = 'zh'): string {
    if (language === 'en' && this.type_name_en) {
      return this.type_name_en;
    }
    return this.type_name;
  }

  // 檢查檔案是否符合驗證規則
  validateFile(fileName: string, fileSize: number, _mimeType: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.validation_rules) {
      return { isValid: true, errors: [] };
    }

    // 檢查檔案格式
    if (this.validation_rules.formats) {
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      if (!fileExtension || !this.validation_rules.formats.includes(fileExtension)) {
        errors.push(`檔案格式不符合要求，允許的格式: ${this.validation_rules.formats.join(', ')}`);
      }
    }

    // 檢查檔案大小
    if (this.validation_rules.max_size) {
      const maxSize = this.parseFileSize(this.validation_rules.max_size);
      if (maxSize && fileSize > maxSize) {
        errors.push(`檔案大小超過限制 ${this.validation_rules.max_size}`);
      }
    }

    if (this.validation_rules.min_size) {
      const minSize = this.parseFileSize(this.validation_rules.min_size);
      if (minSize && fileSize < minSize) {
        errors.push(`檔案大小低於最小要求 ${this.validation_rules.min_size}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 解析檔案大小字串為位元組數
  private parseFileSize(sizeStr: string): number | null {
    const match = sizeStr.match(/^(\d+)([KMGT]?)B$/i);
    if (!match) return null;

    const size = parseInt(match[1]);
    const unit = match[2].toUpperCase();

    const multipliers: Record<string, number> = {
      '': 1,
      'K': 1024,
      'M': 1024 * 1024,
      'G': 1024 * 1024 * 1024,
      'T': 1024 * 1024 * 1024 * 1024
    };

    return size * (multipliers[unit] || 1);
  }

  // 檢查是否為必填文件
  isRequired(): boolean {
    return this.is_required === true;
  }

  // 設定為必填
  setRequired(required: boolean = true): void {
    this.is_required = required;
  }

  // 更新驗證規則
  updateValidationRules(rules: Partial<ValidationRules>): void {
    this.validation_rules = {
      ...this.validation_rules,
      ...rules
    };
  }

  // 序列化為API回應格式
  toApiResponse(): Record<string, any> {
    return {
      type_id: this.type_id,
      type_name: this.type_name,
      type_name_en: this.type_name_en,
      responsible_unit_id: this.responsible_unit_id,
      is_required: this.is_required,
      validation_rules: this.validation_rules,
      display_order: this.display_order,
      display_name: this.getDisplayName(),
      created_at: this.created_at?.toISOString(),
      updated_at: this.updated_at?.toISOString()
    };
  }

  // 序列化為資料庫格式
  toDatabaseInsert(): Record<string, any> {
    const data = super.toDatabaseInsert();
    
    // 將validation_rules轉換為JSON字串
    if (this.validation_rules) {
      data.validation_rules = JSON.stringify(this.validation_rules);
    }
    
    return data;
  }

  toDatabaseUpdate(): Record<string, any> {
    const data = super.toDatabaseUpdate();
    
    // 將validation_rules轉換為JSON字串
    if (this.validation_rules) {
      data.validation_rules = JSON.stringify(this.validation_rules);
    }
    
    return data;
  }
}