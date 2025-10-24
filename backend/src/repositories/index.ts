// 匯出基礎Repository類別和介面
export { BaseRepository } from './base-repository';
export type { IRepository, PaginationOptions, PaginatedResult } from './base-repository';

// 匯出所有Repository實作
export { UnitRepository } from './unit-repository';
export { DocumentTypeRepository } from './document-type-repository';
export { UserRepository } from './user-repository';
export { StudentRepository } from './student-repository';
export { StudentDocumentRepository } from './student-document-repository';
export { TrackingRecordRepository } from './tracking-record-repository';
export { NotificationRepository } from './notification-repository';

// 匯出類型定義
export type { UserFilter } from './user-repository';
export type { StudentFilter } from './student-repository';
export type { DocumentFilter } from './student-document-repository';
export type { TrackingFilter } from './tracking-record-repository';
export type { NotificationFilter } from './notification-repository';

// 匯出類型別名
export type { UserFilter as UserSearchFilter } from './user-repository';
export type { StudentFilter as StudentSearchFilter } from './student-repository';
export type { DocumentFilter as DocumentSearchFilter } from './student-document-repository';
export type { TrackingFilter as TrackingSearchFilter } from './tracking-record-repository';
export type { NotificationFilter as NotificationSearchFilter } from './notification-repository';