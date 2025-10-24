import React from 'react';
import { Table, Tag, Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Student } from '../../services';

interface StudentListProps {
  students: Student[];
  loading?: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetails: (studentId: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onViewDetails,
}) => {
  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'green', text: '在學' },
      suspended: { color: 'orange', text: '休學' },
      graduated: { color: 'blue', text: '畢業' },
      withdrawn: { color: 'red', text: '退學' },
    };
    const statusInfo = statusMap[status] || { color: 'default', text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns: ColumnsType<Student> = [
    {
      title: '學號',
      dataIndex: 'student_id',
      key: 'student_id',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '國籍',
      dataIndex: 'nationality',
      key: 'nationality',
      width: 100,
    },
    {
      title: '就讀科系',
      dataIndex: 'program',
      key: 'program',
    },
    {
      title: '入學日期',
      dataIndex: 'enrollment_date',
      key: 'enrollment_date',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString('zh-TW') : '-',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewDetails(record.student_id)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={students}
      rowKey="student_id"
      loading={loading}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 筆資料`,
        onChange: onPageChange,
      }}
      scroll={{ x: 1000 }}
    />
  );
};

export default StudentList;
