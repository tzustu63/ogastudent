import { Pool } from 'pg';
import { DocumentTypeRepository } from '../document-type-repository';
import { DocumentType } from '../../models/document-type';

// Mock the pg Pool
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

describe('DocumentTypeRepository', () => {
  let mockPool: jest.Mocked<Pool>;
  let documentTypeRepository: DocumentTypeRepository;

  beforeEach(() => {
    mockPool = new Pool() as jest.Mocked<Pool>;
    documentTypeRepository = new DocumentTypeRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUnit', () => {
    it('should return paginated document types by unit', async () => {
      const mockRows = [
        {
          type_id: 'type1',
          type_name: '文件類型1',
          responsible_unit_id: 'test_unit',
          is_required: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          type_id: 'type2',
          type_name: '文件類型2',
          responsible_unit_id: 'test_unit',
          is_required: false,
          display_order: 2,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '2' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 2,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await documentTypeRepository.findByUnit('test_unit', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(DocumentType);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.currentPage).toBe(1);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(documentTypeRepository.findByUnit('test_unit')).rejects.toThrow('根據單位查詢文件類型失敗');
    });
  });

  describe('findRequired', () => {
    it('should return all required document types', async () => {
      const mockRows = [
        {
          type_id: 'required_type1',
          type_name: '必填文件1',
          is_required: true,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Mock executeQuery method
      jest.spyOn(documentTypeRepository as any, 'executeQuery').mockResolvedValue(mockRows);

      const result = await documentTypeRepository.findRequired();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(DocumentType);
      expect(result[0].is_required).toBe(true);
    });

    it('should throw error when query fails', async () => {
      jest.spyOn(documentTypeRepository as any, 'executeQuery').mockRejectedValue(new Error('Database error'));

      await expect(documentTypeRepository.findRequired()).rejects.toThrow('查詢必填文件類型失敗');
    });
  });

  describe('findByName', () => {
    it('should find document types by name', async () => {
      const mockRows = [
        {
          type_id: 'type1',
          type_name: '測試文件類型',
          type_name_en: 'Test Document Type',
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      jest.spyOn(documentTypeRepository as any, 'executeQuery').mockResolvedValue(mockRows);

      const result = await documentTypeRepository.findByName('測試');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(DocumentType);
      expect(result[0].type_name).toBe('測試文件類型');
    });

    it('should throw error when query fails', async () => {
      jest.spyOn(documentTypeRepository as any, 'executeQuery').mockRejectedValue(new Error('Database error'));

      await expect(documentTypeRepository.findByName('測試')).rejects.toThrow('根據名稱搜尋文件類型失敗');
    });
  });

  describe('isNameExists', () => {
    it('should return true when name exists', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ exists: true }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await documentTypeRepository.isNameExists('測試文件類型');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE type_name = $1'),
        ['測試文件類型']
      );
    });

    it('should return false when name does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await documentTypeRepository.isNameExists('不存在的類型');

      expect(result).toBe(false);
    });

    it('should exclude specific type when checking name existence', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      await documentTypeRepository.isNameExists('測試文件類型', 'exclude_type');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE type_name = $1 AND type_id != $2'),
        ['測試文件類型', 'exclude_type']
      );
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(documentTypeRepository.isNameExists('測試文件類型')).rejects.toThrow('檢查文件類型名稱存在性失敗');
    });
  });

  describe('updateDisplayOrder', () => {
    it('should update display order successfully', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await documentTypeRepository.updateDisplayOrder('test_type', 5);

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET display_order = $1'),
        [5, 'test_type']
      );
    });

    it('should return false when document type not found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await documentTypeRepository.updateDisplayOrder('nonexistent_type', 5);

      expect(result).toBe(false);
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(documentTypeRepository.updateDisplayOrder('test_type', 5)).rejects.toThrow('更新顯示順序失敗');
    });
  });

  describe('getNextDisplayOrder', () => {
    it('should return next display order number', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ next_order: 6 }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await documentTypeRepository.getNextDisplayOrder();

      expect(result).toBe(6);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('MAX(display_order)')
      );
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(documentTypeRepository.getNextDisplayOrder()).rejects.toThrow('取得下一個顯示順序失敗');
    });
  });

  describe('getDocumentTypeStats', () => {
    it('should return comprehensive document type statistics', async () => {
      const mockRows = [
        {
          type_id: 'type1',
          type_name: '文件類型1',
          responsible_unit_name: '單位1',
          total_documents: 10,
          pending_documents: 2,
          approved_documents: 8
        },
        {
          type_id: 'type2',
          type_name: '文件類型2',
          responsible_unit_name: '單位2',
          total_documents: 5,
          pending_documents: 1,
          approved_documents: 4
        }
      ];

      jest.spyOn(documentTypeRepository as any, 'executeQuery').mockResolvedValue(mockRows);

      const result = await documentTypeRepository.getDocumentTypeStats();

      expect(result).toHaveLength(2);
      expect(result[0].type_name).toBe('文件類型1');
      expect(result[0].total_documents).toBe(10);
      expect(result[1].approved_documents).toBe(4);
    });

    it('should throw error when query fails', async () => {
      jest.spyOn(documentTypeRepository as any, 'executeQuery').mockRejectedValue(new Error('Database error'));

      await expect(documentTypeRepository.getDocumentTypeStats()).rejects.toThrow('取得文件類型統計資訊失敗');
    });
  });
});