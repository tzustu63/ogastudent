import { DocumentType, ValidationRules } from '../document-type';

describe('DocumentType Model', () => {
  describe('constructor', () => {
    it('should create a document type with default values', () => {
      const docType = new DocumentType();
      
      expect(docType.is_required).toBe(true);
      expect(docType.display_order).toBe(0);
    });

    it('should create a document type with provided data', () => {
      const docTypeData = {
        type_id: 'test_type',
        type_name: '測試文件類型',
        type_name_en: 'Test Document Type',
        responsible_unit_id: 'test_unit',
        is_required: false,
        display_order: 5
      };

      const docType = new DocumentType(docTypeData);
      
      expect(docType.type_id).toBe('test_type');
      expect(docType.type_name).toBe('測試文件類型');
      expect(docType.type_name_en).toBe('Test Document Type');
      expect(docType.responsible_unit_id).toBe('test_unit');
      expect(docType.is_required).toBe(false);
      expect(docType.display_order).toBe(5);
    });

    it('should parse JSON string validation_rules', () => {
      const docTypeData = {
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        validation_rules: '{"formats": ["pdf", "doc"], "max_size": "10MB"}'
      };

      const docType = new DocumentType(docTypeData);
      
      expect(docType.validation_rules).toEqual({
        formats: ['pdf', 'doc'],
        max_size: '10MB'
      });
    });
  });

  describe('validateDocumentType', () => {
    it('should validate a valid document type', () => {
      const docType = new DocumentType({
        type_id: 'valid_type',
        type_name: '有效文件類型',
        responsible_unit_id: 'valid_unit'
      });

      const result = docType.validateDocumentType();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject document type with invalid type_id format', () => {
      const docType = new DocumentType({
        type_id: 'invalid-type!',
        type_name: '無效文件類型',
        responsible_unit_id: 'test_unit'
      });

      const result = docType.validateDocumentType();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('文件類型ID只能包含英文字母、數字和底線');
    });

    it('should reject document type with invalid validation rules', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        validation_rules: {
          formats: ['invalid_format'],
          max_size: 'invalid_size'
        }
      });

      const result = docType.validateDocumentType();
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getDisplayName', () => {
    it('should return Chinese name by default', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        type_name_en: 'Test Document Type',
        responsible_unit_id: 'test_unit'
      });

      expect(docType.getDisplayName()).toBe('測試文件類型');
    });

    it('should return English name when requested', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        type_name_en: 'Test Document Type',
        responsible_unit_id: 'test_unit'
      });

      expect(docType.getDisplayName('en')).toBe('Test Document Type');
    });

    it('should return Chinese name when English name is not available', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit'
      });

      expect(docType.getDisplayName('en')).toBe('測試文件類型');
    });
  });

  describe('validateFile', () => {
    it('should validate file with correct format and size', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        validation_rules: {
          formats: ['pdf', 'doc'],
          max_size: '10MB'
        }
      });

      const result = docType.validateFile('test.pdf', 5 * 1024 * 1024, 'application/pdf');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file with invalid format', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        validation_rules: {
          formats: ['pdf', 'doc']
        }
      });

      const result = docType.validateFile('test.txt', 1024, 'text/plain');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('檔案格式不符合要求，允許的格式: pdf, doc');
    });

    it('should reject file exceeding size limit', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        validation_rules: {
          max_size: '1MB'
        }
      });

      const result = docType.validateFile('test.pdf', 2 * 1024 * 1024, 'application/pdf');
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('檔案大小超過限制 1MB');
    });
  });

  describe('isRequired', () => {
    it('should return true for required document type', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        is_required: true
      });

      expect(docType.isRequired()).toBe(true);
    });

    it('should return false for optional document type', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        is_required: false
      });

      expect(docType.isRequired()).toBe(false);
    });
  });

  describe('setRequired', () => {
    it('should set document type as required', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        is_required: false
      });

      docType.setRequired(true);
      
      expect(docType.is_required).toBe(true);
    });

    it('should set document type as optional', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        is_required: true
      });

      docType.setRequired(false);
      
      expect(docType.is_required).toBe(false);
    });
  });

  describe('updateValidationRules', () => {
    it('should update validation rules', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        validation_rules: {
          formats: ['pdf']
        }
      });

      docType.updateValidationRules({
        max_size: '5MB',
        formats: ['pdf', 'doc']
      });

      expect(docType.validation_rules).toEqual({
        formats: ['pdf', 'doc'],
        max_size: '5MB'
      });
    });
  });

  describe('serialization', () => {
    it('should serialize to API response format', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        type_name_en: 'Test Document Type',
        responsible_unit_id: 'test_unit',
        is_required: true,
        display_order: 1
      });

      const apiResponse = docType.toApiResponse();

      expect(apiResponse).toHaveProperty('type_id', 'test_type');
      expect(apiResponse).toHaveProperty('type_name', '測試文件類型');
      expect(apiResponse).toHaveProperty('display_name', '測試文件類型');
      expect(apiResponse).toHaveProperty('is_required', true);
      expect(apiResponse).toHaveProperty('display_order', 1);
    });

    it('should serialize validation_rules to JSON string for database', () => {
      const docType = new DocumentType({
        type_id: 'test_type',
        type_name: '測試文件類型',
        responsible_unit_id: 'test_unit',
        validation_rules: {
          formats: ['pdf', 'doc'],
          max_size: '10MB'
        }
      });

      const dbData = docType.toDatabaseInsert();

      expect(dbData.validation_rules).toBe('{"formats":["pdf","doc"],"max_size":"10MB"}');
    });
  });
});