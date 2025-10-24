import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import { useDocumentStore } from '../../stores';
import type { AddWebLinkData } from '../../services';

const { TextArea } = Input;

interface WebLinkFormProps {
  studentId: string;
  documentTypes: Array<{ label: string; value: string }>;
  onSuccess?: () => void;
}

const WebLinkForm: React.FC<WebLinkFormProps> = ({
  studentId,
  documentTypes,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const addWebLink = useDocumentStore((state) => state.addWebLink);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const linkData: AddWebLinkData = {
        studentId,
        typeId: values.typeId,
        webUrl: values.webUrl,
        remarks: values.remarks,
      };

      await addWebLink(linkData);
      message.success('網頁連結新增成功');
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="新增網頁連結">
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

        <Form.Item
          name="webUrl"
          label="網頁連結"
          rules={[
            { required: true, message: '請輸入網頁連結' },
            { type: 'url', message: '請輸入有效的網址' },
          ]}
        >
          <Input
            prefix={<LinkOutlined />}
            placeholder="https://example.com"
          />
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
            loading={loading}
            icon={<LinkOutlined />}
            block
          >
            新增連結
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default WebLinkForm;
