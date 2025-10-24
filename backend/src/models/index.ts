// 匯出所有資料模型
export { BaseModel } from './base-model';
export { Unit } from './unit';
export { DocumentType } from './document-type';
export type { ValidationRules } from './document-type';
export { User, UserRole } from './user';
export { Student, StudentStatus } from './student';
export type { EmergencyContact } from './student';
export { StudentDocument, ContentType, DocumentStatus } from './student-document';
export { TrackingRecord, ActionType } from './tracking-record';
export { Notification, NotificationType, NotificationStatus } from './notification';
export type { NotificationMetadata } from './notification';

// 匯出常用的類型別名
export type {
  ValidationRules as DocumentValidationRules,
  EmergencyContact as StudentEmergencyContact
};