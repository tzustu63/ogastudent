import { Unit } from '../unit';

describe('Unit Model', () => {
  describe('constructor', () => {
    it('should create a unit with default values', () => {
      const unit = new Unit();
      
      expect(unit.is_active).toBe(true);
    });

    it('should create a unit with provided data', () => {
      const unitData = {
        unit_id: 'test_unit',
        unit_name: '測試單位',
        unit_name_en: 'Test Unit',
        description: '這是一個測試單位',
        is_active: false
      };

      const unit = new Unit(unitData);
      
      expect(unit.unit_id).toBe('test_unit');
      expect(unit.unit_name).toBe('測試單位');
      expect(unit.unit_name_en).toBe('Test Unit');
      expect(unit.description).toBe('這是一個測試單位');
      expect(unit.is_active).toBe(false);
    });
  });

  describe('validateUnit', () => {
    it('should validate a valid unit', () => {
      const unit = new Unit({
        unit_id: 'valid_unit',
        unit_name: '有效單位'
      });

      const result = unit.validateUnit();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unit with invalid unit_id format', () => {
      const unit = new Unit({
        unit_id: 'invalid-unit!',
        unit_name: '無效單位'
      });

      const result = unit.validateUnit();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('單位ID只能包含英文字母、數字和底線');
    });

    it('should reject unit with empty unit_name', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '   '
      });

      const result = unit.validateUnit();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('單位名稱不能只包含空白字元');
    });

    it('should reject unit without required fields', () => {
      const unit = new Unit({});

      const result = unit.validateUnit();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getDisplayName', () => {
    it('should return Chinese name by default', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位',
        unit_name_en: 'Test Unit'
      });

      expect(unit.getDisplayName()).toBe('測試單位');
    });

    it('should return English name when requested', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位',
        unit_name_en: 'Test Unit'
      });

      expect(unit.getDisplayName('en')).toBe('Test Unit');
    });

    it('should return Chinese name when English name is not available', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位'
      });

      expect(unit.getDisplayName('en')).toBe('測試單位');
    });
  });

  describe('enable/disable methods', () => {
    it('should enable unit', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位',
        is_active: false
      });

      unit.enable();
      
      expect(unit.is_active).toBe(true);
    });

    it('should disable unit', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位',
        is_active: true
      });

      unit.disable();
      
      expect(unit.is_active).toBe(false);
    });

    it('should check if unit is enabled', () => {
      const enabledUnit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位',
        is_active: true
      });

      const disabledUnit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位',
        is_active: false
      });

      expect(enabledUnit.isEnabled()).toBe(true);
      expect(disabledUnit.isEnabled()).toBe(false);
    });
  });

  describe('updateInfo', () => {
    it('should update unit information', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '原始單位',
        unit_name_en: 'Original Unit',
        description: '原始描述'
      });

      unit.updateInfo({
        unit_name: '更新單位',
        unit_name_en: 'Updated Unit',
        description: '更新描述'
      });

      expect(unit.unit_name).toBe('更新單位');
      expect(unit.unit_name_en).toBe('Updated Unit');
      expect(unit.description).toBe('更新描述');
    });

    it('should handle partial updates', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '原始單位',
        unit_name_en: 'Original Unit'
      });

      unit.updateInfo({
        unit_name: '更新單位'
      });

      expect(unit.unit_name).toBe('更新單位');
      expect(unit.unit_name_en).toBe('Original Unit');
    });
  });

  describe('serialization', () => {
    it('should serialize to API response format', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位',
        unit_name_en: 'Test Unit',
        description: '測試描述',
        is_active: true
      });

      const apiResponse = unit.toApiResponse();

      expect(apiResponse).toHaveProperty('unit_id', 'test_unit');
      expect(apiResponse).toHaveProperty('unit_name', '測試單位');
      expect(apiResponse).toHaveProperty('unit_name_en', 'Test Unit');
      expect(apiResponse).toHaveProperty('description', '測試描述');
      expect(apiResponse).toHaveProperty('is_active', true);
      expect(apiResponse).toHaveProperty('display_name', '測試單位');
    });

    it('should serialize to JSON format', () => {
      const unit = new Unit({
        unit_id: 'test_unit',
        unit_name: '測試單位'
      });

      const json = unit.toJSON();

      expect(json).toHaveProperty('unit_id', 'test_unit');
      expect(json).toHaveProperty('unit_name', '測試單位');
      expect(json).toHaveProperty('is_active', true);
    });
  });
});