import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Space, Row, Col, message } from 'antd';
import {
  StudentProfile,
  DocumentChecklist,
  CompletionProgress,
} from '../components/Student';
import { DocumentPreview, DocumentUploadModal } from '../components/Document';
import { useStudentStore, useAuthStore } from '../stores';
import { Loading, ErrorDisplay } from '../components/Common';
import documentService from '../services/document.service';
import type { StudentDocument } from '../services';

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentStudent, isLoading, error, fetchStudentProfile } = useStudentStore();
  const { user } = useAuthStore();
  const [previewDocument, setPreviewDocument] = useState<StudentDocument | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [selectedTypeName, setSelectedTypeName] = useState<string>('');

  // 檢查用戶是否有審核權限（只有稽核人員和管理員）
  const canUpdateStatus = user?.role === 'admin' || user?.role === 'auditor';
  
  // 檢查用戶是否有上傳權限（管理員和單位職員可以上傳，稽核人員不可以）
  const canUpload = user?.role === 'admin' || user?.role === 'unit_staff';

  useEffect(() => {
    if (id) {
      fetchStudentProfile(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePreview = (document: StudentDocument) => {
    setPreviewDocument(document);
    setPreviewVisible(true);
  };

  const handleUpload = (typeId: string, typeName?: string) => {
    setSelectedTypeId(typeId);
    setSelectedTypeName(typeName || '');
    setUploadVisible(true);
  };

  const handleUploadSuccess = () => {
    // 重新載入學生資料
    if (id) {
      fetchStudentProfile(id);
    }
  };

  const handleStatusUpdated = () => {
    // 狀態更新後重新載入學生資料
    if (id) {
      fetchStudentProfile(id);
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      const { blob, filename } = await documentService.downloadDocument(documentId);
      
      // 創建下載連結
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename; // 使用從 server 取得的檔名
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('檔案下載成功');
    } catch (error) {
      console.error('下載失敗:', error);
      message.error('檔案下載失敗，請稍後再試');
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorDisplay message={error} />;
  if (!currentStudent) return <ErrorDisplay message="找不到學生資料" />;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <StudentProfile student={currentStudent.student} />
        </Col>
        <Col xs={24} lg={8}>
          <CompletionProgress
            completionRate={currentStudent.completion.completion_rate}
            completed={currentStudent.completion.completed}
            total={currentStudent.completion.total_required}
          />
        </Col>
      </Row>

      <DocumentChecklist
        documents={currentStudent.documents}
        completion={currentStudent.completion}
        onUpload={handleUpload}
        onPreview={handlePreview}
        onStatusUpdated={handleStatusUpdated}
        canUpdateStatus={canUpdateStatus}
        canUpload={canUpload}
      />

      <DocumentPreview
        document={previewDocument}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
        onDownload={handleDownload}
      />

      <DocumentUploadModal
        visible={uploadVisible}
        onClose={() => setUploadVisible(false)}
        studentId={id!}
        preselectedTypeId={selectedTypeId}
        preselectedTypeName={selectedTypeName}
        onSuccess={handleUploadSuccess}
      />
    </Space>
  );
};

export default StudentDetailPage;
