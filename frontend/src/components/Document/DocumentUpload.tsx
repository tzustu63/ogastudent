import React, { useState } from 'react';
import { Upload, message, Card, Form, Input, Select, Button } from 'antd';
import { InboxOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useDocumentStore } from '../../stores';
import type { UploadDocumentData } from '../../services';

const { Dragger } = Upload;
const { TextArea } = Input;

interface DocumentUploadProps {
  studentId: string;
  documentTypes: Array<{ label: string; value: string }>;
  onSuccess?: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  studentId,
  documentTypes,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadDocument = useDocumentStore((state) => state.uploadDocument);

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

  const handleSubmit = async (values: any) => {
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
      form.resetFields();
      setFileList([]);
      onSuccess?.();
    } catch (error) {
      // Error handled by store
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title="上傳文件">
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="typeId"
          label="文件類型"
          rules={[{ required: true, message: '請選擇文件類型' }]}
        >
          <Select
            placeholder="請選擇文件類型"
            options={documentTypes}
          />
        </Form.Item>

        <Form.Item label="選擇檔案">
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">點擊或拖曳檔案到此區域上傳</p>
            <p className="ant-upload-hint">
              支援單個檔案上傳，檔案大小限制 10MB
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item name="remarks" label="備註說明">
          <TextArea
            rows={4}
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
            上傳
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default DocumentUpload;
