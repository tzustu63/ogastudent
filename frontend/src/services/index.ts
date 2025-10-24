export { default as apiClient } from './api';
export { default as authService } from './auth.service';
export { default as studentService } from './student.service';
export { default as documentService } from './document.service';
export { default as reportService } from './report.service';

export type { LoginCredentials, LoginResponse, User } from './auth.service';
export type {
  Student,
  StudentDocument,
  StudentProfile,
  StudentListParams,
  StudentListResponse,
} from './student.service';
export type {
  DocumentType,
  UploadDocumentData,
  AddWebLinkData,
  UpdateDocumentStatusData,
} from './document.service';
export type {
  DashboardStats,
  AuditReport,
  AuditReportParams,
} from './report.service';
