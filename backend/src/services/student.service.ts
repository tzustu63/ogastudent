import { Pool } from 'pg';
import { StudentRepository, StudentFilter } from '../repositories/student-repository';
import { StudentDocumentRepository } from '../repositories/student-document-repository';
import { DocumentTypeRepository } from '../repositories/document-type-repository';
import { Student, StudentStatus } from '../models/student';
import { PaginationOptions } from '../repositories/base-repository';
import { v4 as uuidv4 } from 'uuid';

export class StudentService {
  private studentRepository: StudentRepository;
  private documentRepository: StudentDocumentRepository;
  private documentTypeRepository: DocumentTypeRepository;

  constructor(pool: Pool) {
    this.studentRepository = new StudentRepository(pool);
    this.documentRepository = new StudentDocumentRepository(pool);
    this.documentTypeRepository = new DocumentTypeRepository(pool);
  }

  /**
   * 建立新學生
   */
  async createStudent(studentData: Partial<Student>): Promise<Student> {
    // 驗證必填欄位
    if (!studentData.student_id || !studentData.name) {
      throw new Error('學生ID和姓名為必填欄位');
    }

    // 檢查學生ID是否已存在
    const existingStudent = await this.studentRepository.findById(studentData.student_id);
    if (existingStudent) {
      throw new Error('學生ID已存在');
    }

    // 檢查電子郵件是否已存在
    if (studentData.email) {
      const emailExists = await this.studentRepository.isEmailExists(studentData.email);
      if (emailExists) {
        throw new Error('電子郵件已被使用');
      }
    }

    // 檢查護照號碼是否已存在
    if (studentData.passport_number) {
      const passportExists = await this.studentRepository.isPassportNumberExists(studentData.passport_number);
      if (passportExists) {
        throw new Error('護照號碼已被使用');
      }
    }

    // 建立學生實體
    const student = new Student(studentData);

    // 驗證學生資料
    const validation = student.validateStudent();
    if (!validation.isValid) {
      throw new Error(`學生資料驗證失敗: ${validation.errors.join(', ')}`);
    }

    // 儲存到資料庫
    return await this.studentRepository.create(student);
  }

  /**
   * 更新學生資料
   */
  async updateStudent(studentId: string, updateData: Partial<Student>): Promise<Student> {
    // 檢查學生是否存在
    const existingStudent = await this.studentRepository.findById(studentId);
    if (!existingStudent) {
      throw new Error('找不到學生');
    }

    // 檢查電子郵件是否已被其他學生使用
    if (updateData.email) {
      const emailExists = await this.studentRepository.isEmailExists(updateData.email, studentId);
      if (emailExists) {
        throw new Error('電子郵件已被其他學生使用');
      }
    }

    // 檢查護照號碼是否已被其他學生使用
    if (updateData.passport_number) {
      const passportExists = await this.studentRepository.isPassportNumberExists(updateData.passport_number, studentId);
      if (passportExists) {
        throw new Error('護照號碼已被其他學生使用');
      }
    }

    // 更新學生資料
    Object.assign(existingStudent, updateData);

    // 驗證更新後的資料
    const validation = existingStudent.validateStudent();
    if (!validation.isValid) {
      throw new Error(`學生資料驗證失敗: ${validation.errors.join(', ')}`);
    }

    // 儲存到資料庫
    const updated = await this.studentRepository.update(studentId, existingStudent.toDatabaseUpdate());
    if (!updated) {
      throw new Error('更新學生資料失敗');
    }
    return updated;
  }

  /**
   * 刪除學生
   */
  async deleteStudent(studentId: string): Promise<boolean> {
    // 檢查學生是否存在
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('找不到學生');
    }

    // 檢查學生是否有相關文件
    const documents = await this.documentRepository.findCurrentByStudent(studentId);
    if (documents.length > 0) {
      throw new Error('無法刪除有相關文件的學生，請先刪除所有文件');
    }

