import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { UserRole } from '../types';
import { DocumentTypeRepository } from '../repositories/document-type-repository';

/**
 * 權限管理中介軟體
 * 提供基於角色和單位的權限控制
 */

/**
 * 檢查使用者是否可以上傳特定類型的文件
 * 根據文件類型的responsible_unit_id與使用者的unit_id進行比對
 */
export const checkDocumentUploadPermission = (pool: Pool) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        console.error('權限檢查失敗：未找到使用者資訊');
        console.error('Headers:', req.headers);
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要身份驗證',
            details: '請確保已登入並提供有效的 JWT token'
          }
        });
        return;
      }

      // 管理員可以上傳所有類型的文件
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // 從請求中取得文件類型ID
      const documentTypeId = req.body.type_id || req.params.type_id;

      if (!documentTypeId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DOCUMENT_TYPE',
            message: '請提供文件類型ID'
          }
        });
        return;
      }

      // 查詢文件類型的負責單位
      const documentTypeRepo = new DocumentTypeRepository(pool);
      const documentType = await documentTypeRepo.findById(documentTypeId);

      if (!documentType) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_TYPE_NOT_FOUND',
            message: '找不到指定的文件類型'
          }
        });
        return;
      }

      // 檢查使用者的單位是否與文件類型的負責單位相符
      if (req.user.unit_id !== documentType.responsible_unit_id) {
        res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSION',
            message: '您沒有權限上傳此類型的文件',
            details: {
              required_unit: documentType.responsible_unit_id,
              user_unit: req.user.unit_id,
              document_type: documentType.type_name
            },
            suggestions: ['此文件類型由其他單位負責', '請聯繫相關單位進行上傳']
          }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Check document upload permission error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: '權限檢查失敗'
        }
      });
    }
  };
};

/**
 * 檢查使用者是否可以查看特定學生的資料
 * 管理員和稽核人員可以查看所有學生
 * 單位職員只能查看與自己單位相關的資料
 * 學生只能查看自己的資料
 */
export const checkStudentAccessPermission = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要身份驗證'
          }
        });
        return;
      }

      // 管理員和稽核人員可以查看所有學生資料
      if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.AUDITOR) {
        next();
        return;
      }

      // 從請求中取得學生ID
      const studentId = req.params.student_id || req.body.student_id;

      if (!studentId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_STUDENT_ID',
            message: '請提供學生ID'
          }
        });
        return;
      }

      // 學生只能查看自己的資料
      if (req.user.role === UserRole.STUDENT) {
        if (req.user.user_id !== studentId) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: '您只能查看自己的資料'
            }
          });
          return;
        }
        next();
        return;
      }

      // 單位職員可以查看所有學生資料（因為他們需要上傳文件）
      if (req.user.role === UserRole.UNIT_STAFF) {
        next();
        return;
      }

      // 其他情況拒絕存取
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '權限不足'
        }
      });
    } catch (error) {
      console.error('Check student access permission error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: '權限檢查失敗'
        }
      });
    }
  };
};

/**
 * 檢查使用者是否可以修改或刪除文件
 * 只有文件的上傳者或管理員可以修改/刪除
 */
export const checkDocumentModifyPermission = (pool: Pool) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要身份驗證'
          }
        });
        return;
      }

      // 管理員可以修改所有文件
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // 從請求中取得文件ID
      const documentId = req.params.document_id || req.body.document_id;

      if (!documentId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_DOCUMENT_ID',
            message: '請提供文件ID'
          }
        });
        return;
      }

      // 查詢文件資訊
      const query = 'SELECT uploader_id FROM student_documents WHERE document_id = $1';
      const result = await pool.query(query, [documentId]);

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: '找不到指定的文件'
          }
        });
        return;
      }

      const uploaderId = result.rows[0].uploader_id;

      // 檢查是否為文件的上傳者
      if (req.user.user_id !== uploaderId) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '您只能修改自己上傳的文件',
            suggestions: ['請聯繫文件上傳者或系統管理員']
          }
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Check document modify permission error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: '權限檢查失敗'
        }
      });
    }
  };
};

/**
 * 檢查使用者是否可以存取單位資料
 * 管理員和稽核人員可以存取所有單位
 * 單位職員只能存取自己的單位
 */
export const checkUnitAccessPermission = (allowedUnitIds?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要身份驗證'
          }
        });
        return;
      }

      // 管理員和稽核人員可以存取所有單位
      if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.AUDITOR) {
        next();
        return;
      }

      // 從請求中取得單位ID
      const unitId = req.params.unit_id || req.body.unit_id || req.query.unit_id;

      if (!unitId) {
        // 如果沒有指定單位ID，使用使用者自己的單位
        next();
        return;
      }

      // 如果指定了允許的單位清單，檢查單位ID是否在清單中
      if (allowedUnitIds && !allowedUnitIds.includes(unitId as string)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '無權存取此單位資料',
            details: {
              allowed_units: allowedUnitIds,
              requested_unit: unitId
            }
          }
        });
        return;
      }

      // 單位職員只能存取自己的單位
      if (req.user.role === UserRole.UNIT_STAFF) {
        if (req.user.unit_id !== unitId) {
          res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: '您只能存取自己單位的資料',
              details: {
                user_unit: req.user.unit_id,
                requested_unit: unitId
              }
            }
          });
          return;
        }
      }

      next();
    } catch (error) {
      console.error('Check unit access permission error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: '權限檢查失敗'
        }
      });
    }
  };
};

/**
 * 檢查使用者是否可以存取報表和統計資料
 * 只有管理員、稽核人員和單位主管可以存取
 */
export const checkReportAccessPermission = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '需要身份驗證'
          }
        });
        return;
      }

      // 管理員和稽核人員可以存取所有報表
      if (req.user.role === UserRole.ADMIN || req.user.role === UserRole.AUDITOR) {
        next();
        return;
      }

      // 單位職員可以存取自己單位的報表
      if (req.user.role === UserRole.UNIT_STAFF) {
        // 可以在這裡加入額外的檢查，例如是否為單位主管
        next();
        return;
      }

      // 學生不能存取報表
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '您沒有權限存取報表功能',
          suggestions: ['此功能僅限管理人員使用']
        }
      });
    } catch (error) {
      console.error('Check report access permission error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'PERMISSION_CHECK_FAILED',
          message: '權限檢查失敗'
        }
      });
    }
  };
};
