import Joi from 'joi';
import { BaseModel } from './base-model';

export enum StudentStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
  WITHDRAWN = 'withdrawn'
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export class Student extends BaseModel {
  student_id!: string;
  name!: string;
  email?: string;
  nationality?: string;
  program?: string;
  enrollment_date?: Date;
  expected_graduation_date?: Date;
  status: StudentStatus = StudentStatus.ACTIVE;
  passport_number?: string;
  phone?: string;
  emergency_contact?: EmergencyContact;
  created_at?: Date;
  updated_at?: Date;

  constructor(data?: Partial<Student>) {
    super();
    if (data) {
      Object.assign(this, data);
      
      // 處理字串格式的status
      if (typeof data.status === 'string') {
        this.status = data.status as StudentStatus;
      }
      
      // 處理日期字串
      if (typeof data.enrollment_date === 'string') {
        this.enrollment_date = new Date(data.enrollment_date);
      }
      if (typeof data.expected_graduation_date === 'string') {
        this.expected_graduation_date = new Date(data.expected_graduation_date);
      }
      
      // 處理JSON字串格式的emergency_contact
      if (typeof data.emergency_contact === 'string') {
        try {
          this.emergency_contact = JSON.parse(data.emergency_contact);
        } catch {
          // 解析失敗時不設定值
        }
      }
    }
  }

  protected getValidationSchema(): Joi.ObjectSchema {
    const emergencyContactSchema = Joi.object({
      name: Joi.string().max(100).required().messages({
        'string.empty': '緊急聯絡人姓名不能為空',
        'any.required': '緊急聯絡人姓名為必填欄位'
      }),
      relationship: Joi.string().max(50).required().messages({
        'string.empty': '關係不能為空',
        'any.required': '關係為必填欄位'
      }),
      phone: Joi.string().max(50).required().messages({
        'string.empty': '緊急聯絡人電話不能為空',
        'any.required': '緊急聯絡人電話為必填欄位'
      }),
      email: Joi.string().email().max(255).optional().allow('').messages({
        'string.email': '緊急聯絡人電子郵件格式不正確'
      }),
      address: Joi.string().optional().allow('').messages({
        'string.base': '地址必須為文字格式'
      })
    });

    return Joi.object({
      student_id: Joi.string().max(50).required().messages({
        'string.empty': '學生ID不能為空',
        'string.max': '學生ID不能超過50個字元',
        'any.required': '學生ID為必填欄位'
      }),
      name: Joi.string().max(100).required().messages({
        'string.empty': '學生姓名不能為空',
        'string.max': '學生姓名不能超過100個字元',
        'any.required': '學生姓名為必填欄位'
      }),
      email: Joi.string().email().max(255).optional().allow('').messages({
        'string.email': '電子郵件格式不正確',
        'string.max': '電子郵件不能超過255個字元'
      }),
      nationality: Joi.string().max(100).optional().allow('').messages({
        'string.max': '國籍不能超過100個字元'
      }),
      program: Joi.string().max(200).optional().allow('').messages({
        'string.max': '就讀科系不能超過200個字元'
      }),
      enrollment_date: Joi.date().optional().messages({
        'date.base': '入學日期必須為有效日期格式'
      }),
      expected_graduation_date: Joi.date().optional().messages({
        'date.base': '預計畢業日期必須為有效日期格式'
      }),
      status: Joi.string().valid(...Object.values(StudentStatus)).default(StudentStatus.ACTIVE).messages({
        'any.only': '學生狀態必須為有效的狀態值'
      }),
      passport_number: Joi.string().max(50).optional().allow('').messages({
        'string.max': '護照號碼不能超過50個字元'
      }),
      phone: Joi.string().max(50).optional().allow('').messages({
        'string.max': '電話號碼不能超過50個字元'
      }),
      emergency_contact: emergencyContactSchema.optional().messages({
        'object.base': '緊急聯絡人資訊必須為物件格式'
      })
    });
  }

  // 驗證學生資料
  validateStudent(): { isValid: boolean; errors: string[] } {
    const { error } = this.validate(this);
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => detail.message)
      };
    }

    // 額外的業務邏輯驗證
    const businessErrors: string[] = [];

    // 檢查學生ID格式
    if (!/^[a-zA-Z0-9_-]+$/.test(this.student_id)) {
      businessErrors.push('學生ID只能包含英文字母、數字、底線和連字號');
    }

    // 檢查電子郵件格式
    if (this.email && !this.validateEmail(this.email)) {
      businessErrors.push('電子郵件格式不正確');
    }

    // 檢查日期邏輯
    if (this.enrollment_date && this.expected_graduation_date) {
      if (this.expected_graduation_date <= this.enrollment_date) {
        businessErrors.push('預計畢業日期必須晚於入學日期');
      }
    }

    // 檢查護照號碼格式（如果提供）
    if (this.passport_number && !/^[A-Z0-9]+$/.test(this.passport_number)) {
      businessErrors.push('護照號碼格式不正確，應只包含大寫英文字母和數字');
    }

    return {
      isValid: businessErrors.length === 0,
      errors: businessErrors
    };
  }

  // 檢查學生是否為在學狀態
  isActive(): boolean {
    return this.status === StudentStatus.ACTIVE;
  }

  // 檢查學生是否已畢業
  isGraduated(): boolean {
    return this.status === StudentStatus.GRADUATED;
  }

  // 檢查學生是否被停學
  isSuspended(): boolean {
    return this.status === StudentStatus.SUSPENDED;
  }

  // 檢查學生是否已退學
  isWithdrawn(): boolean {
    return this.status === StudentStatus.WITHDRAWN;
  }

  // 更新學生狀態
  updateStatus(newStatus: StudentStatus): void {
    this.status = newStatus;
  }

  // 設定畢業
  graduate(): void {
    this.status = StudentStatus.GRADUATED;
  }

  // 設定停學
  suspend(): void {
    this.status = StudentStatus.SUSPENDED;
  }

  // 設定退學
  withdraw(): void {
    this.status = StudentStatus.WITHDRAWN;
  }

  // 恢復在學狀態
  reactivate(): void {
    this.status = StudentStatus.ACTIVE;
  }

  // 更新基本資訊
  updateBasicInfo(data: Partial<Pick<Student, 'name' | 'email' | 'phone' | 'nationality' | 'program'>>): void {
    if (data.name !== undefined) {
      const sanitized = this.sanitizeString(data.name);
      this.name = sanitized || this.name;
    }
    if (data.email !== undefined) {
      const sanitized = this.sanitizeString(data.email);
      if (sanitized !== undefined) {
        this.email = sanitized;
      }
    }
    if (data.phone !== undefined) {
      const sanitized = this.sanitizeString(data.phone);
      if (sanitized !== undefined) {
        this.phone = sanitized;
      }
    }
    if (data.nationality !== undefined) {
      const sanitized = this.sanitizeString(data.nationality);
      if (sanitized !== undefined) {
        this.nationality = sanitized;
      }
    }
    if (data.program !== undefined) {
      const sanitized = this.sanitizeString(data.program);
      if (sanitized !== undefined) {
        this.program = sanitized;
      }
    }
  }

  // 更新緊急聯絡人
  updateEmergencyContact(contact: EmergencyContact): void {
    const sanitizedEmail = this.sanitizeString(contact.email);
    const sanitizedAddress = this.sanitizeString(contact.address);
    
    this.emergency_contact = {
      name: this.sanitizeString(contact.name) || '',
      relationship: this.sanitizeString(contact.relationship) || '',
      phone: this.sanitizeString(contact.phone) || '',
      ...(sanitizedEmail !== undefined && { email: sanitizedEmail }),
      ...(sanitizedAddress !== undefined && { address: sanitizedAddress })
    };
  }

  // 計算在學時間（月數）
  getEnrollmentDurationInMonths(): number | null {
    if (!this.enrollment_date) return null;

    const endDate = this.isGraduated() && this.expected_graduation_date 
      ? this.expected_graduation_date 
      : new Date();

    const diffTime = endDate.getTime() - this.enrollment_date.getTime();
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // 平均每月30.44天

    return Math.max(0, diffMonths);
  }

  // 檢查是否即將畢業（6個月內）
  isNearGraduation(): boolean {
    if (!this.expected_graduation_date || !this.isActive()) {
      return false;
    }

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

    return this.expected_graduation_date <= sixMonthsFromNow;
  }

  // 取得狀態顯示名稱
  getStatusDisplayName(): string {
    const statusNames: Record<StudentStatus, string> = {
      [StudentStatus.ACTIVE]: '在學',
      [StudentStatus.GRADUATED]: '已畢業',
      [StudentStatus.SUSPENDED]: '停學',
      [StudentStatus.WITHDRAWN]: '退學'
    };

    return statusNames[this.status] || '未知狀態';
  }

  // 序列化為API回應格式
  toApiResponse(): Record<string, any> {
    return {
      student_id: this.student_id,
      name: this.name,
      email: this.email,
      nationality: this.nationality,
      program: this.program,
      enrollment_date: this.enrollment_date?.toISOString().split('T')[0], // 只返回日期部分
      expected_graduation_date: this.expected_graduation_date?.toISOString().split('T')[0],
      status: this.status,
      status_display_name: this.getStatusDisplayName(),
      passport_number: this.passport_number,
      phone: this.phone,
      emergency_contact: this.emergency_contact,
      enrollment_duration_months: this.getEnrollmentDurationInMonths(),
      is_near_graduation: this.isNearGraduation(),
      created_at: this.created_at?.toISOString(),
      updated_at: this.updated_at?.toISOString()
    };
  }

  // 序列化為簡要資訊格式
  toBriefInfo(): Record<string, any> {
    return {
      student_id: this.student_id,
      name: this.name,
      nationality: this.nationality,
      program: this.program,
      status: this.status,
      status_display_name: this.getStatusDisplayName()
    };
  }

  // 序列化為資料庫格式
  toDatabaseInsert(): Record<string, any> {
    const data = super.toDatabaseInsert();
    
    // 將emergency_contact轉換為JSON字串
    if (this.emergency_contact) {
      data.emergency_contact = JSON.stringify(this.emergency_contact);
    }
    
    return data;
  }

  toDatabaseUpdate(): Record<string, any> {
    const data = super.toDatabaseUpdate();
    
    // 將emergency_contact轉換為JSON字串
    if (this.emergency_contact) {
      data.emergency_contact = JSON.stringify(this.emergency_contact);
    }
    
    return data;
  }
}