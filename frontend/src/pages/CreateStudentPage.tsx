import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { StudentForm, type StudentFormData } from '../components/Student';
import { useStudentStore } from '../stores';

const CreateStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const { createStudent, isLoading } = useStudentStore();

  const handleSubmit = async (data: StudentFormData) => {
    try {
      await createStudent(data);
      navigate('/students');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const handleBack = () => {
    navigate('/students');
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
      >
        返回學生列表
      </Button>
      
      <StudentForm
        onSubmit={handleSubmit}
        loading={isLoading}
      />
    </Space>
  );
};

export default CreateStudentPage;