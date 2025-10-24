import Joi from 'joi';

export abstract class BaseModel {
  protected abstract getValidationSchema(): Joi.ObjectSchema;

  // 驗證資料
  validate(data: any): { error?: Joi.ValidationError | undefined; value?: any } {
    const schema = this.getValidationSchema();
    return schema.validate(data, { abortEarly: false });
  }

  // 序列化為JSON
  toJSON(): Record<string, any> {
    const obj: Record<string, any> = {};

    // 取得所有可枚舉的屬性
    for (const key in this) {
      if (this.hasOwnProperty(key) && !key.startsWith('_')) {
        const value = this[key];

        // 處理日期類型
        if (value instanceof Date) {
          obj[key] = value.toISOString();
        }
        // 處理其他類型
        else if (value !== undefined && value !== null) {
          obj[key] = value;
        }
      }
    }

    return obj;
  }

  // 從資料庫結果建立實例
  static fromDatabase<T extends BaseModel>(
    this: new () => T,
    data: Record<string, any>
  ): T {
    const instance = new this();

    // 將資料庫欄位對應到模型屬性
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        // 處理日期字串轉換
        if (typeof data[key] === 'string' && key.includes('_at')) {
          (instance as any)[key] = new Date(data[key]);
        } else {
          (instance as any)[key] = data[key];
        }
      }
    });

    return instance;
  }

  // 取得用於資料庫插入的資料
  toDatabaseInsert(): Record<string, any> {
    const data = this.toJSON();

    // 移除不需要插入的欄位
    delete data.created_at;
    delete data.updated_at;

    return data;
  }

  // 取得用於資料庫更新的資料
  toDatabaseUpdate(): Record<string, any> {
    const data = this.toJSON();

    // 移除不應該更新的欄位
    delete data.created_at;
    data.updated_at = new Date().toISOString();

    return data;
  }

  // 檢查必填欄位
  protected validateRequired(data: any, requiredFields: string[]): string[] {
    const missing: string[] = [];

    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        missing.push(field);
      }
    });

    return missing;
  }

  // 清理字串欄位
  protected sanitizeString(value: any): string | undefined {
    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  }

  // 驗證電子郵件格式
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // 驗證URL格式
  protected validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}