// 匯出基礎Repository類別和介面
export { BaseRepository, IRepository, PaginationOptions, PaginatedResult } from './base-repository';

// 匯出所有Repository實作
export { UnitRepository } from './unit-repository';
export { DocumentTypeRepository } from './document-type-repository';
export { UserRepository, UserFilter } from './user-repository';
export { StudentRepository, StudentFilter } from './student-repository';
export { StudentDocumentRepository, DocumentFilter } from './student-document-repository';
export { TrackingRecordRepository, TrackingFilter } from './tracking-record-repository';
export { NotificationRepository, NotificationFilter } from './notification-repository';

// 匯出常用的類型
export type {
  UserFilter as UserSearchFilter,
  StudentFilter as StudentSearchFilter,
  DocumentFilter as DocumentSearchFilter,
  TrackingFilter as TrackingSearchFilter,
  NotificationFilter
};