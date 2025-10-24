import { Pool } from 'pg';
import { StudentDocumentRepository, DocumentFilter } from '../student-document-repository';
import { StudentDocument, ContentType, DocumentStatus } from '../../models/student-document';

// Mock the pg Pool
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

describe('StudentDocumentRepository', () => {
  let mockPool: jest.Mocked<Pool>;
  let studentDocumentRepository: StudentDocumentRepository;

  beforeEach(() => {
    mockPool = new Pool() as jest.Mocked<Pool>;
    studentDocumentRepository = new StudentDocumentRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByStudent', () => {
    it('should return paginated documents by student', async () => {
      const mockRows = [
        {
          document_id: 'doc1',
          student_id: 'test_student',
          type_id: 'type1',
          uploader_id: 'user1',
          content_type: ContentType.FILE,
          file_name: 'test1.pdf',
          status: DocumentStatus.APPROVED,
          version: 1,
          is_current: true,
          uploaded_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await studentDocumentRepository.findByStudent('test_student', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(StudentDocument);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.findByStudent('test_student')).rejects.toThrow('根據學生ID查詢文件失敗');
    });
  });

  describe('findCurrentByStudentAndType', () => {
    it('should return current document for student and type', async () => {
      const mockRow = {
        document_id: 'current_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'user1',
        content_type: ContentType.FILE,
        status: DocumentStatus.APPROVED,
        version: 2,
        is_current: true,
        uploaded_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValue({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await studentDocumentRepository.findCurrentByStudentAndType('test_student', 'test_type');

      expect(result).toBeInstanceOf(StudentDocument);
      expect(result?.document_id).toBe('current_doc');
      expect(result?.is_current).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE student_id = $1 AND type_id = $2 AND is_current = true'),
        ['test_student', 'test_type']
      );
    });

    it('should return null when no current document found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await studentDocumentRepository.findCurrentByStudentAndType('test_student', 'test_type');

      expect(result).toBeNull();
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.findCurrentByStudentAndType('test_student', 'test_type'))
        .rejects.toThrow('查詢學生當前文件失敗');
    });
  });

  describe('findCurrentByStudent', () => {
    it('should return all current documents for student', async () => {
      const mockRows = [
        {
          document_id: 'doc1',
          student_id: 'test_student',
          type_id: 'type1',
          is_current: true,
          uploaded_at: new Date(),
          updated_at: new Date()
        },
        {
          document_id: 'doc2',
          student_id: 'test_student',
          type_id: 'type2',
          is_current: true,
          uploaded_at: new Date(),
          updated_at: new Date()
        }
      ];

      jest.spyOn(studentDocumentRepository as any, 'executeQuery').mockResolvedValue(mockRows);

      const result = await studentDocumentRepository.findCurrentByStudent('test_student');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(StudentDocument);
      expect(result[1]).toBeInstanceOf(StudentDocument);
    });

    it('should throw error when query fails', async () => {
      jest.spyOn(studentDocumentRepository as any, 'executeQuery').mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.findCurrentByStudent('test_student'))
        .rejects.toThrow('查詢學生所有當前文件失敗');
    });
  });

  describe('findByType', () => {
    it('should return paginated documents by type', async () => {
      const mockRows = [
        {
          document_id: 'doc1',
          type_id: 'test_type',
          student_id: 'student1',
          uploaded_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await studentDocumentRepository.findByType('test_type');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(StudentDocument);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.findByType('test_type')).rejects.toThrow('根據文件類型查詢文件失敗');
    });
  });

  describe('findByUploader', () => {
    it('should return paginated documents by uploader', async () => {
      const mockRows = [
        {
          document_id: 'doc1',
          uploader_id: 'test_uploader',
          student_id: 'student1',
          uploaded_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await studentDocumentRepository.findByUploader('test_uploader');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(StudentDocument);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.findByUploader('test_uploader')).rejects.toThrow('根據上傳者查詢文件失敗');
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered documents with multiple criteria', async () => {
      const filters: DocumentFilter = {
        student_id: 'test_student',
        status: DocumentStatus.APPROVED,
        content_type: ContentType.FILE,
        is_current: true
      };

      const mockRows = [
        {
          document_id: 'filtered_doc',
          student_id: 'test_student',
          status: DocumentStatus.APPROVED,
          content_type: ContentType.FILE,
          is_current: true,
          uploaded_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await studentDocumentRepository.findWithFilters(filters);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(StudentDocument);
      expect(result.data[0].student_id).toBe('test_student');
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.findWithFilters({})).rejects.toThrow('搜尋文件失敗');
    });
  });

  describe('getStudentCompletionStats', () => {
    it('should return student completion statistics', async () => {
      const mockRow = {
        total_required: '5',
        completed: '3',
        completion_rate: '60.00',
        missing_document_types: ['類型1', '類型2']
      };

      mockPool.query.mockResolvedValue({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await studentDocumentRepository.getStudentCompletionStats('test_student');

      expect(result.total_required).toBe(5);
      expect(result.completed).toBe(3);
      expect(result.completion_rate).toBe(60.00);
      expect(result.missing_document_types).toEqual(['類型1', '類型2']);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.getStudentCompletionStats('test_student'))
        .rejects.toThrow('取得學生文件完成度統計失敗');
    });
  });

  describe('getDocumentStats', () => {
    it('should return comprehensive document statistics', async () => {
      const mockResults = [
        // Total documents
        { rows: [{ total_documents: '100' }] },
        // Documents by status
        { rows: [{ status: 'approved', count: '60' }, { status: 'pending', count: '40' }] },
        // Documents by type
        { rows: [{ type_id: 'type1', type_name: '類型1', count: '50' }] },
        // Documents by content type
        { rows: [{ content_type: 'file', count: '80' }, { content_type: 'web_url', count: '20' }] },
        // Pending review count
        { rows: [{ pending_review_count: '25' }] }
      ];

      mockPool.query
        .mockResolvedValueOnce(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any)
        .mockResolvedValueOnce(mockResults[2] as any)
        .mockResolvedValueOnce(mockResults[3] as any)
        .mockResolvedValueOnce(mockResults[4] as any);

      const result = await studentDocumentRepository.getDocumentStats();

      expect(result.total_documents).toBe(100);
      expect(result.documents_by_status).toHaveLength(2);
      expect(result.documents_by_type).toHaveLength(1);
      expect(result.documents_by_content_type).toHaveLength(2);
      expect(result.pending_review_count).toBe(25);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentDocumentRepository.getDocumentStats()).rejects.toThrow('取得文件統計資訊失敗');
    });
  });
});