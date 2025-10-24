import React, { useState } from 'react';
import { Modal, Form, Select, Input, message } from 'antd';
import documentService from '../../services/document.service';

const { Option } = Select;
const { TextArea } = Input;

export enum DocumentStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

interface DocumentStatusModalProps {
  visible: boolean;
  documentId: string;
  currentStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DocumentStatusModal: React.FC<DocumentStatusModalProps> = ({
  visible,
  documentId,
  currentStatus,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);

  const statusOptions = [
    { value: DocumentStatus.PENDING, label: '待審核', color: 'orange' },
    { value: DocumentStatus.UNDER_REVIEW, label: '審核中', color: 'blue' },
    { value: DocumentStatus.APPROVED, label: '已核准', color: 'green' },
    { value: DocumentStatus.REJECTED, label: '已拒絕', color: 'red' },
  ];

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await documentService.updateDocumentStatus(documentId, {
        status: values.status,
        remarks: values.remarks,
      });

      message.success('文件狀態更新成功');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('更新文件狀態失敗:', error);
      message.error(error.response?.data?.error?.message || '更新文件狀態失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
  };

  return (
    <Modal
      title="更新文件狀態"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="確認更新"
      cancelText="取消"
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: currentStatus,
        }}
      >
        <Form.Item
          name="status"
          label="文件狀態"
          rules={[{ required: true, message: '請選擇文件狀態' }]}
        >
          <Select
            placeholder="請選擇文件狀態"
            onChange={handleStatusChange}
          >
            {statusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                <span style={{ color: option.color }}>● </span>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="remarks"
          label="備註說明"
          rules={[
            {
              required: selectedStatus === DocumentStatus.REJECTED,
              message: '拒絕文件時必須填寫拒絕原因',
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={
              selectedStatus === DocumentStatus.REJECTED
                ? '請說明拒絕原因（必填）'
                : '請輸入備註說明（選填）'
            }
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DocumentStatusModal;
