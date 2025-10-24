import { Pool } from 'pg';
import { UnitRepository } from '../unit-repository';
import { Unit } from '../../models/unit';

// Mock the pg Pool
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

describe('UnitRepository', () => {
  let mockPool: jest.Mocked<Pool>;
  let unitRepository: UnitRepository;

  beforeEach(() => {
    mockPool = new Pool() as jest.Mocked<Pool>;
    unitRepository = new UnitRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return unit when found', async () => {
      const mockRow = {
        unit_id: 'test_unit',
        unit_name: '測試單位',
        unit_name_en: 'Test Unit',
        description: '測試描述',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValue({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await unitRepository.findById('test_unit');

      expect(result).toBeInstanceOf(Unit);
      expect(result?.unit_id).toBe('test_unit');
      expect(result?.unit_name).toBe('測試單位');
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM units WHERE unit_id = $1',
        ['test_unit']
      );
    });

    it('should return null when unit not found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await unitRepository.findById('nonexistent_unit');

      expect(result).toBeNull();
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(unitRepository.findById('test_unit')).rejects.toThrow('查詢 units 失敗');
    });
  });

  describe('create', () => {
    it('should create a new unit', async () => {
      const unitData = {
        unit_id: 'new_unit',
        unit_name: '新單位',
        unit_name_en: 'New Unit',
        description: '新描述',
        is_active: true
      };

      const mockRow = {
        ...unitData,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValue({
        rows: [mockRow],
        rowCount: 1,
        command: 'INSERT',
        oid: 0,
        fields: []
      });

      const unit = new Unit(unitData);
      const result = await unitRepository.create(unit);

      expect(result).toBeInstanceOf(Unit);
      expect(result.unit_id).toBe('new_unit');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO units'),
        expect.arrayContaining(['new_unit', '新單位'])
      );
    });
  });

  describe('findByName', () => {
    it('should find units by name', async () => {
      const mockRows = [
        {
          unit_id: 'unit1',
          unit_name: '測試單位1',
          unit_name_en: 'Test Unit 1',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          unit_id: 'unit2',
          unit_name: '測試單位2',
          unit_name_en: 'Test Unit 2',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query.mockResolvedValue({
        rows: mockRows,
        rowCount: 2,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await unitRepository.findByName('測試');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Unit);
      expect(result[0].unit_name).toBe('測試單位1');
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE unit_name ILIKE $1 OR unit_name_en ILIKE $1'),
        ['%測試%']
      );
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

      const result = await unitRepository.isNameExists('測試單位');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE unit_name = $1'),
        ['測試單位']
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

      const result = await unitRepository.isNameExists('不存在的單位');

      expect(result).toBe(false);
    });

    it('should exclude specific unit when checking name existence', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      await unitRepository.isNameExists('測試單位', 'exclude_unit');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE unit_name = $1 AND unit_id != $2'),
        ['測試單位', 'exclude_unit']
      );
    });
  });

  describe('enable/disable', () => {
    it('should enable unit', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await unitRepository.enable('test_unit');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET is_active = true'),
        ['test_unit']
      );
    });

    it('should disable unit', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await unitRepository.disable('test_unit');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET is_active = false'),
        ['test_unit']
      );
    });
  });
});