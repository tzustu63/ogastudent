import { Pool } from 'pg';
import { ReportService } from '../report.service';

// Mock the pool
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn()
} as unknown as Pool;

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService(mockPool);
    jest.clearAllMocks();
  });

  describe('generateAuditReport', () => {
    it('should generate audit report with statistics', async () => {
      const mockActivityByType = [
        { action_type: 'document_upload', count: '10' }
      ];
      const mockActivityByUser = [
        { user_id: 'U001', user_name: 'Test User', count: '5' }
      ];
      const mockActivityByDate = [
        { date: new Date('2024-01-01'), count: '3' }
      ];
      const mockTopStudents = [
        { student_id: 'S001', student_name: 'Test Student', activity_count: '8' }
      ];
      const mockTotalCount = { count: '10' };

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: mockActivityByType })
        .mockResolvedValueOnce({ rows: mockActivityByUser })
        .mockResolvedValueOnce({ rows: mockActivityByDate })
        .mockResolvedValueOnce({ rows: mockTopStudents })
        .mockResolvedValueOnce({ rows: [mockTotalCount] });

      const filters = {
        date_from: new Date('2024-01-01'),
        date_to: new Date('2024-01-31')
      };

      const result = await reportService.generateAuditReport(filters);

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.total_records).toBe(10);
      expect(result.activity_by_type).toBeDefined();
      expect(result.activity_by_user).toBeDefined();
      expect(result.activity_by_date).toBeDefined();
      expect(result.top_active_students).toBeDefined();
    });
  });

  describe('generateCompletionReport', () => {
    it('should generate completion statistics report', async () => {
      const mockStudents = [
        { student_id: 'S001', name: 'Student 1' },
        { student_id: 'S002', name: 'Student 2' }
      ];

      const mockDocumentTypes = [
        { type_id: 'T001', type_name: 'Type 1', is_required: true }
      ];

      const mockDocuments = [
        { type_id: 'T001', student_id: 'S001' }
      ];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '2' }] })
        .mockResolvedValueOnce({ rows: mockStudents })
        .mockResolvedValueOnce({ rows: mockDocumentTypes })
        .mockResolvedValueOnce({ rows: [{ count: '2' }] })
        .mockResolvedValueOnce({ rows: mockDocuments })
        .mockResolvedValueOnce({ rows: [{ count: '2' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await reportService.generateCompletionReport();

      expect(result).toBeDefined();
      expect(result.total_students).toBe(2);
      expect(result.document_type_stats).toBeDefined();
    });
  });

  describe('exportAuditReportToCSV', () => {
    it('should export audit report as CSV', async () => {
      const mockRecords = [
        {
          record_id: 'R001',
          student_id: 'S001',
          document_id: 'D001',
          user_id: 'U001',
          action_type: 'document_upload',
          description: '上傳文件',
          ip_address: '127.0.0.1',
          created_at: new Date('2024-01-01')
        }
      ];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: mockRecords });

      const filters = {
        date_from: new Date('2024-01-01'),
        date_to: new Date('2024-01-31')
      };

      const result = await reportService.exportAuditReportToCSV(filters);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('記錄ID');
      expect(result).toContain('R001');
    });
  });

  describe('exportCompletionReportToCSV', () => {
    it('should export completion report as CSV', async () => {
      const mockStudents = [
        { student_id: 'S001', name: 'Student 1' }
      ];

      const mockDocumentTypes = [
        { type_id: 'T001', type_name: 'Type 1', is_required: true }
      ];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: mockStudents })
        .mockResolvedValueOnce({ rows: mockDocumentTypes })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const result = await reportService.exportCompletionReportToCSV();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result).toContain('文件類型ID');
      expect(result).toContain('摘要統計');
    });
  });
});
