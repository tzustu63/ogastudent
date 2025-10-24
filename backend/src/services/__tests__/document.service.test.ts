import { Pool } from 'pg';
import { DocumentService } from '../document.service';
import { StudentDocument, ContentType, DocumentStatus } from '../../models/student-document';

// Mock dependencies
jest.mock('../file-storage.service');
jest.mock('../url-validation.service');

describe('DocumentService', () => {
  let pool: Pool;
  let documentService: DocumentService;

  beforeEach(() => {
    pool = {} as Pool;
    documentService = new DocumentService(pool);
  });

  describe('uploadFileDocument', () => {
    it('should throw error when no file is provided', async () => {
      const params = {
        student_id: 'S001',
        type_id: 'T001',
        uploader_id: 'U001'
      };

      await expect(documentService.uploadFileDocument(params)).rejects.toThrow('未提供檔案');
    });
  });

  describe('uploadWebLinkDocument', () => {
    it('should throw error when no web_url is provided', async () => {
      const params = {
        student_id: 'S001',
        type_id: 'T001',
        uploader_id: 'U001'
      };

      await expect(documentService.uploadWebLinkDocument(params)).rejects.toThrow('未提供網頁連結');
    });
  });
});
