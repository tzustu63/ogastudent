import React from 'react';
import { Modal, Button, Space, Typography } from 'antd';
import { DownloadOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons';
import type { StudentDocument } from '../../services';

const { Text, Link } = Typography;

interface DocumentPreviewProps {
  document: StudentDocument | null;
  visible: boolean;
  onClose: () => void;
  onDownload?: (documentId: string) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  visible,
  onClose,
  onDownload,
}) => {
  if (!document) return null;

  const handleDownload = () => {
    if (onDownload && document.document_id) {
      onDownload(document.document_id);
    }
  };

  const renderContent = () => {
    if (document.content_type === 'web_url' && document.web_url) {
      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>網頁連結：</Text>
          <Link href={document.web_url} target="_blank" rel="noopener noreferrer">
            <LinkOutlined /> {document.web_url}
          </Link>
        </Space>
      );
    }

    if (document.content_type === 'file' && document.file_path) {
      const fileExtension = document.file_path.split('.').pop()?.toLowerCase();
      const isPdf = fileExtension === 'pdf';
      const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '');

      return (
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>檔案名稱：</Text>
          <Text>{document.file_name || document.file_path.split('/').pop()}</Text>
          
          {isPdf && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">PDF 預覽功能即將推出</Text>
            </div>
          )}
          
          {isImage && (
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">圖片預覽功能即將推出</Text>
            </div>
          )}
        </Space>
      );
    }

    return <Text type="secondary">無法預覽此文件</Text>;
  };

  return (
    <Modal
      title={`文件預覽 - ${document.typeName}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          關閉
        </Button>,
        document.content_type === 'file' && (
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
          >
            下載
          </Button>
        ),
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {renderContent()}
        
        {document.remarks && (
          <div>
            <Text strong>備註說明：</Text>
            <div style={{ marginTop: 8 }}>
              <Text>{document.remarks}</Text>
            </div>
          </div>
        )}
        
        <div>
          <Text strong>上傳資訊：</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              上傳者：{document.uploader.name} ({document.uploader.unitName})
            </Text>
            <br />
            <Text type="secondary">
              上傳時間：{new Date(document.uploaded_at).toLocaleString('zh-TW')}
            </Text>
          </div>
        </div>
      </Space>
    </Modal>
  );
};

export default DocumentPreview;
