// 匯出基礎Repository類別和介面
export { BaseRepository } from './base-repository';
export type { IRepository, PaginationOptions, PaginatedResult } from './base-repository';

// 匯出所有Repository實作
export { UnitRepository } from './unit-repository';
export { DocumentTypeRepository } from './document-type-repository';
export { UserRepository } from './user-repository';
export type { UserFilter } from './user-repository';
export { StudentRepository } from './student-repository';
export type { StudentFilter } from './student-repository';
export { StudentDocumentRepository } from './student-document-repository';
export type { DocumentFilter } from './student-document-repository';
export { TrackingRecordRepository } from './tracking-record-repository';
export type { TrackingFilter } from './tracking-record-repository';
export { NotificationRepository } from './notification-repository';
export type { NotificationFilter } from './notification-repository';

// 匯出常用的類型別名
export type {
  UserFilter as UserSearchFilter,
  StudentFilter as StudentSearchFilter,
  DocumentFilter as DocumentSearchFilter,
  TrackingFilter as TrackingSearchFilter,
  NotificationFilter as NotificationSearchFilter
};