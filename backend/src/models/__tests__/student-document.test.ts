import { StudentDocument, ContentType, DocumentStatus } from '../student-document';

describe('StudentDocument Model', () => {
  describe('constructor', () => {
    it('should create a student document with default values', () => {
      const doc = new StudentDocument();
      
      expect(doc.status).toBe(DocumentStatus.PENDING);
      expect(doc.version).toBe(1);
      expect(doc.is_current).toBe(true);
    });

    it('should create a student document with provided data', () => {
      const docData = {
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.FILE,
        file_name: 'test.pdf',
        file_size: 1024,
        status: DocumentStatus.APPROVED,
        version: 2
      };

      const doc = new StudentDocument(docData);
      
      expect(doc.document_id).toBe('test_doc');
      expect(doc.student_id).toBe('test_student');
      expect(doc.content_type).toBe(ContentType.FILE);
      expect(doc.file_name).toBe('test.pdf');
      expect(doc.status).toBe(DocumentStatus.APPROVED);
      expect(doc.version).toBe(2);
    });
  });

  describe('validateStudentDocument', () => {
    it('should validate a valid file document', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.FILE,
        file_path: '/path/to/file.pdf',
        file_name: 'test.pdf'
      });

      const result = doc.validateStudentDocument();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate a valid web URL document', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.WEB_URL,
        web_url: 'https://example.com/document'
      });

      const result = doc.validateStudentDocument();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject file document without file_path', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.FILE,
        file_name: 'test.pdf'
      });

      const result = doc.validateStudentDocument();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('檔案類型的文件必須提供檔案路徑');
    });

    it('should reject web URL document without web_url', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.WEB_URL
      });

      const result = doc.validateStudentDocument();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('網頁連結類型的文件必須提供網頁連結');
    });
  });

  describe('content type methods', () => {
    it('should check if document is file type', () => {
      const fileDoc = new StudentDocument({ content_type: ContentType.FILE });
      const urlDoc = new StudentDocument({ content_type: ContentType.WEB_URL });

      expect(fileDoc.isFile()).toBe(true);
      expect(fileDoc.isWebUrl()).toBe(false);
      
      expect(urlDoc.isFile()).toBe(false);
      expect(urlDoc.isWebUrl()).toBe(true);
    });
  });

  describe('status methods', () => {
    it('should check document status correctly', () => {
      const pendingDoc = new StudentDocument({ status: DocumentStatus.PENDING });
      const approvedDoc = new StudentDocument({ status: DocumentStatus.APPROVED });
      const rejectedDoc = new StudentDocument({ status: DocumentStatus.REJECTED });
      const reviewDoc = new StudentDocument({ status: DocumentStatus.UNDER_REVIEW });

      expect(pendingDoc.isPending()).toBe(true);
      expect(pendingDoc.isApproved()).toBe(false);
      
      expect(approvedDoc.isApproved()).toBe(true);
      expect(approvedDoc.isPending()).toBe(false);
      
      expect(rejectedDoc.isRejected()).toBe(true);
      expect(rejectedDoc.isApproved()).toBe(false);
      
      expect(reviewDoc.isUnderReview()).toBe(true);
      expect(reviewDoc.isPending()).toBe(false);
    });

    it('should update document status', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.FILE,
        status: DocumentStatus.PENDING
      });

      doc.approve('文件已核准');
      expect(doc.status).toBe(DocumentStatus.APPROVED);
      expect(doc.remarks).toBe('文件已核准');

      doc.reject('文件不符合要求');
      expect(doc.status).toBe(DocumentStatus.REJECTED);
      expect(doc.remarks).toBe('文件不符合要求');

      doc.setUnderReview('正在審核中');
      expect(doc.status).toBe(DocumentStatus.UNDER_REVIEW);
      expect(doc.remarks).toBe('正在審核中');

      doc.setPending('重新提交審核');
      expect(doc.status).toBe(DocumentStatus.PENDING);
      expect(doc.remarks).toBe('重新提交審核');
    });
  });

  describe('version methods', () => {
    it('should check if document is current version', () => {
      const currentDoc = new StudentDocument({ is_current: true });
      const oldDoc = new StudentDocument({ is_current: false });

      expect(currentDoc.isCurrent()).toBe(true);
      expect(oldDoc.isCurrent()).toBe(false);
    });

    it('should set document as current or obsolete', () => {
      const doc = new StudentDocument({ is_current: false });

      doc.setCurrent();
      expect(doc.is_current).toBe(true);

      doc.setObsolete();
      expect(doc.is_current).toBe(false);
    });

    it('should increment version number', () => {
      const doc = new StudentDocument({ version: 1 });

      doc.incrementVersion();
      expect(doc.version).toBe(2);

      doc.incrementVersion();
      expect(doc.version).toBe(3);
    });
  });

  describe('updateFileInfo', () => {
    it('should update file information for file documents', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.FILE
      });

      doc.updateFileInfo('new_file.pdf', 2048, 'application/pdf', '/new/path/file.pdf');

      expect(doc.file_name).toBe('new_file.pdf');
      expect(doc.file_size).toBe(2048);
      expect(doc.mime_type).toBe('application/pdf');
      expect(doc.file_path).toBe('/new/path/file.pdf');
    });

    it('should throw error when updating file info for web URL documents', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.WEB_URL
      });

      expect(() => {
        doc.updateFileInfo('file.pdf', 1024, 'application/pdf', '/path/file.pdf');
      }).toThrow('只有檔案類型的文件可以更新檔案資訊');
    });
  });

  describe('updateWebUrl', () => {
    it('should update web URL for web URL documents', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.WEB_URL
      });

      doc.updateWebUrl('https://example.com/new-document');

      expect(doc.web_url).toBe('https://example.com/new-document');
    });

    it('should throw error when updating web URL for file documents', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.FILE
      });

      expect(() => {
        doc.updateWebUrl('https://example.com/document');
      }).toThrow('只有網頁連結類型的文件可以更新網頁連結');
    });
  });

  describe('getFileExtension', () => {
    it('should return file extension', () => {
      const doc = new StudentDocument({ file_name: 'test.pdf' });
      expect(doc.getFileExtension()).toBe('pdf');

      const doc2 = new StudentDocument({ file_name: 'document.docx' });
      expect(doc2.getFileExtension()).toBe('docx');
    });

    it('should return null for files without extension', () => {
      const doc = new StudentDocument({ file_name: 'testfile' });
      expect(doc.getFileExtension()).toBeNull();

      const doc2 = new StudentDocument({});
      expect(doc2.getFileExtension()).toBeNull();
    });
  });

  describe('getFormattedFileSize', () => {
    it('should format file size correctly', () => {
      const doc1 = new StudentDocument({ file_size: 512 });
      expect(doc1.getFormattedFileSize()).toBe('512 B');

      const doc2 = new StudentDocument({ file_size: 1536 });
      expect(doc2.getFormattedFileSize()).toBe('1.5 KB');

      const doc3 = new StudentDocument({ file_size: 2 * 1024 * 1024 });
      expect(doc3.getFormattedFileSize()).toBe('2.0 MB');
    });

    it('should return null when file size is not set', () => {
      const doc = new StudentDocument({});
      expect(doc.getFormattedFileSize()).toBeNull();
    });
  });

  describe('display names', () => {
    it('should return correct status display names', () => {
      const pendingDoc = new StudentDocument({ status: DocumentStatus.PENDING });
      const approvedDoc = new StudentDocument({ status: DocumentStatus.APPROVED });
      const rejectedDoc = new StudentDocument({ status: DocumentStatus.REJECTED });
      const reviewDoc = new StudentDocument({ status: DocumentStatus.UNDER_REVIEW });

      expect(pendingDoc.getStatusDisplayName()).toBe('待審核');
      expect(approvedDoc.getStatusDisplayName()).toBe('已核准');
      expect(rejectedDoc.getStatusDisplayName()).toBe('已拒絕');
      expect(reviewDoc.getStatusDisplayName()).toBe('審核中');
    });

    it('should return correct content type display names', () => {
      const fileDoc = new StudentDocument({ content_type: ContentType.FILE });
      const urlDoc = new StudentDocument({ content_type: ContentType.WEB_URL });

      expect(fileDoc.getContentTypeDisplayName()).toBe('檔案');
      expect(urlDoc.getContentTypeDisplayName()).toBe('網頁連結');
    });
  });

  describe('serialization', () => {
    it('should serialize to API response format', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        student_id: 'test_student',
        type_id: 'test_type',
        uploader_id: 'test_user',
        content_type: ContentType.FILE,
        file_name: 'test.pdf',
        file_size: 1024,
        status: DocumentStatus.APPROVED,
        version: 1
      });

      const apiResponse = doc.toApiResponse();

      expect(apiResponse).toHaveProperty('document_id', 'test_doc');
      expect(apiResponse).toHaveProperty('content_type_display_name', '檔案');
      expect(apiResponse).toHaveProperty('status_display_name', '已核准');
      expect(apiResponse).toHaveProperty('formatted_file_size', '1.0 KB');
      expect(apiResponse).toHaveProperty('file_extension', 'pdf');
    });

    it('should serialize to brief info format', () => {
      const doc = new StudentDocument({
        document_id: 'test_doc',
        type_id: 'test_type',
        content_type: ContentType.FILE,
        file_name: 'test.pdf',
        status: DocumentStatus.APPROVED,
        version: 1
      });

      const briefInfo = doc.toBriefInfo();

      expect(briefInfo).toHaveProperty('document_id', 'test_doc');
      expect(briefInfo).toHaveProperty('status_display_name', '已核准');
      expect(briefInfo).not.toHaveProperty('uploader_id');
      expect(briefInfo).not.toHaveProperty('file_path');
    });
  });
});