import React, { useState } from 'react';
import { List, Tag, Button, Space, Typography } from 'antd';
import { 
  FileOutlined, 
  LinkOutlined, 
  EyeOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  EditOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { StudentDocument } from '../../services';
import { DocumentStatusModal } from '../Document';

const { Text } = Typography;

interface DocumentListProps {
  documents: StudentDocument[];
  loading?: boolean;
  onPreview?: (document: StudentDocument) => void;
  onStatusUpdated?: () => void;
  canUpdateStatus?: boolean;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onPreview,
  onStatusUpdated,
  canUpdateStatus = false,
}) => {
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<StudentDocument | null>(null);

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      uploaded: { color: 'green', text: '已上傳', icon: <CheckCircleOutlined /> },
      pending: { color: 'orange', text: '待審核', icon: <ClockCircleOutlined /> },
      under_review: { color: 'blue', text: '審核中', icon: <SyncOutlined spin /> },
      approved: { color: 'green', text: '已核准', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: '已拒絕', icon: <CloseCircleOutlined /> },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status, icon: null };
    return (
      <Tag color={statusInfo.color} icon={statusInfo.icon}>
        {statusInfo.text}
      </Tag>
    );
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

  return (
    <>
      <List
        loading={loading}
        dataSource={documents}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => onPreview?.(item)}
              >
                查看
              </Button>,
              ...(canUpdateStatus ? [
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  onClick={() => handleUpdateStatus(item)}
                >
                  更新狀態
                </Button>
              ] : []),
            ]}
          >
            <List.Item.Meta
              avatar={
                item.content_type === 'file' ? (
                  <FileOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                ) : (
                  <LinkOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                )
              }
              title={
                <Space>
                  <Text strong>{item.typeName}</Text>
                  {getStatusTag(item.status)}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">
                    上傳者：{item.uploader.name} ({item.uploader.unitName})
                  </Text>
                  <Text type="secondary">
                    上傳時間：{new Date(item.uploaded_at).toLocaleString('zh-TW')}
                  </Text>
                  {item.remarks && (
                    <Text type="secondary">備註：{item.remarks}</Text>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />

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

export default DocumentList;
