import React, { useEffect, useState } from 'react';
import { Space, Button, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { StudentSearch, StudentList } from '../components/Student';
import { useStudentStore } from '../stores';

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { students, total, page, limit, isLoading, fetchStudents } = useStudentStore();
  const [searchParams, setSearchParams] = useState({});

  useEffect(() => {
    fetchStudents({ page, limit, ...searchParams });
  }, [page, limit]);

  const handleSearch = (values: any) => {
    setSearchParams(values);
    fetchStudents({ page: 1, limit, ...values });
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    fetchStudents({ page: newPage, limit: newPageSize, ...searchParams });
  };

  const handleViewDetails = (studentId: string) => {
    navigate(`/students/${studentId}`);
  };

  const handleCreateStudent = () => {
    navigate('/students/create');
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <h2>學生管理</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateStudent}
          >
            新增學生
          </Button>
        </Col>
      </Row>
      
      <StudentSearch onSearch={handleSearch} loading={isLoading} />
      <StudentList
        students={students}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={limit}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
      />
    </Space>
  );
};

export default StudentsPage;
