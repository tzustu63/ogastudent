// 自定義錯誤類別基類
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: any;
  public readonly suggestions?: string[];

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    details?: any,
    suggestions?: string[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    this.suggestions = suggestions;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 驗證錯誤
export class ValidationError extends AppError {
  constructor(message: string, details?: any, suggestions?: string[]) {
    super(message, 400, 'VALIDATION_ERROR', true, details, suggestions);
  }
}

// 認證錯誤
export class AuthenticationError extends AppError {
  constructor(message: string = '認證失敗', details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, details);
  }
}

// 授權錯誤
export class AuthorizationError extends AppError {
  constructor(message: string = '權限不足', details?: any, suggestions?: string[]) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, details, suggestions);
  }
}

// 資源不存在錯誤
export class NotFoundError extends AppError {
  constructor(resource: string, details?: any) {
    super(`找不到${resource}`, 404, 'NOT_FOUND', true, details);
  }
}

// 衝突錯誤
export class ConflictError extends AppError {
  constructor(message: string, details?: any, suggestions?: string[]) {
    super(message, 409, 'CONFLICT_ERROR', true, details, suggestions);
  }
}

// 業務邏輯錯誤
export class BusinessLogicError extends AppError {
  constructor(message: string, details?: any, suggestions?: string[]) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', true, details, suggestions);
  }
}

// 資料庫錯誤
export class DatabaseError extends AppError {
  constructor(message: string = '資料庫操作失敗', details?: any) {
    super(message, 500, 'DATABASE_ERROR', false, details);
  }
}

// 外部服務錯誤
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, details?: any) {
    super(
      message || `外部服務 ${service} 不可用`,
      503,
      'EXTERNAL_SERVICE_ERROR',
      true,
      details
    );
  }
}

// 檔案上傳錯誤
export class FileUploadError extends AppError {
  constructor(message: string, details?: any, suggestions?: string[]) {
    super(message, 400, 'FILE_UPLOAD_ERROR', true, details, suggestions);
  }
}