    return await this.studentRepository.delete(studentId);
  }

  /**
   * 根據ID取得學生
   */
  async getStudentById(studentId: string): Promise<Student | null> {
    return await this.studentRepository.findById(studentId);
  }

  /**
   * 搜尋和篩選學生
   */
  async searchStudents(filters: StudentFilter, options?: PaginationOptions) {
    return await this.studentRepository.findWithFilters(filters, options);
  }

  /**
   * 取得所有學生（分頁）
   */
  async getAllStudents(options?: PaginationOptions) {
    return await this.studentRepository.findAll(options);
  }

  /**
   * 根據國籍取得學生
   */
  async getStudentsByNationality(nationality: string, options?: PaginationOptions) {
    return await this.studentRepository.findByNationality(nationality, options);
  }

  /**
   * 根據科系取得學生
   */
  async getStudentsByProgram(program: string, options?: PaginationOptions) {
    return await this.studentRepository.findByProgram(program, options);
  }

  /**
   * 根據狀態取得學生
   */
  async getStudentsByStatus(status: StudentStatus, options?: PaginationOptions) {
    return await this.studentRepository.findByStatus(status, options);
  }

  /**
   * 取得即將畢業的學生
   */
  async getNearGraduationStudents(): Promise<Student[]> {
    return await this.studentRepository.findNearGraduation();
  }

  /**
   * 更新學生狀態
   */
  async updateStudentStatus(studentId: string, status: StudentStatus): Promise<Student> {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('找不到學生');
    }

    student.updateStatus(status);
    const updated = await this.studentRepository.update(studentId, student.toDatabaseUpdate());
    if (!updated) {
      throw new Error('更新學生狀態失敗');
    }
    return updated;
  }

  /**
   * 取得學生統計資訊
   */
  async getStudentStatistics() {
    return await this.studentRepository.getStudentStats();
  }

  /**
   * 批量匯入學生
   */
  async importStudents(studentsData: Partial<Student>[]): Promise<{
    success: number;
    failed: number;
    errors: Array<{ index: number; student_id: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ index: number; student_id: string; error: string }>
    };

    for (let i = 0; i < studentsData.length; i++) {
      const studentData = studentsData[i];
      
      try {
        // 檢查必填欄位
        if (!studentData.student_id || !studentData.name) {
          throw new Error('學生ID和姓名為必填欄位');
        }

        // 檢查學生是否已存在
        const existingStudent = await this.studentRepository.findById(studentData.student_id);
        
        if (existingStudent) {
          // 更新現有學生
          await this.updateStudent(studentData.student_id, studentData);
        } else {
          // 建立新學生
          await this.createStudent(studentData);
        }
        
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          index: i,
          student_id: studentData.student_id || 'unknown',
          error: error instanceof Error ? error.message : '未知錯誤'
        });
      }
    }

    return results;
  }

  /**
   * 取得學生完整檔案（包含文件完成度）
   */
  async getStudentProfile(studentId: string) {
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('找不到學生');
    }

    // 取得學生文件完成度
    const completion = await this.documentRepository.getStudentCompletionStats(studentId);

    // 取得學生所有當前文件（包含詳細資訊）
    const documents = await this.documentRepository.findCurrentByStudent(studentId);

    // 組織文件資料，包含類型資訊
    const documentsWithDetails = await this.getDocumentsWithTypeInfo(documents);

    return {
      student: student.toApiResponse(),
      completion: {
        total_required: completion.total_required,
        completed: completion.completed,
        completion_rate: completion.completion_rate,
        missing_document_types: completion.missing_document_types
      },
      documents: documentsWithDetails,
      summary: {
        total_documents: documents.length,
        approved_documents: documents.filter(d => d.status === 'approved').length,
        pending_documents: documents.filter(d => d.status === 'pending').length,
        rejected_documents: documents.filter(d => d.status === 'rejected').length,
        under_review_documents: documents.filter(d => d.status === 'under_review').length
      }
    };
  }

  /**
   * 取得文件及其類型資訊
   */
  private async getDocumentsWithTypeInfo(documents: any[]) {
    if (documents.length === 0) return [];

    // 取得所有文件類型資訊
    const typeIds = [...new Set(documents.map(doc => doc.type_id))];
    const documentTypes = await this.documentTypeRepository.findByIds(typeIds);
    
    // 建立類型映射
    const typeMap = new Map();
    documentTypes.forEach(type => {
      typeMap.set(type.type_id, type);
    });

    return documents.map(doc => {
      // 檢查是否已經是處理過的對象（包含 uploader）
      const docResponse = doc.toApiResponse ? doc.toApiResponse() : doc;
      const typeInfo = typeMap.get(doc.type_id);
      
      return {
        ...docResponse,
        typeName: typeInfo?.type_name || doc.type_id,
        uploader: doc.uploader || {
          user_id: doc.uploader_id,
          name: '未知',
          unitName: '未知單位'
        },
        type_info: {
          type_id: doc.type_id,
          type_name: typeInfo?.type_name || doc.type_id,
          responsible_unit: typeInfo?.responsible_unit || '',
          is_required: typeInfo?.is_required || false
        }
      };
    });
  }

  /**
   * 取得學生文件清單（分頁）
   */
  async getStudentDocuments(studentId: string, options?: PaginationOptions) {
    return await this.documentRepository.findByStudent(studentId, options);
  }

  /**
   * 更新學生文件狀態
   */
  async updateDocumentStatus(studentId: string, documentId: string, status: string, remarks?: string) {
    // 取得文件
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('找不到文件');
    }

    // 驗證文件是否屬於該學生
    if (document.student_id !== studentId) {
      throw new Error('文件不屬於該學生');
    }

    // 驗證狀態值
    const validStatuses = ['pending', 'approved', 'rejected', 'under_review'];
    if (!validStatuses.includes(status)) {
      throw new Error('無效的狀態值');
    }

    // 更新狀態
    document.updateStatus(status as any, remarks);

    // 儲存到資料庫
    return await this.documentRepository.update(documentId, document.toDatabaseUpdate());
  }

  /**
   * 取得學生文件完成度
   */
  async getStudentCompletion(studentId: string) {
    return await this.documentRepository.getStudentCompletionStats(studentId);
  }

  /**
   * 取得學生文件清單及詳細資訊（包含統計）
   */
  async getStudentDocumentsWithStats(studentId: string) {
    // 檢查學生是否存在
    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('找不到學生');
    }

    // 取得所有當前文件
    const documents = await this.documentRepository.findCurrentByStudent(studentId);

    // 取得完成度統計
    const completion = await this.documentRepository.getStudentCompletionStats(studentId);

    // 按狀態分組
    const documentsByStatus = {
      approved: documents.filter(d => d.status === 'approved'),
      pending: documents.filter(d => d.status === 'pending'),
      rejected: documents.filter(d => d.status === 'rejected'),
      under_review: documents.filter(d => d.status === 'under_review')
    };

    return {
      student_id: studentId,
      student_name: student.name,
      completion,
      statistics: {
        total: documents.length,
        approved: documentsByStatus.approved.length,
        pending: documentsByStatus.pending.length,
        rejected: documentsByStatus.rejected.length,
        under_review: documentsByStatus.under_review.length
      },
      documents: documents.map(doc => doc.toApiResponse()),
      documents_by_status: {
        approved: documentsByStatus.approved.map(d => d.toApiResponse()),
        pending: documentsByStatus.pending.map(d => d.toApiResponse()),
        rejected: documentsByStatus.rejected.map(d => d.toApiResponse()),
        under_review: documentsByStatus.under_review.map(d => d.toApiResponse())
      }
    };
  }
}
