import React, { useState } from 'react';
import { Card, List, Tag, Button, Space, Typography, Progress } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  FileOutlined,
  LinkOutlined,
  EditOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { StudentDocument } from '../../services';
import { DocumentStatusModal } from '../Document';

const { Text, Title } = Typography;

interface DocumentType {
  type_id: string;
  type_name: string;
  responsible_unit: string;
  is_required: boolean;
}

interface DocumentChecklistProps {
  documents: StudentDocument[];
  completion: {
    total_required: number;
    completed: number;
    completion_rate: number;
  };
  onUpload?: (typeId: string, typeName?: string) => void;
  onPreview?: (document: StudentDocument) => void;
  onStatusUpdated?: () => void;
  canUpdateStatus?: boolean;
  canUpload?: boolean;
}

const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents,
  completion,
  onUpload,
  onPreview,
  onStatusUpdated,
  canUpdateStatus = false,
  canUpload = true,
}) => {
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StudentDocument | null>(null);
  // 定義所有18個文件類型
  const allDocumentTypes: DocumentType[] = [
    { type_id: 'admission_regulations', type_name: '招生規定', responsible_unit: '全球處', is_required: true },
    { type_id: 'admission_brochure', type_name: '招生簡章', responsible_unit: '全球處', is_required: true },
    { type_id: 'admission_website', type_name: '招生網頁', responsible_unit: '全球處', is_required: true },
    { type_id: 'graduation_certificate', type_name: '畢業證書', responsible_unit: '註冊組', is_required: true },
    { type_id: 'grade_5_students', type_name: '中五生', responsible_unit: '註冊組', is_required: true },
    { type_id: 'academic_transcripts', type_name: '歷年成績單', responsible_unit: '註冊組', is_required: true },
    { type_id: 'chinese_proficiency', type_name: '華語能力證明', responsible_unit: '全球處', is_required: true },
    { type_id: 'english_proficiency', type_name: '英文能力證明', responsible_unit: '全球處', is_required: true },
    { type_id: 'financial_proof', type_name: '財力證明或獎學金證明', responsible_unit: '全球處', is_required: true },
    { type_id: 'admission_notice', type_name: '錄取通知單', responsible_unit: '全球處', is_required: true },
    { type_id: 'enrollment_agreement', type_name: '入學法規切結書', responsible_unit: '全球處', is_required: true },
    { type_id: 'credit_hour_table', type_name: '各系所中英文對照學分時數表', responsible_unit: '各系所學程、通識中心', is_required: true },
    { type_id: 'internship_contract', type_name: '學生實習合約', responsible_unit: '實就組', is_required: true },
    { type_id: 'chinese_teachers', type_name: '華語師資', responsible_unit: '外語中心', is_required: true },
    { type_id: 'tuition_fee_standard', type_name: '學雜費收退費基準', responsible_unit: '註冊組', is_required: true },
    { type_id: 'scholarships', type_name: '獎助學金', responsible_unit: '全球處、招策中心、課務組、生輔組', is_required: true },
    { type_id: 'dormitory_info', type_name: '宿舍', responsible_unit: '宿輔組', is_required: true },
    { type_id: 'graduate_employment', type_name: '畢業流向', responsible_unit: '實就組', is_required: true },
  ];

  const getDocumentStatus = (typeName: string) => {
    const document = documents.find(doc => doc.typeName === typeName);
    if (document) {
      return {
        status: document.status,
        document: document,
        hasDocument: true
      };
    }
    return {
      status: 'missing',
      document: null,
      hasDocument: false
    };
  };

  const handleUpdateStatus = (document: StudentDocument) => {
    setSelectedDocument(document);
    setStatusModalVisible(true);
  };

  const handleStatusModalClose = () => {
    setStatusModalVisible(false);
    setSelectedDocument(null);
  };

  const handleStatusUpdateSuccess = () => {
    if (onStatusUpdated) {
      onStatusUpdated();
    }
  };

  const getStatusTag = (status: string, hasDocument: boolean) => {
    if (!hasDocument) {
      return (
        <Tag color="red" icon={<ExclamationCircleOutlined />}>
          未上傳
        </Tag>
      );
    }

    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pending: { color: 'orange', text: '待審核', icon: <ClockCircleOutlined /> },
      approved: { color: 'green', text: '已核准', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: '已拒絕', icon: <CloseCircleOutlined /> },
      under_review: { color: 'blue', text: '審核中', icon: <SyncOutlined spin /> },
    };
    
    const statusInfo = statusMap[status] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
  };

  const renderActions = (docType: DocumentType, docStatus: any) => {
    const actions = [];
    
    if (docStatus.hasDocument) {
      actions.push(
        <Button
          key="preview"
          type="link"
          size="small"
          icon={docStatus.document.content_type === 'file' ? <FileOutlined /> : <LinkOutlined />}
          onClick={() => onPreview?.(docStatus.document)}
        >
          查看
        </Button>
      );

      if (canUpdateStatus) {
        actions.push(
          <Button
            key="status"
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleUpdateStatus(docStatus.document)}
          >
            更新狀態
          </Button>
        );
      }
    }
    
    // 只有有上傳權限的角色才顯示上傳按鈕
    if (canUpload) {
      actions.push(
        <Button
          key="upload"
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onUpload?.(docType.type_id, docType.type_name)}
        >
          {docStatus.hasDocument ? '重新上傳' : '上傳'}
        </Button>
      );
    }
    
    return actions;
  };

  return (
    <>
      <Card 
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>文件檢查清單</Title>
            <Progress 
              percent={Math.round(completion.completion_rate)} 
              size="small" 
              style={{ width: 200 }}
              format={(percent) => `${completion.completed}/${completion.total_required} (${percent}%)`}
            />
          </Space>
        }
      >
        <List
          dataSource={allDocumentTypes}
          renderItem={(docType, index) => {
            const docStatus = getDocumentStatus(docType.type_name);
            
            return (
              <List.Item
                actions={renderActions(docType, docStatus)}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{index + 1}. {docType.type_name}</Text>
                      {getStatusTag(docStatus.status, docStatus.hasDocument)}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">負責單位：{docType.responsible_unit}</Text>
                      {docStatus.hasDocument && docStatus.document && (
                        <>
                          {docStatus.document.uploader && (
                            <Text type="secondary">
                              上傳者：{docStatus.document.uploader.name}
                              {docStatus.document.uploader.unitName && ` (${docStatus.document.uploader.unitName})`}
                            </Text>
                          )}
                          <Text type="secondary">
                            上傳時間：{new Date(docStatus.document.uploaded_at).toLocaleString('zh-TW')}
                          </Text>
                          {docStatus.document.remarks && (
                            <Text type="secondary">備註：{docStatus.document.remarks}</Text>
                          )}
                        </>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      {selectedDocument && (
        <DocumentStatusModal
          visible={statusModalVisible}
          documentId={selectedDocument.document_id}
          currentStatus={selectedDocument.status}
          onClose={handleStatusModalClose}
          onSuccess={handleStatusUpdateSuccess}
        />
      )}
    </>
  );
};

export default DocumentChecklist;