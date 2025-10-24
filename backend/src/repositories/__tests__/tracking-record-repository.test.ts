import { Pool } from 'pg';
import { TrackingRecordRepository, TrackingFilter } from '../tracking-record-repository';
import { TrackingRecord, ActionType } from '../../models/tracking-record';

// Mock the pg Pool
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

describe('TrackingRecordRepository', () => {
  let mockPool: jest.Mocked<Pool>;
  let trackingRecordRepository: TrackingRecordRepository;

  beforeEach(() => {
    mockPool = new Pool() as jest.Mocked<Pool>;
    trackingRecordRepository = new TrackingRecordRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should throw error when trying to update tracking record', async () => {
      const record = new TrackingRecord({
        record_id: 'test_record',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD
      });

      await expect(trackingRecordRepository.update('test_record', record))
        .rejects.toThrow('追蹤記錄不允許更新');
    });
  });

  describe('findByStudent', () => {
    it('should return paginated tracking records by student', async () => {
      const mockRows = [
        {
          record_id: 'record1',
          student_id: 'test_student',
          user_id: 'user1',
          action_type: ActionType.DOCUMENT_UPLOAD,
          description: '上傳文件',
          created_at: new Date()
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

      const result = await trackingRecordRepository.findByStudent('test_student', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(TrackingRecord);
      expect(result.pagination.totalItems).toBe(1);
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.findByStudent('test_student'))
        .rejects.toThrow('根據學生ID查詢追蹤記錄失敗');
    });
  });

  describe('findByDocument', () => {
    it('should return paginated tracking records by document', async () => {
      const mockRows = [
        {
          record_id: 'record1',
          document_id: 'test_document',
          user_id: 'user1',
          action_type: ActionType.DOCUMENT_APPROVE,
          description: '核准文件',
          created_at: new Date()
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

      const result = await trackingRecordRepository.findByDocument('test_document');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(TrackingRecord);
      expect(result.data[0].document_id).toBe('test_document');
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.findByDocument('test_document'))
        .rejects.toThrow('根據文件ID查詢追蹤記錄失敗');
    });
  });

  describe('findByUser', () => {
    it('should return paginated tracking records by user', async () => {
      const mockRows = [
        {
          record_id: 'record1',
          user_id: 'test_user',
          action_type: ActionType.USER_LOGIN,
          description: '使用者登入',
          created_at: new Date()
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

      const result = await trackingRecordRepository.findByUser('test_user');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(TrackingRecord);
      expect(result.data[0].user_id).toBe('test_user');
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.findByUser('test_user'))
        .rejects.toThrow('根據使用者ID查詢追蹤記錄失敗');
    });
  });

  describe('findByActionType', () => {
    it('should return paginated tracking records by action type', async () => {
      const mockRows = [
        {
          record_id: 'record1',
          user_id: 'user1',
          action_type: ActionType.DOCUMENT_UPLOAD,
          description: '上傳文件',
          created_at: new Date()
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

      const result = await trackingRecordRepository.findByActionType(ActionType.DOCUMENT_UPLOAD);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(TrackingRecord);
      expect(result.data[0].action_type).toBe(ActionType.DOCUMENT_UPLOAD);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.findByActionType(ActionType.DOCUMENT_UPLOAD))
        .rejects.toThrow('根據操作類型查詢追蹤記錄失敗');
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered tracking records with multiple criteria', async () => {
      const filters: TrackingFilter = {
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD,
        date_from: new Date('2023-01-01'),
        date_to: new Date('2023-12-31')
      };

      const mockRows = [
        {
          record_id: 'filtered_record',
          user_id: 'test_user',
          action_type: ActionType.DOCUMENT_UPLOAD,
          description: '上傳文件',
          created_at: new Date('2023-06-01')
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

      const result = await trackingRecordRepository.findWithFilters(filters);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(TrackingRecord);
      expect(result.data[0].user_id).toBe('test_user');
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.findWithFilters({})).rejects.toThrow('搜尋追蹤記錄失敗');
    });
  });

  describe('getRecentActivities', () => {
    it('should return recent activities', async () => {
      const mockRows = [
        {
          record_id: 'recent1',
          user_id: 'user1',
          action_type: ActionType.DOCUMENT_UPLOAD,
          description: '最近上傳',
          created_at: new Date()
        },
        {
          record_id: 'recent2',
          user_id: 'user2',
          action_type: ActionType.USER_LOGIN,
          description: '最近登入',
          created_at: new Date()
        }
      ];

      jest.spyOn(trackingRecordRepository as any, 'executeQuery').mockResolvedValue(mockRows);

      const result = await trackingRecordRepository.getRecentActivities(50);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(TrackingRecord);
      expect(result[1]).toBeInstanceOf(TrackingRecord);
    });

    it('should throw error when query fails', async () => {
      jest.spyOn(trackingRecordRepository as any, 'executeQuery').mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.getRecentActivities()).rejects.toThrow('取得最近活動記錄失敗');
    });
  });

  describe('getUserActivityStats', () => {
    it('should return user activity statistics', async () => {
      const mockResults = [
        // Total actions
        { rows: [{ total_actions: '25' }] },
        // Actions by type
        { rows: [{ action_type: 'document_upload', count: '15' }, { action_type: 'user_login', count: '10' }] },
        // Daily activity
        { rows: [{ date: '2023-10-01', count: '5' }, { date: '2023-10-02', count: '3' }] }
      ];

      mockPool.query
        .mockResolvedValueOnce(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any)
        .mockResolvedValueOnce(mockResults[2] as any);

      const result = await trackingRecordRepository.getUserActivityStats('test_user', 30);

      expect(result.total_actions).toBe(25);
      expect(result.actions_by_type).toHaveLength(2);
      expect(result.daily_activity).toHaveLength(2);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.getUserActivityStats('test_user'))
        .rejects.toThrow('取得使用者活動統計失敗');
    });
  });

  describe('getSystemActivityStats', () => {
    it('should return system activity statistics', async () => {
      const mockResults = [
        // Total actions
        { rows: [{ total_actions: '1000' }] },
        // Actions by type
        { rows: [{ action_type: 'document_upload', count: '600' }, { action_type: 'user_login', count: '400' }] },
        // Actions by user
        { rows: [{ user_id: 'user1', count: '100' }, { user_id: 'user2', count: '80' }] },
        // Daily activity
        { rows: [{ date: '2023-10-01', count: '50' }, { date: '2023-10-02', count: '45' }] }
      ];

      mockPool.query
        .mockResolvedValueOnce(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any)
        .mockResolvedValueOnce(mockResults[2] as any)
        .mockResolvedValueOnce(mockResults[3] as any);

      const result = await trackingRecordRepository.getSystemActivityStats(30);

      expect(result.total_actions).toBe(1000);
      expect(result.actions_by_type).toHaveLength(2);
      expect(result.actions_by_user).toHaveLength(2);
      expect(result.daily_activity).toHaveLength(2);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.getSystemActivityStats())
        .rejects.toThrow('取得系統活動統計失敗');
    });
  });

  describe('cleanupOldRecords', () => {
    it('should cleanup old records and return count', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 150,
        command: 'DELETE',
        oid: 0,
        fields: []
      });

      const result = await trackingRecordRepository.cleanupOldRecords(365);

      expect(result).toBe(150);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM tracking_records')
      );
    });

    it('should return 0 when no records deleted', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: null,
        command: 'DELETE',
        oid: 0,
        fields: []
      });

      const result = await trackingRecordRepository.cleanupOldRecords(365);

      expect(result).toBe(0);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(trackingRecordRepository.cleanupOldRecords(365)).rejects.toThrow('清理舊追蹤記錄失敗');
    });
  });
});