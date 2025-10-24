import { Router } from 'express';
import { Pool } from 'pg';
import { StudentController } from '../controllers/student.controller';
import { authenticate } from '../middleware/auth.middleware';

export function createStudentRoutes(pool: Pool): Router {
  const router = Router();
  const studentController = new StudentController(pool);

  // 所有路由都需要身份驗證
  router.use(authenticate);

  /**
   * @route   GET /api/students/statistics
   * @desc    取得學生統計資訊
   * @access  Private (Admin, Auditor)
   */
  router.get('/statistics', studentController.getStatistics);

  /**
   * @route   GET /api/students/near-graduation
   * @desc    取得即將畢業的學生
   * @access  Private (Admin, Auditor)
   */
  router.get('/near-graduation', studentController.getNearGraduation);

  /**
   * @route   POST /api/students/import
   * @desc    批量匯入學生資料
   * @access  Private (Admin, Auditor)
   */
  router.post('/import', studentController.importStudents);

  /**
   * @route   GET /api/students/:id/profile
   * @desc    取得學生完整檔案（包含文件完成度）
   * @access  Private
   */
  router.get('/:id/profile', studentController.getStudentProfile);

  /**
   * @route   GET /api/students/:id/documents
   * @desc    取得學生文件清單
   * @access  Private
   */
  router.get('/:id/documents', studentController.getStudentDocuments);

  /**
   * @route   PUT /api/students/:id/documents/:docId/status
   * @desc    更新學生文件狀態
   * @access  Private (Admin, Global Affairs, Unit Staff)
   */
  router.put('/:id/documents/:docId/status', studentController.updateDocumentStatus);

  /**
   * @route   GET /api/students/:id/completion
   * @desc    取得學生文件完成度
   * @access  Private
   */
  router.get('/:id/completion', studentController.getStudentCompletion);

  /**
   * @route   GET /api/students/:id/documents/stats
   * @desc    取得學生文件清單及詳細統計
   * @access  Private
   */
  router.get('/:id/documents/stats', studentController.getStudentDocumentsWithStats);

  /**
   * @route   GET /api/students
   * @desc    搜尋和篩選學生
   * @access  Private
   */
  router.get('/', studentController.searchStudents);

  /**
   * @route   POST /api/students
   * @desc    建立新學生
   * @access  Private (Admin, Auditor)
   */
  router.post('/', studentController.createStudent);

  /**
   * @route   GET /api/students/:id
   * @desc    取得單一學生資料
   * @access  Private
   */
  router.get('/:id', studentController.getStudent);

  /**
   * @route   PUT /api/students/:id
   * @desc    更新學生資料
   * @access  Private (Admin, Auditor)
   */
  router.put('/:id', studentController.updateStudent);

  /**
   * @route   PATCH /api/students/:id/status
   * @desc    更新學生狀態
   * @access  Private (Admin, Auditor)
   */
  router.patch('/:id/status', studentController.updateStudentStatus);

  /**
   * @route   DELETE /api/students/:id
   * @desc    刪除學生
   * @access  Private (Admin only)
   */
  router.delete('/:id', studentController.deleteStudent);

  return router;
}
