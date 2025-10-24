import { TrackingRecord, ActionType } from '../tracking-record';

describe('TrackingRecord Model', () => {
  describe('constructor', () => {
    it('should create a tracking record with provided data', () => {
      const recordData = {
        record_id: 'test_record',
        student_id: 'test_student',
        document_id: 'test_document',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD,
        description: '上傳文件',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0'
      };

      const record = new TrackingRecord(recordData);
      
      expect(record.record_id).toBe('test_record');
      expect(record.student_id).toBe('test_student');
      expect(record.document_id).toBe('test_document');
      expect(record.user_id).toBe('test_user');
      expect(record.action_type).toBe(ActionType.DOCUMENT_UPLOAD);
      expect(record.description).toBe('上傳文件');
      expect(record.ip_address).toBe('192.168.1.1');
      expect(record.user_agent).toBe('Mozilla/5.0');
    });

    it('should parse JSON string metadata', () => {
      const recordData = {
        record_id: 'test_record',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD,
        metadata: '{"file_name": "test.pdf", "file_size": 1024}'
      };

      const record = new TrackingRecord(recordData);
      
      expect(record.metadata).toEqual({
        file_name: 'test.pdf',
        file_size: 1024
      });
    });

    it('should handle invalid JSON metadata gracefully', () => {
      const recordData = {
        record_id: 'test_record',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD,
        metadata: 'invalid json'
      };

      const record = new TrackingRecord(recordData);
      
      expect(record.metadata).toBeUndefined();
    });
  });

  describe('validateTrackingRecord', () => {
    it('should validate a valid tracking record', () => {
      const record = new TrackingRecord({
        record_id: 'valid_record',
        user_id: 'valid_user',
        action_type: ActionType.DOCUMENT_UPLOAD
      });

      const result = record.validateTrackingRecord();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('action type checking methods', () => {
    it('should check if action is document-related', () => {
      const uploadRecord = new TrackingRecord({ action_type: ActionType.DOCUMENT_UPLOAD });
      const updateRecord = new TrackingRecord({ action_type: ActionType.DOCUMENT_UPDATE });
      const deleteRecord = new TrackingRecord({ action_type: ActionType.DOCUMENT_DELETE });
      const approveRecord = new TrackingRecord({ action_type: ActionType.DOCUMENT_APPROVE });
      const rejectRecord = new TrackingRecord({ action_type: ActionType.DOCUMENT_REJECT });
      const reviewRecord = new TrackingRecord({ action_type: ActionType.DOCUMENT_REVIEW });
      const loginRecord = new TrackingRecord({ action_type: ActionType.USER_LOGIN });

      expect(uploadRecord.isDocumentAction()).toBe(true);
      expect(updateRecord.isDocumentAction()).toBe(true);
      expect(deleteRecord.isDocumentAction()).toBe(true);
      expect(approveRecord.isDocumentAction()).toBe(true);
      expect(rejectRecord.isDocumentAction()).toBe(true);
      expect(reviewRecord.isDocumentAction()).toBe(true);
      expect(loginRecord.isDocumentAction()).toBe(false);
    });

    it('should check if action is student-related', () => {
      const createRecord = new TrackingRecord({ action_type: ActionType.STUDENT_CREATE });
      const updateRecord = new TrackingRecord({ action_type: ActionType.STUDENT_UPDATE });
      const deleteRecord = new TrackingRecord({ action_type: ActionType.STUDENT_DELETE });
      const loginRecord = new TrackingRecord({ action_type: ActionType.USER_LOGIN });

      expect(createRecord.isStudentAction()).toBe(true);
      expect(updateRecord.isStudentAction()).toBe(true);
      expect(deleteRecord.isStudentAction()).toBe(true);
      expect(loginRecord.isStudentAction()).toBe(false);
    });

    it('should check if action is user-related', () => {
      const loginRecord = new TrackingRecord({ action_type: ActionType.USER_LOGIN });
      const logoutRecord = new TrackingRecord({ action_type: ActionType.USER_LOGOUT });
      const permissionRecord = new TrackingRecord({ action_type: ActionType.PERMISSION_CHANGE });
      const uploadRecord = new TrackingRecord({ action_type: ActionType.DOCUMENT_UPLOAD });

      expect(loginRecord.isUserAction()).toBe(true);
      expect(logoutRecord.isUserAction()).toBe(true);
      expect(permissionRecord.isUserAction()).toBe(true);
      expect(uploadRecord.isUserAction()).toBe(false);
    });
  });

  describe('metadata methods', () => {
    it('should set and get metadata', () => {
      const record = new TrackingRecord({
        record_id: 'test_record',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD
      });

      record.setMetadata('file_name', 'test.pdf');
      record.setMetadata('file_size', 1024);

      expect(record.getMetadata('file_name')).toBe('test.pdf');
      expect(record.getMetadata('file_size')).toBe(1024);
      expect(record.metadata).toEqual({
        file_name: 'test.pdf',
        file_size: 1024
      });
    });

    it('should return undefined for non-existent metadata keys', () => {
      const record = new TrackingRecord({
        record_id: 'test_record',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD
      });

      expect(record.getMetadata('non_existent')).toBeUndefined();
    });
  });

  describe('getActionTypeDisplayName', () => {
    it('should return correct display names for all action types', () => {
      const testCases = [
        { action: ActionType.DOCUMENT_UPLOAD, expected: '上傳文件' },
        { action: ActionType.DOCUMENT_UPDATE, expected: '更新文件' },
        { action: ActionType.DOCUMENT_DELETE, expected: '刪除文件' },
        { action: ActionType.DOCUMENT_APPROVE, expected: '核准文件' },
        { action: ActionType.DOCUMENT_REJECT, expected: '拒絕文件' },
        { action: ActionType.DOCUMENT_REVIEW, expected: '審核文件' },
        { action: ActionType.STUDENT_CREATE, expected: '建立學生' },
        { action: ActionType.STUDENT_UPDATE, expected: '更新學生' },
        { action: ActionType.STUDENT_DELETE, expected: '刪除學生' },
        { action: ActionType.USER_LOGIN, expected: '使用者登入' },
        { action: ActionType.USER_LOGOUT, expected: '使用者登出' },
        { action: ActionType.PERMISSION_CHANGE, expected: '權限變更' }
      ];

      testCases.forEach(({ action, expected }) => {
        const record = new TrackingRecord({ action_type: action });
        expect(record.getActionTypeDisplayName()).toBe(expected);
      });
    });
  });

  describe('serialization', () => {
    it('should serialize to API response format', () => {
      const record = new TrackingRecord({
        record_id: 'test_record',
        student_id: 'test_student',
        document_id: 'test_document',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD,
        description: '上傳文件',
        metadata: { file_name: 'test.pdf' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0'
      });

      const apiResponse = record.toApiResponse();

      expect(apiResponse).toHaveProperty('record_id', 'test_record');
      expect(apiResponse).toHaveProperty('action_type', ActionType.DOCUMENT_UPLOAD);
      expect(apiResponse).toHaveProperty('action_type_display_name', '上傳文件');
      expect(apiResponse).toHaveProperty('metadata', { file_name: 'test.pdf' });
      expect(apiResponse).toHaveProperty('ip_address', '192.168.1.1');
    });

    it('should serialize metadata to JSON string for database', () => {
      const record = new TrackingRecord({
        record_id: 'test_record',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD,
        metadata: {
          file_name: 'test.pdf',
          file_size: 1024
        }
      });

      const dbData = record.toDatabaseInsert();

      expect(dbData.metadata).toBe('{"file_name":"test.pdf","file_size":1024}');
    });

    it('should handle undefined metadata in database serialization', () => {
      const record = new TrackingRecord({
        record_id: 'test_record',
        user_id: 'test_user',
        action_type: ActionType.DOCUMENT_UPLOAD
      });

      const dbData = record.toDatabaseInsert();

      expect(dbData.metadata).toBeUndefined();
    });
  });
});