// 前端共用類型定義

export interface Student {
  student_id: string;
  name: string;
  email: string;
  nationality: string;
  program: string;
  enrollment_date: string;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  username: string;
  email: string;
  name: string;
  unit_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  uploaded_at: string;
  updated_at: string;
}

export interface TrackingRecord {
  record_id: string;
  student_id: string;
  document_id?: string;
  user_id: string;
  action_type: ActionType;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
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

// API 相關類型
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

// 表單類型
export interface LoginForm {
  username: string;
  password: string;
}

export interface DocumentUploadForm {
  student_id: string;
  type_id: string;
  content_type: DocumentContentType;
  file?: File;
  web_url?: string;
  remarks: string;
}

// UI 狀態類型
export interface LoadingState {
  [key: string]: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
}

// 分頁和篩選類型
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

export interface StudentFilter {
  name?: string;
  nationality?: string;
  program?: string;
  status?: StudentStatus;
  enrollment_date_from?: string;
  enrollment_date_to?: string;
}

export interface DocumentFilter {
  student_id?: string;
  type_id?: string;
  uploader_id?: string;
  status?: DocumentStatus;
  uploaded_from?: string;
  uploaded_to?: string;
}

// 統計類型
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