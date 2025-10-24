import { Router } from 'express';
import { Pool } from 'pg';
import { DocumentController } from '../controllers/document.controller';
import { 
  uploadSingle, 
  handleUploadError, 
  validateFileExists 
} from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { 
  checkDocumentUploadPermission,
  checkDocumentModifyPermission 
} from '../middleware/permission.middleware';

export function createDocumentRoutes(pool: Pool): Router {
  const router = Router();
  const documentController = new DocumentController(pool);

  // 所有路由都需要身份驗證
  router.use(authenticate);

  /**
   * 取得所有文件類型
   * GET /api/documents/types
   */
  router.get(
    '/types',
    documentController.getDocumentTypes
  );

  /**
   * 上傳檔案文件
   * POST /api/documents/upload
   * 需要權限：上傳文件
   */
  router.post(
    '/upload',
    checkDocumentUploadPermission(pool),
    uploadSingle,
    handleUploadError,
    validateFileExists,
    documentController.uploadFile
  );

  /**
   * 上傳網頁連結文件
   * POST /api/documents/link
   * 需要權限：上傳文件
   */
  router.post(
    '/link',
    checkDocumentUploadPermission(pool),
    documentController.uploadLink
  );

  /**
   * 驗證網頁連結
   * POST /api/documents/validate-url
   * 需要權限：上傳文件
   */
  router.post(
    '/validate-url',
    checkDocumentUploadPermission(pool),
    documentController.validateUrl
  );

  /**
   * 取得文件統計資訊
   * GET /api/documents/stats
   * 需要權限：查看統計
   */
  router.get(
    '/stats',
    documentController.getDocumentStats
  );

  /**
   * 搜尋文件
   * GET /api/documents/search
   * 需要權限：查看文件
   */
  router.get(
    '/search',
    documentController.searchDocuments
  );

  /**
   * 取得學生的所有文件
   * GET /api/documents/student/:studentId
   * 需要權限：查看文件
   */
  router.get(
    '/student/:studentId',
    documentController.getStudentDocuments
  );

  /**
   * 取得學生文件完成度
   * GET /api/documents/student/:studentId/completion
   * 需要權限：查看文件
   */
  router.get(
    '/student/:studentId/completion',
    documentController.getStudentCompletion
  );

  /**
   * 取得文件詳細資訊
   * GET /api/documents/:id
   * 需要權限：查看文件
   */
  router.get(
    '/:id',
    documentController.getDocument
  );

  /**
   * 下載文件
   * GET /api/documents/:id/download
   * 需要權限：下載文件
   */
  router.get(
    '/:id/download',
    documentController.downloadDocument
  );

  /**
   * 更新文件
   * PUT /api/documents/:id
   * 需要權限：更新文件
   */
  router.put(
    '/:id',
    checkDocumentModifyPermission(pool),
    uploadSingle,
    handleUploadError,
    documentController.updateDocument
  );

  /**
   * 更新文件狀態
   * PUT /api/documents/:id/status
   * 需要權限：審核文件
   */
  router.put(
    '/:id/status',
    documentController.updateDocumentStatus
  );

  /**
   * 刪除文件
   * DELETE /api/documents/:id
   * 需要權限：刪除文件
   */
  router.delete(
    '/:id',
    checkDocumentModifyPermission(pool),
    documentController.deleteDocument
  );

  return router;
}
