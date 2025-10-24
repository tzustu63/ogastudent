import { Request, Response } from 'express';
import { Pool } from 'pg';
import { StudentService } from '../services/student.service';
import { StudentStatus } from '../models/student';

export class StudentController {
  private studentService: StudentService;

  constructor(pool: Pool) {
    this.studentService = new StudentService(pool);
  }

  /**
   * 建立新學生
   * POST /api/students
   */
  createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const studentData = req.body;

      const student = await this.studentService.createStudent(studentData);

      res.status(201).json({
        success: true,
        data: student.toApiResponse(),
        message: '學生建立成功'
      });
    } catch (error) {
      console.error('Create student error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('已存在') || error.message.includes('已被使用')) {
          res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_ENTRY',
              message: error.message
            }
          });
          return;
        }
        
        if (error.message.includes('驗證失敗')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message
            }
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_STUDENT_FAILED',
          message: '建立學生失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 更新學生資料
   * PUT /api/students/:id
   */
  updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await this.studentService.updateStudent(id, updateData);

      res.status(200).json({
        success: true,
        data: student.toApiResponse(),
        message: '學生資料更新成功'
      });
    } catch (error) {
      console.error('Update student error:', error);
      
      if (error instanceof Error) {
        if (error.message === '找不到學生') {
          res.status(404).json({
            success: false,
            error: {
              code: 'STUDENT_NOT_FOUND',
              message: '找不到學生'
            }
          });
          return;
        }
        
        if (error.message.includes('已被使用')) {
          res.status(409).json({
            success: false,
            error: {
              code: 'DUPLICATE_ENTRY',
              message: error.message
            }
          });
          return;
        }
        
        if (error.message.includes('驗證失敗')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message
            }
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_STUDENT_FAILED',
          message: '更新學生資料失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 刪除學生
   * DELETE /api/students/:id
   */
  deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await this.studentService.deleteStudent(id);

      res.status(200).json({
        success: true,
        message: '學生刪除成功'
      });
    } catch (error) {
      console.error('Delete student error:', error);
      
      if (error instanceof Error) {
        if (error.message === '找不到學生') {
          res.status(404).json({
            success: false,
            error: {
              code: 'STUDENT_NOT_FOUND',
              message: '找不到學生'
            }
          });
          return;
        }
        
        if (error.message.includes('無法刪除')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'CANNOT_DELETE',
              message: error.message
            }
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_STUDENT_FAILED',
          message: '刪除學生失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 取得單一學生資料
   * GET /api/students/:id
   */
  getStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const student = await this.studentService.getStudentById(id);

      if (!student) {
        res.status(404).json({
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: '找不到學生'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: student.toApiResponse()
      });
    } catch (error) {
      console.error('Get student error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_STUDENT_FAILED',
          message: '取得學生資料失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 搜尋和篩選學生
   * GET /api/students
   */
  searchStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        nationality,
        program,
        status,
        enrollment_date_from,
        enrollment_date_to,
        search,
        page = '1',
        limit = '10',
        sortBy = 'name',
        sortOrder = 'ASC'
      } = req.query;

      // 建構篩選條件
      const filters: any = {};
      if (nationality) filters.nationality = nationality as string;
      if (program) filters.program = program as string;
      if (status) filters.status = status as StudentStatus;
      if (enrollment_date_from) filters.enrollment_date_from = new Date(enrollment_date_from as string);
      if (enrollment_date_to) filters.enrollment_date_to = new Date(enrollment_date_to as string);
      if (search) filters.search = search as string;

      // 分頁選項
      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      };

      const result = await this.studentService.searchStudents(filters, options);

      res.status(200).json({
        success: true,
        data: result.data.map(student => student.toApiResponse()),
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Search students error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SEARCH_STUDENTS_FAILED',
          message: '搜尋學生失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 更新學生狀態
   * PATCH /api/students/:id/status
   */
  updateStudentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(StudentStatus).includes(status)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: '無效的學生狀態',
            suggestions: [`有效狀態: ${Object.values(StudentStatus).join(', ')}`]
          }
        });
        return;
      }

      const student = await this.studentService.updateStudentStatus(id, status);

      res.status(200).json({
        success: true,
        data: student.toApiResponse(),
        message: '學生狀態更新成功'
      });
    } catch (error) {
      console.error('Update student status error:', error);
      
      if (error instanceof Error && error.message === '找不到學生') {
        res.status(404).json({
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: '找不到學生'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_STATUS_FAILED',
          message: '更新學生狀態失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 取得學生統計資訊
   * GET /api/students/statistics
   */
  getStatistics = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.studentService.getStudentStatistics();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_STATISTICS_FAILED',
          message: '取得統計資訊失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 批量匯入學生
   * POST /api/students/import
   */
  importStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const { students } = req.body;

      if (!Array.isArray(students) || students.length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: '請提供有效的學生資料陣列'
          }
        });
        return;
      }

      const result = await this.studentService.importStudents(students);

      res.status(200).json({
        success: true,
        data: result,
        message: `匯入完成：成功 ${result.success} 筆，失敗 ${result.failed} 筆`
      });
    } catch (error) {
      console.error('Import students error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'IMPORT_FAILED',
          message: '批量匯入失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 取得即將畢業的學生
   * GET /api/students/near-graduation
   */
  getNearGraduation = async (_req: Request, res: Response): Promise<void> => {
    try {
      const students = await this.studentService.getNearGraduationStudents();

      res.status(200).json({
        success: true,
        data: students.map(student => student.toApiResponse())
      });
    } catch (error) {
      console.error('Get near graduation students error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_NEAR_GRADUATION_FAILED',
          message: '取得即將畢業學生失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 取得學生完整檔案（包含文件完成度）
   * GET /api/students/:id/profile
   */
  getStudentProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const profile = await this.studentService.getStudentProfile(id);

      res.status(200).json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get student profile error:', error);
      
      if (error instanceof Error && error.message === '找不到學生') {
        res.status(404).json({
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: '找不到學生'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'GET_PROFILE_FAILED',
          message: '取得學生檔案失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 取得學生文件清單
   * GET /api/students/:id/documents
   */
  getStudentDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        page = '1',
        limit = '10',
        sortBy = 'uploaded_at',
        sortOrder = 'DESC'
      } = req.query;

      const options = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC'
      };

      const result = await this.studentService.getStudentDocuments(id, options);

      res.status(200).json({
        success: true,
        data: result.data.map(doc => doc.toApiResponse()),
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get student documents error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DOCUMENTS_FAILED',
          message: '取得學生文件清單失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 更新學生文件狀態
   * PUT /api/students/:id/documents/:docId/status
   */
  updateDocumentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, docId } = req.params;
      const { status, remarks } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_STATUS',
            message: '請提供文件狀態'
          }
        });
        return;
      }

      const document = await this.studentService.updateDocumentStatus(id, docId, status, remarks);

      if (!document) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DOCUMENT_NOT_FOUND',
            message: '找不到文件'
          }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: document.toApiResponse(),
        message: '文件狀態更新成功'
      });
    } catch (error) {
      console.error('Update document status error:', error);
      
      if (error instanceof Error) {
        if (error.message === '找不到文件') {
          res.status(404).json({
            success: false,
            error: {
              code: 'DOCUMENT_NOT_FOUND',
              message: '找不到文件'
            }
          });
          return;
        }
        
        if (error.message.includes('無效的狀態')) {
          res.status(400).json({
            success: false,
            error: {
              code: 'INVALID_STATUS',
              message: error.message
            }
          });
          return;
        }
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_STATUS_FAILED',
          message: '更新文件狀態失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 取得學生文件完成度
   * GET /api/students/:id/completion
   */
  getStudentCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const completion = await this.studentService.getStudentCompletion(id);

      res.status(200).json({
        success: true,
        data: completion
      });
    } catch (error) {
      console.error('Get student completion error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GET_COMPLETION_FAILED',
          message: '取得學生完成度失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };

  /**
   * 取得學生文件清單及詳細統計
   * GET /api/students/:id/documents/stats
   */
  getStudentDocumentsWithStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const data = await this.studentService.getStudentDocumentsWithStats(id);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Get student documents with stats error:', error);
      
      if (error instanceof Error && error.message === '找不到學生') {
        res.status(404).json({
          success: false,
          error: {
            code: 'STUDENT_NOT_FOUND',
            message: '找不到學生'
          }
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'GET_DOCUMENTS_STATS_FAILED',
          message: '取得學生文件統計失敗',
          details: error instanceof Error ? error.message : '未知錯誤'
        }
      });
    }
  };
}
