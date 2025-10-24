import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores';
import apiClient from '../services/api';

const { Option } = Select;

interface User {
  user_id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  role_display_name: string;
  unit_id?: string;
  is_active: boolean;
  created_at: string;
}

interface Unit {
  unit_id: string;
  unit_name: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchUsers();
    // 直接使用硬編碼的單位列表，不呼叫 API
    setUnits([
      { unit_id: 'global_affairs', unit_name: '全球處' },
      { unit_id: 'registration', unit_name: '註冊組' },
      { unit_id: 'internship', unit_name: '實就組' },
      { unit_id: 'language_center', unit_name: '外語中心' },
      { unit_id: 'dormitory', unit_name: '宿輔組' },
      { unit_id: 'academic_affairs', unit_name: '課務組' },
      { unit_id: 'student_affairs', unit_name: '生輔組' },
      { unit_id: 'admission', unit_name: '招策中心' },
      { unit_id: 'department', unit_name: '各系所學程' },
      { unit_id: 'general_education', unit_name: '通識中心' },
    ]);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      message.error('載入使用者列表失敗');
    } finally {
      setLoading(false);
    }
  };



  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      unit_id: user.unit_id,
      is_active: user.is_active,
      password: '', // 清空密碼欄位
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await apiClient.delete(`/users/${userId}`);
      message.success('使用者刪除成功');
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '刪除使用者失敗');
    }
  };



  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // 更新使用者
        const updateData: any = {
          email: values.email,
          name: values.name,
          role: values.role,
          unit_id: values.unit_id,
          is_active: values.is_active,
        };

        // 如果有填寫密碼，則一併更新
        if (values.password && values.password.trim() !== '') {
          await apiClient.post(`/users/${editingUser.user_id}/reset-password`, {
            newPassword: values.password,
          });
        }

        await apiClient.put(`/users/${editingUser.user_id}`, updateData);
        message.success('使用者更新成功');
      } else {
        // 創建使用者
        await apiClient.post('/users', values);
        message.success('使用者創建成功');
      }

      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '操作失敗');
    }
  };



  const columns = [
    {
      title: '使用者名稱',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role_display_name',
      key: 'role',
      render: (text: string, record: User) => {
        const colorMap: Record<string, string> = {
          admin: 'red',
          unit_staff: 'blue',
          auditor: 'green',
        };
        return <Tag color={colorMap[record.role]}>{text}</Tag>;
      },
    },
    {
      title: '單位',
      dataIndex: 'unit_id',
      key: 'unit_id',
      render: (unitId: string) => {
        const unit = units.find((u) => u.unit_id === unitId);
        return unit ? unit.unit_name : '-';
      },
    },
    {
      title: '狀態',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? '啟用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          {record.user_id !== currentUser?.user_id && (
            <Popconfirm
              title="確定要刪除此使用者嗎？"
              onConfirm={() => handleDelete(record.user_id)}
              okText="確定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<DeleteOutlined />}
              >
                刪除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="人員管理"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          新增使用者
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={users}
        rowKey="user_id"
        loading={loading}
        pagination={{
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 筆`,
        }}
      />

      <Modal
        title={editingUser ? '編輯使用者' : '新增使用者'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="使用者名稱"
            rules={[
              { required: true, message: '請輸入使用者名稱' },
              { min: 3, message: '使用者名稱至少需要3個字元' },
            ]}
          >
            <Input disabled={!!editingUser} placeholder="請輸入使用者名稱" />
          </Form.Item>

          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '請輸入姓名' }]}
          >
            <Input placeholder="請輸入姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="電子郵件"
            rules={[
              { required: true, message: '請輸入電子郵件' },
              { type: 'email', message: '請輸入有效的電子郵件' },
            ]}
          >
            <Input placeholder="請輸入電子郵件" />
          </Form.Item>

          <Form.Item
            name="password"
            label={editingUser ? '密碼（留空表示不修改）' : '密碼'}
            rules={[
              { 
                required: !editingUser, 
                message: '請輸入密碼' 
              },
              { 
                min: 6, 
                message: '密碼至少需要6個字元' 
              },
            ]}
          >
            <Input.Password 
              placeholder={editingUser ? '留空表示不修改密碼' : '請輸入密碼'} 
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '請選擇角色' }]}
          >
            <Select placeholder="請選擇角色">
              <Option value="admin">系統管理員</Option>
              <Option value="unit_staff">單位職員</Option>
              <Option value="auditor">稽核人員</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.role !== currentValues.role
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('role') === 'unit_staff' ? (
                <Form.Item
                  name="unit_id"
                  label="所屬單位"
                  rules={[{ required: true, message: '請選擇所屬單位' }]}
                >
                  <Select placeholder="請選擇所屬單位">
                    {units.map((unit) => (
                      <Option key={unit.unit_id} value={unit.unit_id}>
                        {unit.unit_name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="is_active"
              label="狀態"
              rules={[{ required: true, message: '請選擇狀態' }]}
            >
              <Select>
                <Option value={true}>啟用</Option>
                <Option value={false}>停用</Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default UsersPage;
