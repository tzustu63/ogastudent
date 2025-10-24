import Joi from 'joi';
import bcrypt from 'bcryptjs';
import { BaseModel } from './base-model';

export enum UserRole {
  ADMIN = 'admin',
  UNIT_STAFF = 'unit_staff',
  AUDITOR = 'auditor'
}

export class User extends BaseModel {
  user_id!: string;
  username!: string;
  email!: string;
  name!: string;
  unit_id?: string;
  role: UserRole = UserRole.UNIT_STAFF;
  password_hash?: string;
  is_active: boolean = true;
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<User>) {
    super();
    if (data) {
      Object.assign(this, data);
      // 處理字串格式的role
      if (typeof data.role === 'string') {
        this.role = data.role as UserRole;
      }
    }
  }

  protected getValidationSchema(): Joi.ObjectSchema {
    return Joi.object({
      user_id: Joi.string().max(50).required().messages({
        'string.empty': '使用者ID不能為空',
        'string.max': '使用者ID不能超過50個字元',
        'any.required': '使用者ID為必填欄位'
      }),
      username: Joi.string().min(3).max(100).required().messages({
        'string.empty': '使用者名稱不能為空',
        'string.min': '使用者名稱至少需要3個字元',
        'string.max': '使用者名稱不能超過100個字元',
        'any.required': '使用者名稱為必填欄位'
      }),
      email: Joi.string().email().max(255).required().messages({
        'string.empty': '電子郵件不能為空',
        'string.email': '電子郵件格式不正確',
        'string.max': '電子郵件不能超過255個字元',
        'any.required': '電子郵件為必填欄位'
      }),
      name: Joi.string().max(100).required().messages({
        'string.empty': '姓名不能為空',
        'string.max': '姓名不能超過100個字元',
        'any.required': '姓名為必填欄位'
      }),
      unit_id: Joi.string().max(50).optional().allow(null).messages({
        'string.max': '單位ID不能超過50個字元'
      }),
      role: Joi.string().valid(...Object.values(UserRole)).default(UserRole.UNIT_STAFF).messages({
        'any.only': '角色必須為有效的使用者角色',
        'string.base': '角色必須為字串格式'
      }),
      password_hash: Joi.string().optional().messages({
        'string.base': '密碼雜湊必須為字串格式'
      }),
      is_active: Joi.boolean().default(true).messages({
        'boolean.base': '啟用狀態必須為布林值'
      }),
      last_login: Joi.date().optional().messages({
        'date.base': '最後登入時間必須為有效日期'
      }),
      created_at: Joi.date().optional().messages({
        'date.base': '建立時間必須為有效日期'
      }),
      updated_at: Joi.date().optional().messages({
        'date.base': '更新時間必須為有效日期'
      })
    });
  }

  // 驗證使用者資料
  validateUser(): { isValid: boolean; errors: string[] } {
    const { error } = this.validate(this);
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    // 額外的業務邏輯驗證
    const businessErrors: string[] = [];

    // 檢查使用者名稱格式（只允許英文、數字、底線和點）
    if (!/^[a-zA-Z0-9_.]+$/.test(this.username)) {
      businessErrors.push('使用者名稱只能包含英文字母、數字、底線和點');
    }

    // 檢查電子郵件格式
    if (!this.validateEmail(this.email)) {
      businessErrors.push('電子郵件格式不正確');
    }

    // 檢查姓名不能只包含空白
    if (this.name && this.name.trim().length === 0) {
      businessErrors.push('姓名不能只包含空白字元');
    }

    // 檢查角色和單位的關聯性
    if (this.role === UserRole.UNIT_STAFF && !this.unit_id) {
      businessErrors.push('單位職員必須指定所屬單位');
    }

    return {
      isValid: businessErrors.length === 0,
      errors: businessErrors
    };
  }

  // 設定密碼（加密）
  async setPassword(plainPassword: string): Promise<void> {
    if (!plainPassword || plainPassword.length < 6) {
      throw new Error('密碼長度至少需要6個字元');
    }

    const saltRounds = 12;
    this.password_hash = await bcrypt.hash(plainPassword, saltRounds);
  }

  // 驗證密碼
  async verifyPassword(plainPassword: string): Promise<boolean> {
    if (!this.password_hash) {
      return false;
    }

    return await bcrypt.compare(plainPassword, this.password_hash);
  }

  // 檢查使用者是否啟用
  isEnabled(): boolean {
    return this.is_active === true;
  }

  // 啟用使用者
  enable(): void {
    this.is_active = true;
  }

  // 停用使用者
  disable(): void {
    this.is_active = false;
  }

  // 更新最後登入時間
  updateLastLogin(): void {
    this.last_login = new Date();
  }

  // 檢查使用者權限
  hasRole(role: UserRole): boolean {
    return this.role === role;
  }

  // 檢查是否為管理員
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  // 檢查是否為單位職員
  isUnitStaff(): boolean {
    return this.role === UserRole.UNIT_STAFF;
  }

  // 檢查是否為稽核人員
  isAuditor(): boolean {
    return this.role === UserRole.AUDITOR;
  }



  // 檢查是否可以存取特定單位的資料
  canAccessUnit(unitId: string): boolean {
    // 管理員、稽核人員和單位職員都可以存取所有單位資料
    return this.isAdmin() || this.isAuditor() || this.isUnitStaff();
  }

  // 檢查是否可以上傳特定單位的文件
  canUploadForUnit(unitId: string): boolean {
    // 管理員可以上傳所有單位的文件
    if (this.isAdmin()) {
      return true;
    }

    // 單位職員只能上傳自己單位的文件
    if (this.isUnitStaff()) {
      return this.unit_id === unitId;
    }

    // 稽核人員不能上傳文件
    return false;
  }

  // 檢查是否可以審核文件
  canReviewDocuments(): boolean {
    // 只有稽核人員和管理員可以審核文件
    return this.isAuditor() || this.isAdmin();
  }

  // 更新使用者資訊
  updateInfo(data: Partial<Pick<User, 'email' | 'name' | 'unit_id'>>): void {
    if (data.email !== undefined) {
      const sanitized = this.sanitizeString(data.email);
      this.email = sanitized || this.email;
    }
    if (data.name !== undefined) {
      const sanitized = this.sanitizeString(data.name);
      this.name = sanitized || this.name;
    }
    if (data.unit_id !== undefined) {
      const sanitized = this.sanitizeString(data.unit_id);
      if (sanitized !== undefined) {
        this.unit_id = sanitized;
      }
    }
  }

  // 變更角色
  changeRole(newRole: UserRole, newUnitId?: string): void {
    this.role = newRole;
    
    // 如果是單位職員，必須指定單位
    if (newRole === UserRole.UNIT_STAFF && newUnitId) {
      this.unit_id = newUnitId;
    }
    
    // 如果不是單位職員，清除單位關聯
    if (newRole !== UserRole.UNIT_STAFF) {
      delete (this as any).unit_id;
    }
  }

  // 取得角色顯示名稱
  getRoleDisplayName(): string {
    const roleNames: Record<UserRole, string> = {
      [UserRole.ADMIN]: '系統管理員',
      [UserRole.UNIT_STAFF]: '單位職員',
      [UserRole.AUDITOR]: '稽核人員'
    };

    return roleNames[this.role] || '未知角色';
  }

  // 序列化為API回應格式（不包含敏感資訊）
  toApiResponse(): Record<string, any> {
    return {
      user_id: this.user_id,
      username: this.username,
      email: this.email,
      name: this.name,
      unit_id: this.unit_id,
      role: this.role,
      role_display_name: this.getRoleDisplayName(),
      is_active: this.is_active,
      last_login: this.last_login?.toISOString(),
      created_at: this.created_at?.toISOString(),
      updated_at: this.updated_at?.toISOString()
    };
  }

  // 序列化為安全的公開資訊格式
  toPublicInfo(): Record<string, any> {
    return {
      user_id: this.user_id,
      name: this.name,
      role: this.role,
      role_display_name: this.getRoleDisplayName(),
      unit_id: this.unit_id
    };
  }

  // 覆寫基類方法，排除密碼雜湊
  toJSON(): Record<string, any> {
    const obj = super.toJSON();
    delete obj.password_hash; // 永遠不要序列化密碼雜湊
    return obj;
  }

  toDatabaseInsert(): Record<string, any> {
    const data = super.toDatabaseInsert();
    // 保留password_hash用於資料庫操作
    if (this.password_hash) {
      data.password_hash = this.password_hash;
    }
    return data;
  }

  toDatabaseUpdate(): Record<string, any> {
    const data = super.toDatabaseUpdate();
    // 保留password_hash用於資料庫操作
    if (this.password_hash) {
      data.password_hash = this.password_hash;
    }
    return data;
  }
}