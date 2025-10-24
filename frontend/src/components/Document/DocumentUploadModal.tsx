import React, { useState, useEffect } from 'react';
import { Modal, Upload, message, Form, Input, Select, Button, Tabs } from 'antd';
import { InboxOutlined, UploadOutlined, LinkOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useDocumentStore } from '../../stores';
import type { UploadDocumentData, AddWebLinkData } from '../../services';

const { Dragger } = Upload;
const { TextArea } = Input;

interface DocumentUploadModalProps {
  visible: boolean;
  onClose: () => void;
  studentId: string;
  preselectedTypeId?: string;
  preselectedTypeName?: string;
  onSuccess?: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  visible,
  onClose,
  studentId,
  preselectedTypeId,
  preselectedTypeName,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [linkForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('file');
  
  const { documentTypes, fetchDocumentTypes, uploadDocument, addWebLink } = useDocumentStore();

  useEffect(() => {
    if (visible) {
      fetchDocumentTypes();
      // 當 modal 打開時，如果有預選的類型，設定表單值
      if (preselectedTypeId) {
        form.setFieldsValue({ typeId: preselectedTypeId });
        linkForm.setFieldsValue({ typeId: preselectedTypeId });
      }
    }
  }, [visible, preselectedTypeId]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList,
    beforeUpload: (file) => {
      const isValidSize = file.size / 1024 / 1024 < 10; // 10MB limit
      if (!isValidSize) {
        message.error('檔案大小不能超過 10MB');
        return false;
      }
      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
  };

  const handleFileUpload = async (values: any) => {
    if (fileList.length === 0) {
      message.error('請選擇要上傳的檔案');
      return;
    }

    setUploading(true);
    try {
      const uploadData: UploadDocumentData = {
        studentId,
        typeId: values.typeId,
        remarks: values.remarks,
      };

      await uploadDocument(fileList[0], uploadData);
      message.success('檔案上傳成功');
      handleClose();
      onSuccess?.();
    } catch (error) {
      // Error handled by store
    } finally {
      setUploading(false);
    }
  };

  const handleLinkSubmit = async (values: any) => {
    setUploading(true);
    try {
      const linkData: AddWebLinkData = {
        studentId,
        typeId: values.typeId,
        webUrl: values.webUrl,
        remarks: values.remarks,
      };

      await addWebLink(linkData);
      message.success('網頁連結新增成功');
      handleClose();
      onSuccess?.();
    } catch (error) {
      // Error handled by store
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    linkForm.resetFields();
    setFileList([]);
    setUploading(false);
    setActiveTab('file');
    onClose();
  };

  const documentTypeOptions = documentTypes.map(type => ({
    label: type.typeName,
    value: type.id,
  }));

  const tabItems = [
    {
      key: 'file',
      label: '檔案上傳',
      children: (
        <Form form={form} layout="vertical" onFinish={handleFileUpload}>
          <Form.Item
            name="typeId"
            label="文件類型"
            rules={[{ required: true, message: '請選擇文件類型' }]}
          >
            <Select
              placeholder="請選擇文件類型"
              options={documentTypeOptions}
              disabled={!!preselectedTypeId}
            />
          </Form.Item>

          <Form.Item label="選擇檔案">
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">點擊或拖曳檔案到此區域上傳</p>
              <p className="ant-upload-hint">
                支援 PDF、DOC、DOCX、JPG、PNG 格式，檔案大小限制 10MB
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item name="remarks" label="備註說明">
            <TextArea
              rows={3}
              placeholder="請輸入備註說明（選填）"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              icon={<UploadOutlined />}
              block
            >
              上傳檔案
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'link',
      label: '網頁連結',
      children: (
        <Form form={linkForm} layout="vertical" onFinish={handleLinkSubmit}>
          <Form.Item
            name="typeId"
            label="文件類型"
            rules={[{ required: true, message: '請選擇文件類型' }]}
          >
            <Select
              placeholder="請選擇文件類型"
              options={documentTypeOptions}
              disabled={!!preselectedTypeId}
            />
          </Form.Item>

          <Form.Item
            name="webUrl"
            label="網頁連結"
            rules={[
              { required: true, message: '請輸入網頁連結' },
              { type: 'url', message: '請輸入有效的網址' }
            ]}
          >
            <Input
              placeholder="https://example.com"
              prefix={<LinkOutlined />}
            />
          </Form.Item>

          <Form.Item name="remarks" label="備註說明">
            <TextArea
              rows={3}
              placeholder="請輸入備註說明（選填）"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              icon={<LinkOutlined />}
              block
            >
              新增連結
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <Modal
      title={`上傳文件${preselectedTypeName ? ` - ${preselectedTypeName}` : ''}`}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={600}
      destroyOnHidden
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Modal>
  );
};

export default DocumentUploadModal;