import { Pool } from 'pg';
import { TrackingService } from '../tracking.service';
import { ActionType } from '../../models/tracking-record';

// Mock the pool
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn()
} as unknown as Pool;

describe('TrackingService', () => {
  let trackingService: TrackingService;

  beforeEach(() => {
    trackingService = new TrackingService(mockPool);
    jest.clearAllMocks();
  });

  describe('createTrackingRecord', () => {
    it('should create a tracking record successfully', async () => {
      const trackingData = {
        user_id: 'U001',
        student_id: 'S001',
        document_id: 'D001',
        action_type: ActionType.DOCUMENT_UPLOAD,
        description: '上傳文件',
        ip_address: '127.0.0.1',
        user_agent: 'Mozilla/5.0'
      };

      const mockRecord = {
        record_id: 'R001',
        ...trackingData,
        created_at: new Date()
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockRecord]
      });

      const result = await trackingService.createTrackingRecord(trackingData);

      expect(result).toBeDefined();
      expect(result.user_id).toBe(trackingData.user_id);
      expect(result.action_type).toBe(trackingData.action_type);
    });

    it('should throw error if validation fails', async () => {
      const invalidData = {
        user_id: '',
        action_type: 'INVALID_ACTION' as ActionType
      };

      await expect(trackingService.createTrackingRecord(invalidData)).rejects.toThrow();
    });
  });

  describe('logDocumentUpload', () => {
    it('should log document upload action', async () => {
      const mockRecord = {
        record_id: 'R001',
        user_id: 'U001',
        student_id: 'S001',
        document_id: 'D001',
        action_type: ActionType.DOCUMENT_UPLOAD,
        description: '上傳文件',
        created_at: new Date()
      };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({
        rows: [mockRecord]
      });

      const result = await trackingService.logDocumentUpload(
        'U001',
        'S001',
        'D001',
        { file_name: 'test.pdf' },
        '127.0.0.1',
        'Mozilla/5.0'
      );

      expect(result).toBeDefined();
      expect(result.action_type).toBe(ActionType.DOCUMENT_UPLOAD);
    });
  });

  describe('getTrackingRecords', () => {
    it('should retrieve tracking records with filters', async () => {
      const mockRecords = [
        {
          record_id: 'R001',
          user_id: 'U001',
          action_type: ActionType.DOCUMENT_UPLOAD,
          created_at: new Date()
        }
      ];

      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: mockRecords });

      const result = await trackingService.getTrackingRecords(
        { user_id: 'U001' },
        { page: 1, limit: 10 }
      );

      expect(result.data).toBeDefined();
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('getUserActivityStats', () => {
    it('should return user activity statistics', async () => {
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ total_actions: '10' }] })
        .mockResolvedValueOnce({ rows: [{ action_type: ActionType.DOCUMENT_UPLOAD, count: '5' }] })
        .mockResolvedValueOnce({ rows: [{ date: '2024-01-01', count: '3' }] });

      const result = await trackingService.getUserActivityStats('U001', 30);

      expect(result.total_actions).toBe(10);
      expect(result.actions_by_type).toBeDefined();
      expect(result.daily_activity).toBeDefined();
    });
  });
});
