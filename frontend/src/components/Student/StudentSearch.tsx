import React from 'react';
import { Form, Input, Select, Button, Space, Card } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface StudentSearchProps {
  onSearch: (values: any) => void;
  loading?: boolean;
}

const StudentSearch: React.FC<StudentSearchProps> = ({ onSearch, loading }) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    onSearch({});
  };

  return (
    <Card>
      <Form
        form={form}
        layout="inline"
        onFinish={onSearch}
        style={{ width: '100%' }}
      >
        <Form.Item name="search" style={{ flex: 1, minWidth: 200 }}>
          <Input
            placeholder="搜尋學生姓名或學號"
            allowClear
          />
        </Form.Item>

        <Form.Item name="status" style={{ minWidth: 150 }}>
          <Select
            placeholder="狀態"
            allowClear
            options={[
              { label: '在學', value: 'active' },
              { label: '休學', value: 'suspended' },
              { label: '畢業', value: 'graduated' },
              { label: '退學', value: 'withdrawn' },
            ]}
          />
        </Form.Item>

        <Form.Item name="nationality" style={{ minWidth: 150 }}>
          <Input placeholder="國籍" allowClear />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              搜尋
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StudentSearch;
