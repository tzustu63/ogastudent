import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// 允許的檔案類型和對應的MIME類型
const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  'pdf': ['application/pdf'],
  'doc': ['application/msword'],
  'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'jpg': ['image/jpeg'],
  'jpeg': ['image/jpeg'],
  'png': ['image/png']
};

// 從環境變數取得設定
const MAX_FILE_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10); // 預設 10MB
const ALLOWED_EXTENSIONS = (process.env.UPLOAD_ALLOWED_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(',');

// 確保上傳目錄存在
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 設定檔案儲存
const storage = multer.diskStorage({
  destination: (req: Request, _file: Express.Multer.File, cb) => {
    // 根據文件類型建立子目錄
    const typeId = req.body.type_id || 'general';
    const uploadPath = path.join(UPLOAD_DIR, typeId);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // 產生唯一檔名：時間戳_隨機字串_原始檔名
    // 保留中文和其他 Unicode 字符，只移除檔案系統不允許的特殊字符
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    // 只移除檔案系統不允許的字符：/ \ : * ? " < > |
    const sanitizedBasename = basename.replace(/[\/\\:*?"<>|]/g, '_');
    
    const filename = `${timestamp}_${randomString}_${sanitizedBasename}${ext}`;
    cb(null, filename);
  }
});

// 檔案過濾器
const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  // 取得檔案副檔名
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  
  // 檢查副檔名是否允許
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`不支援的檔案類型。允許的類型：${ALLOWED_EXTENSIONS.join(', ')}`));
  }
  
  // 檢查MIME類型
  const allowedMimeTypes = ALLOWED_FILE_TYPES[ext];
  if (!allowedMimeTypes || !allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error(`檔案MIME類型不符。檔案類型：${ext}，MIME類型：${file.mimetype}`));
  }
  
  cb(null, true);
};

// 建立multer實例，強制使用 UTF-8 編碼
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // 一次只允許上傳一個檔案
  }
});

// 修正檔名編碼的中介軟體
export const fixFilenameEncoding = (req: Request, _res: any, next: any) => {
  if (req.file && req.file.originalname) {
    try {
      // Multer 預設用 latin1 解碼，我們需要轉回 UTF-8
      const latin1Buffer = Buffer.from(req.file.originalname, 'latin1');
      req.file.originalname = latin1Buffer.toString('utf8');
    } catch (error) {
      console.error('檔名編碼轉換失敗:', error);
      // 如果轉換失敗，保持原樣
    }
  }
  next();
};

// 單檔上傳中介軟體（包含編碼修正）
export const uploadSingleWithEncoding = [upload.single('file'), fixFilenameEncoding];

// 向後兼容的別名
export const uploadSingle = uploadSingleWithEncoding;

// 多檔上傳中介軟體（最多5個檔案）
export const uploadMultiple = upload.array('files', 5);

// 錯誤處理中介軟體
export const handleUploadError = (err: any, _req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // Multer 錯誤
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: `檔案大小超過限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`,
          details: {
            max_size: MAX_FILE_SIZE,
            max_size_mb: MAX_FILE_SIZE / 1024 / 1024
          }
        }
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_FILES',
          message: '上傳檔案數量超過限制',
          details: {
            max_files: 5
          }
        }
      });
    }
    
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNEXPECTED_FIELD',
          message: '未預期的檔案欄位',
          details: {
            field: err.field
          }
        }
      });
    }
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      }
    });
  }
  
  if (err) {
    // 其他錯誤（如檔案類型錯誤）
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message,
        suggestions: [
          `允許的檔案類型：${ALLOWED_EXTENSIONS.join(', ')}`,
          `檔案大小限制：${MAX_FILE_SIZE / 1024 / 1024}MB`
        ]
      }
    });
  }
  
  next();
};

// 驗證檔案是否存在
export const validateFileExists = (req: Request, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_UPLOADED',
        message: '未上傳檔案',
        suggestions: [
          '請確保使用 multipart/form-data 格式上傳',
          '檔案欄位名稱應為 "file"'
        ]
      }
    });
  }
  
  next();
};

// 取得允許的檔案類型資訊
export const getAllowedFileTypes = () => {
  return {
    extensions: ALLOWED_EXTENSIONS,
    mime_types: ALLOWED_FILE_TYPES,
    max_size: MAX_FILE_SIZE,
    max_size_mb: MAX_FILE_SIZE / 1024 / 1024
  };
};
