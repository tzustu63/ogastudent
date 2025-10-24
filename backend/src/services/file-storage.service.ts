import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);
const statAsync = promisify(fs.stat);
const readFileAsync = promisify(fs.readFile);

export interface FileMetadata {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimeType: string;
  extension: string;
}

export interface StorageResult {
  success: boolean;
  filePath?: string;
  metadata?: FileMetadata;
  error?: string;
}

export class FileStorageService {
  private uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir || path.join(__dirname, '../../uploads');
    this.ensureUploadDirExists();
  }

  /**
   * 確保上傳目錄存在
   */
  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 儲存檔案（已由multer處理，此方法用於記錄和驗證）
   */
  async saveFile(file: Express.Multer.File): Promise<StorageResult> {
    try {
      // 驗證檔案是否存在
      const exists = await this.fileExists(file.path);
      if (!exists) {
        return {
          success: false,
          error: '檔案儲存失敗'
        };
      }

      // 取得檔案資訊
      const stats = await statAsync(file.path);
      const extension = path.extname(file.originalname).toLowerCase().substring(1);

      const metadata: FileMetadata = {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: stats.size,
        mimeType: file.mimetype,
        extension
      };

      return {
        success: true,
        filePath: file.path,
        metadata
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '檔案儲存失敗'
      };
    }
  }

  /**
   * 刪除檔案
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      // 確保檔案路徑在上傳目錄內（安全性檢查）
      const normalizedPath = path.normalize(filePath);
      const normalizedUploadDir = path.normalize(this.uploadDir);
      
      if (!normalizedPath.startsWith(normalizedUploadDir)) {
        throw new Error('無效的檔案路徑');
      }

      // 檢查檔案是否存在
      const exists = await this.fileExists(filePath);
      if (!exists) {
        return false;
      }

      // 刪除檔案
      await unlinkAsync(filePath);
      return true;
    } catch (error) {
      console.error('刪除檔案失敗:', error);
      return false;
    }
  }

  /**
   * 檢查檔案是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await statAsync(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 取得檔案資訊
   */
  async getFileInfo(filePath: string): Promise<FileMetadata | null> {
    try {
      const exists = await this.fileExists(filePath);
      if (!exists) {
        return null;
      }

      const stats = await statAsync(filePath);
      const filename = path.basename(filePath);
      const extension = path.extname(filePath).toLowerCase().substring(1);

      return {
        filename,
        originalName: filename,
        path: filePath,
        size: stats.size,
        mimeType: this.getMimeTypeFromExtension(extension),
        extension
      };
    } catch (error) {
      console.error('取得檔案資訊失敗:', error);
      return null;
    }
  }

  /**
   * 讀取檔案內容
   */
  async readFile(filePath: string): Promise<Buffer | null> {
    try {
      // 安全性檢查
      const normalizedPath = path.normalize(filePath);
      const normalizedUploadDir = path.normalize(this.uploadDir);
      
      if (!normalizedPath.startsWith(normalizedUploadDir)) {
        throw new Error('無效的檔案路徑');
      }

      const exists = await this.fileExists(filePath);
      if (!exists) {
        return null;
      }

      return await readFileAsync(filePath);
    } catch (error) {
      console.error('讀取檔案失敗:', error);
      return null;
    }
  }

  /**
   * 移動檔案到新位置
   */
  async moveFile(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      // 安全性檢查
      const normalizedSource = path.normalize(sourcePath);
      const normalizedDest = path.normalize(destinationPath);
      const normalizedUploadDir = path.normalize(this.uploadDir);
      
      if (!normalizedSource.startsWith(normalizedUploadDir) || 
          !normalizedDest.startsWith(normalizedUploadDir)) {
        throw new Error('無效的檔案路徑');
      }

      // 確保目標目錄存在
      const destDir = path.dirname(destinationPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // 移動檔案
      fs.renameSync(sourcePath, destinationPath);
      return true;
    } catch (error) {
      console.error('移動檔案失敗:', error);
      return false;
    }
  }

  /**
   * 複製檔案
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<boolean> {
    try {
      // 安全性檢查
      const normalizedSource = path.normalize(sourcePath);
      const normalizedDest = path.normalize(destinationPath);
      const normalizedUploadDir = path.normalize(this.uploadDir);
      
      if (!normalizedSource.startsWith(normalizedUploadDir) || 
          !normalizedDest.startsWith(normalizedUploadDir)) {
        throw new Error('無效的檔案路徑');
      }

      // 確保目標目錄存在
      const destDir = path.dirname(destinationPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // 複製檔案
      fs.copyFileSync(sourcePath, destinationPath);
      return true;
    } catch (error) {
      console.error('複製檔案失敗:', error);
      return false;
    }
  }

  /**
   * 取得檔案的相對路徑（相對於上傳目錄）
   */
  getRelativePath(absolutePath: string): string {
    return path.relative(this.uploadDir, absolutePath);
  }

  /**
   * 取得檔案的絕對路徑
   */
  getAbsolutePath(relativePath: string): string {
    return path.join(this.uploadDir, relativePath);
  }

  /**
   * 根據副檔名取得MIME類型
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * 格式化檔案大小
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * 驗證檔案大小
   */
  validateFileSize(size: number, maxSize?: number): boolean {
    const limit = maxSize || parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10);
    return size <= limit;
  }

  /**
   * 驗證檔案類型
   */
  validateFileType(extension: string): boolean {
    const allowedTypes = (process.env.UPLOAD_ALLOWED_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(',');
    return allowedTypes.includes(extension.toLowerCase());
  }

  /**
   * 清理舊檔案（刪除超過指定天數的檔案）
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    let deletedCount = 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const cleanupDirectory = async (dir: string): Promise<void> => {
      const files = fs.readdirSync(dir);

      for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
          await cleanupDirectory(filePath);
        } else if (stats.mtime < cutoffDate) {
          try {
            await unlinkAsync(filePath);
            deletedCount++;
          } catch (error) {
            console.error(`無法刪除檔案 ${filePath}:`, error);
          }
        }
      }
    };

    try {
      await cleanupDirectory(this.uploadDir);
      return deletedCount;
    } catch (error) {
      console.error('清理舊檔案失敗:', error);
      return deletedCount;
    }
  }
}

// 匯出單例實例
export const fileStorageService = new FileStorageService();
