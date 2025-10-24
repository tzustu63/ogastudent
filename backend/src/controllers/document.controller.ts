import { Request, Response } from 'express';
import { Pool } from 'pg';
import { DocumentService } from '../services/document.service';
import { DocumentStatus } from '../models/student-document';

export class DocumentController {
  private documentService: DocumentService;

  constructor(pool: Pool) {
    this.documentService = new DocumentService(pool);
  }

  /**
   * 上傳檔案文件
   * POST /api/documents/upload
   */
  uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { student_id, type_id, remarks } = req.body;
      const uploader_id = (req as any).user?.user_id;

      // 詳細日誌
      console.log('上傳請求 body:', req.body);
      console.log('上傳檔案:', req.file);
      console.log('上傳者 ID:', uploader_id);

      if (!student_id || !type_id) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '缺少必填欄位',
            details: {
              required_fields: ['student_id', 'type_id'],
              received: { student_id, type_id }
            }
          }
        });
        return;
      }

      if (!uploader_id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const document = await this.documentService.uploadFileDocument({
        student_id,
        type_id,
        uploader_id,
        ...(req.file && { file: req.file }),
        remarks
      });

      res.status(201).json({
        success: true,
        message: '檔案上傳成功',
        data: document.toApiResponse()
      });
    } catch (error) {
      console.error('上傳檔案失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : '檔案上傳失敗'
        }
      });
    }
  };

  /**
   * 上傳網頁連結文件
   * POST /api/documents/link
   */
  uploadLink = async (req: Request, res: Response): Promise<void> => {
    try {
      const { student_id, type_id, web_url, remarks } = req.body;
      const uploader_id = (req as any).user?.user_id;

      if (!student_id || !type_id || !web_url) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '缺少必填欄位',
            details: {
              required_fields: ['student_id', 'type_id', 'web_url']
            }
          }
        });
        return;
      }

      if (!uploader_id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const document = await this.documentService.uploadWebLinkDocument({
        student_id,
        type_id,
        uploader_id,
        web_url,
        remarks
      });

      res.status(201).json({
        success: true,
        message: '網頁連結上傳成功',
        data: document.toApiResponse()
      });
    } catch (error) {
      console.error('上傳網頁連結失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: error instanceof Error ? error.message : '網頁連結上傳失敗'
        }
      });
    }
  };

  /**
   * 取得文件詳細資訊
   * GET /api/documents/:id
   */
  getDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const document = await this.documentService.getDocument(id);

      if (!document) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: '文件不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        data: document.toApiResponse()
      });
    } catch (error) {
      console.error('取得文件失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : '取得文件失敗'
        }
      });
    }
  };

  /**
   * 下載文件
   * GET /api/documents/:id/download
   */
  downloadDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const result = await this.documentService.downloadDocument(id);

      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: '文件不存在'
          }
        });
        return;
      }

      const { buffer, metadata } = result;

      // 設定回應標頭
      res.setHeader('Content-Type', metadata.mimeType);
      // 使用 RFC 5987 和 RFC 2231 格式支援中文檔名（兼容新舊瀏覽器）
      const encodedFilename = encodeURIComponent(metadata.originalName);
      const asciiFilename = metadata.originalName.replace(/[^\x00-\x7F]/g, '_'); // 備用 ASCII 檔名
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`
      );
      res.setHeader('Content-Length', buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error('下載文件失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DOWNLOAD_FAILED',
          message: error instanceof Error ? error.message : '下載文件失敗'
        }
      });
    }
  };

  /**
   * 更新文件
   * PUT /api/documents/:id
   */
  updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { web_url, remarks, status } = req.body;

      const document = await this.documentService.updateDocument({
        document_id: id,
        ...(req.file && { file: req.file }),
        web_url,
        remarks,
        status: status as DocumentStatus
      });

      res.json({
        success: true,
        message: '文件更新成功',
        data: document.toApiResponse()
      });
    } catch (error) {
      console.error('更新文件失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error instanceof Error ? error.message : '更新文件失敗'
        }
      });
    }
  };

  /**
   * 刪除文件
   * DELETE /api/documents/:id
   */
  deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user_id = (req as any).user?.user_id;

      if (!user_id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const deleted = await this.documentService.deleteDocument(id, user_id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: '文件不存在'
          }
        });
        return;
      }

      res.json({
        success: true,
        message: '文件刪除成功'
      });
    } catch (error) {
      console.error('刪除文件失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_FAILED',
          message: error instanceof Error ? error.message : '刪除文件失敗'
        }
      });
    }
  };

  /**
   * 取得學生的所有文件
   * GET /api/documents/student/:studentId
   */
  getStudentDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;
      const { page, limit, sort_by, sort_order } = req.query;

      // 如果有分頁參數，使用分頁查詢
      if (page || limit) {
        const result = await this.documentService.getStudentDocumentsPaginated(studentId, {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 10,
          sortBy: sort_by as string,
          sortOrder: sort_order as 'ASC' | 'DESC'
        });

        res.json({
          success: true,
          data: result.data.map(doc => doc.toApiResponse()),
          pagination: result.pagination
        });
      } else {
        // 否則返回所有當前文件
        const documents = await this.documentService.getStudentDocuments(studentId);

        res.json({
          success: true,
          data: documents.map(doc => doc.toApiResponse())
        });
      }
    } catch (error) {
      console.error('取得學生文件失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: error instanceof Error ? error.message : '取得學生文件失敗'
        }
      });
    }
  };

  /**
   * 搜尋文件
   * GET /api/documents/search
   */
  searchDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        student_id,
        type_id,
        uploader_id,
        content_type,
        status,
        is_current,
        uploaded_from,
        uploaded_to,
        page,
        limit,
        sort_by,
        sort_order
      } = req.query;

      const filters: any = {};
      if (student_id) filters.student_id = student_id;
      if (type_id) filters.type_id = type_id;
      if (uploader_id) filters.uploader_id = uploader_id;
      if (content_type) filters.content_type = content_type;
      if (status) filters.status = status;
      if (is_current !== undefined) filters.is_current = is_current === 'true';
      if (uploaded_from) filters.uploaded_from = new Date(uploaded_from as string);
      if (uploaded_to) filters.uploaded_to = new Date(uploaded_to as string);

      const result = await this.documentService.searchDocuments(filters, {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sortBy: sort_by as string,
        sortOrder: sort_order as 'ASC' | 'DESC'
      });

      res.json({
        success: true,
        data: result.data.map(doc => doc.toApiResponse()),
        pagination: result.pagination
      });
    } catch (error) {
      console.error('搜尋文件失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: error instanceof Error ? error.message : '搜尋文件失敗'
        }
      });
    }
  };

  /**
   * 更新文件狀態
   * PUT /api/documents/:id/status
   */
  updateDocumentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;
      const user_id = (req as any).user?.user_id;

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: '缺少必填欄位',
            details: {
              required_fields: ['status']
            }
          }
        });
        return;
      }

      if (!user_id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '未授權的請求'
          }
        });
        return;
      }

      const document = await this.documentService.updateDocumentStatus(
        id,
        status as DocumentStatus,
        user_id,
        remarks
      );

      res.json({
        success: true,
        message: '文件狀態更新成功',
        data: document.toApiResponse()
      });
    } catch (error) {
      console.error('更新文件狀態失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_STATUS_FAILED',
          message: error instanceof Error ? error.message : '更新文件狀態失敗'
        }
      });
    }
  };

  /**
   * 取得學生文件完成度
   * GET /api/documents/student/:studentId/completion
   */
  getStudentCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId } = req.params;

      const completion = await this.documentService.getStudentCompletion(studentId);

      res.json({
        success: true,
        data: completion
      });
    } catch (error) {
      console.error('取得學生文件完成度失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_COMPLETION_FAILED',
          message: error instanceof Error ? error.message : '取得學生文件完成度失敗'
        }
      });
    }
  };

  /**
   * 取得文件統計資訊
   * GET /api/documents/stats
   */
  getDocumentStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.documentService.getDocumentStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('取得文件統計資訊失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_STATS_FAILED',
          message: error instanceof Error ? error.message : '取得文件統計資訊失敗'
        }
      });
    }
  };

  /**
   * 取得所有文件類型
   * GET /api/documents/types
   */
  getDocumentTypes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const documentTypes = await this.documentService.getDocumentTypes();

      res.status(200).json({
        success: true,
        data: documentTypes.map(type => ({
          id: type.type_id,
          typeName: type.type_name,
          typeNameEn: type.type_name_en,
          responsibleUnitId: type.responsible_unit_id,
          isRequired: type.is_required,
          validationRules: type.validation_rules,
          displayOrder: type.display_order
        }))
      });
    } catch (error) {
      console.error('取得文件類型失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DOCUMENT_TYPES_FAILED',
          message: '取得文件類型失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 驗證網頁連結
   * POST /api/documents/validate-url
   */
  validateUrl = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url, check_accessibility } = req.body;

      if (!url) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_URL',
            message: '缺少URL參數'
          }
        });
        return;
      }

      const { urlValidationService } = await import('../services/url-validation.service');
      
      // 驗證URL
      const validationResult = await urlValidationService.validateUrl(
        url,
        check_accessibility === true
      );

      // 執行安全檢查
      const securityCheck = await urlValidationService.performSecurityCheck(url);

      res.json({
        success: true,
        data: {
          url,
          normalized_url: urlValidationService.normalizeUrl(url),
          is_valid: validationResult.isValid,
          is_accessible: validationResult.isAccessible,
          is_secure: urlValidationService.isSecureUrl(url),
          domain: urlValidationService.extractDomain(url),
          status_code: validationResult.statusCode,
          redirect_url: validationResult.redirectUrl,
          security_check: securityCheck,
          error: validationResult.error
        }
      });
    } catch (error) {
      console.error('驗證URL失敗:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: error instanceof Error ? error.message : '驗證URL失敗'
        }
      });
    }
  };
}
