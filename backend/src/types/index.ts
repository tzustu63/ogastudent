// 核心資料類型定義

export interface Student {
  student_id: string;
  name: string;
  email: string;
  nationality: string;
  program: string;
  enrollment_date: Date;
  status: StudentStatus;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  name: string;
  unit_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Unit {
  unit_id: string;
  unit_name: string;
  unit_name_en: string;
  description: string;
  is_active: boolean;
}

export interface DocumentType {
  type_id: string;
  type_name: string;
  type_name_en: string;
  responsible_unit_id: string;
  is_required: boolean;
  validation_rules: string;
}

export interface StudentDocument {
  document_id: string;
  student_id: string;
  type_id: string;
  uploader_id: string;
  content_type: DocumentContentType;
  file_path?: string;
  web_url?: string;
  remarks: string;
  status: DocumentStatus;
  uploaded_at: Date;
  updated_at: Date;
}

export interface TrackingRecord {
  record_id: string;
  student_id: string;
  document_id?: string;
  user_id: string;
  action_type: ActionType;
  description: string;
  metadata: Record<string, any>;
  created_at: Date;
}

// 列舉類型
export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended'
}

export enum UserRole {
  ADMIN = 'admin',
  UNIT_STAFF = 'unit_staff',
  AUDITOR = 'auditor',
  STUDENT = 'student'
}

export enum DocumentContentType {
  FILE = 'file',
  WEB_LINK = 'web_link'
}

export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum ActionType {
  UPLOAD = 'upload',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  APPROVE = 'approve',
  REJECT = 'reject'
}

// API 回應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  suggestions?: string[];
}

// 分頁類型
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// 篩選和搜尋類型
export interface StudentFilter {
  name?: string;
  nationality?: string;
  program?: string;
  status?: StudentStatus;
  enrollment_date_from?: Date;
  enrollment_date_to?: Date;
}

export interface DocumentFilter {
  student_id?: string;
  type_id?: string;
  uploader_id?: string;
  status?: DocumentStatus;
  uploaded_from?: Date;
  uploaded_to?: Date;
}

// 統計和報表類型
export interface CompletionStats {
  student_id: string;
  total_required: number;
  completed: number;
  completion_rate: number;
  missing_documents: string[];
}

export interface UnitStats {
  unit_id: string;
  unit_name: string;
  total_documents: number;
  pending_documents: number;
  completion_rate: number;
}

// 身份驗證相關類型
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: {
    user_id: string;
    username: string;
    email: string;
    name: string;
    role: UserRole;
    unit_id: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in: number;
}
