// 匯出所有資料模型
export { BaseModel } from './base-model';
export { Unit } from './unit';
export { DocumentType, ValidationRules } from './document-type';
export { User, UserRole } from './user';
export { Student, StudentStatus, EmergencyContact } from './student';
export { StudentDocument, ContentType, DocumentStatus } from './student-document';
export { TrackingRecord, ActionType } from './tracking-record';
export { Notification, NotificationType, NotificationStatus, NotificationMetadata } from './notification';

// 匯出常用的類型和介面
export type {
  ValidationRules as DocumentValidationRules,
  EmergencyContact as StudentEmergencyContact,
  NotificationMetadata
};

// 匯出所有枚舉類型
export {
  UserRole,
  StudentStatus,
  ContentType,
  DocumentStatus,
  ActionType,
  NotificationType,
  NotificationStatus
};