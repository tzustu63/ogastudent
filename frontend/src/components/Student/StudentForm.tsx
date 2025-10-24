import React from 'react';
import { Form, Input, Select, DatePicker, Button, Card, Row, Col, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

export interface StudentFormData {
  student_id: string;
  name: string;
  email?: string;
  nationality?: string;
  passport_number?: string;
  phone?: string;
  program?: string;
  enrollment_date?: string;
  expected_graduation_date?: string;
  status: 'active' | 'suspended' | 'graduated' | 'withdrawn';
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    address?: string;
  };
}

interface StudentFormProps {
  initialValues?: Partial<StudentFormData>;
  onSubmit: (values: StudentFormData) => Promise<void>;
  loading?: boolean;
  isEdit?: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  isEdit = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      const formData: StudentFormData = {
        student_id: values.student_id,
        name: values.name,
        email: values.email,
        nationality: values.nationality,
        passport_number: values.passport_number,
        phone: values.phone,
        program: values.program,
        enrollment_date: values.enrollment_date?.format('YYYY-MM-DD'),
        expected_graduation_date: values.expected_graduation_date?.format('YYYY-MM-DD'),
        status: values.status,
        emergency_contact: values.emergency_contact_name ? {
          name: values.emergency_contact_name,
          relationship: values.emergency_contact_relationship || '家人',
          phone: values.emergency_contact_phone,
          email: values.emergency_contact_email,
          address: values.emergency_contact_address,
        } : undefined,
      };
      await onSubmit(formData);
      if (!isEdit) {
        form.resetFields();
        message.success('學生資料建立成功');
      } else {
        message.success('學生資料更新成功');
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const initialFormValues = initialValues ? {
    ...initialValues,
    enrollment_date: initialValues.enrollment_date ? dayjs(initialValues.enrollment_date) : undefined,
    expected_graduation_date: initialValues.expected_graduation_date ? dayjs(initialValues.expected_graduation_date) : undefined,
    emergency_contact_name: initialValues.emergency_contact?.name,
    emergency_contact_relationship: initialValues.emergency_contact?.relationship,
    emergency_contact_phone: initialValues.emergency_contact?.phone,
    emergency_contact_email: initialValues.emergency_contact?.email,
    emergency_contact_address: initialValues.emergency_contact?.address,
  } : {};

  return (
    <Card title={isEdit ? '編輯學生資料' : '新增學生資料'}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialFormValues}
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="student_id"
              label="學號"
              rules={[
                { required: true, message: '請輸入學號' },
                { pattern: /^[A-Z0-9]+$/, message: '學號只能包含大寫字母和數字' }
              ]}
            >
              <Input placeholder="請輸入學號" disabled={isEdit} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label="中文姓名"
              rules={[{ required: true, message: '請輸入中文姓名' }]}
            >
              <Input placeholder="請輸入中文姓名" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="nationality"
              label="國籍"
            >
              <Select placeholder="請選擇國籍" showSearch>
                <Option value="美國">美國</Option>
                <Option value="日本">日本</Option>
                <Option value="韓國">韓國</Option>
                <Option value="泰國">泰國</Option>
                <Option value="越南">越南</Option>
                <Option value="印尼">印尼</Option>
                <Option value="馬來西亞">馬來西亞</Option>
                <Option value="新加坡">新加坡</Option>
                <Option value="菲律賓">菲律賓</Option>
                <Option value="印度">印度</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="passport_number"
              label="護照號碼"
            >
              <Input placeholder="請輸入護照號碼" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="電子郵件"
              rules={[
                { type: 'email', message: '請輸入有效的電子郵件格式' }
              ]}
            >
              <Input placeholder="請輸入電子郵件" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="聯絡電話"
            >
              <Input placeholder="請輸入聯絡電話" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="program"
              label="就讀科系"
            >
              <Input placeholder="請輸入就讀科系" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="學籍狀態"
              rules={[{ required: true, message: '請選擇學籍狀態' }]}
              initialValue="active"
            >
              <Select placeholder="請選擇學籍狀態">
                <Option value="active">在學</Option>
                <Option value="suspended">休學</Option>
                <Option value="graduated">畢業</Option>
                <Option value="withdrawn">退學</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="enrollment_date"
              label="入學日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="請選擇入學日期" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="expected_graduation_date"
              label="預計畢業日期"
            >
              <DatePicker style={{ width: '100%' }} placeholder="請選擇預計畢業日期" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="emergency_contact_name"
              label="緊急聯絡人姓名"
            >
              <Input placeholder="請輸入緊急聯絡人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="emergency_contact_relationship"
              label="關係"
            >
              <Select placeholder="請選擇關係">
                <Option value="父親">父親</Option>
                <Option value="母親">母親</Option>
                <Option value="配偶">配偶</Option>
                <Option value="兄弟姊妹">兄弟姊妹</Option>
                <Option value="朋友">朋友</Option>
                <Option value="其他">其他</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="emergency_contact_phone"
              label="緊急聯絡人電話"
            >
              <Input placeholder="請輸入緊急聯絡人電話" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="emergency_contact_email"
              label="緊急聯絡人電子郵件"
            >
              <Input placeholder="請輸入緊急聯絡人電子郵件" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="emergency_contact_address"
          label="緊急聯絡人地址"
        >
          <Input.TextArea rows={2} placeholder="請輸入緊急聯絡人地址" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            {isEdit ? '更新學生資料' : '建立學生資料'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default StudentForm;