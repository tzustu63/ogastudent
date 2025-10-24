import React from 'react';
import { Card, Descriptions, Tag } from 'antd';
import type { Student } from '../../services';

interface StudentProfileProps {
  student: Student;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student }) => {
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

  return (
    <Card title="學生基本資料">
      <Descriptions bordered column={2}>
        <Descriptions.Item label="學號">{student.student_id}</Descriptions.Item>
        <Descriptions.Item label="姓名">{student.name}</Descriptions.Item>
        <Descriptions.Item label="電子郵件">{student.email}</Descriptions.Item>
        <Descriptions.Item label="國籍">{student.nationality}</Descriptions.Item>
        <Descriptions.Item label="就讀科系" span={2}>
          {student.program}
        </Descriptions.Item>
        <Descriptions.Item label="入學日期">
          {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString('zh-TW') : '未設定'}
        </Descriptions.Item>
        <Descriptions.Item label="狀態">
          {getStatusTag(student.status)}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default StudentProfile;
