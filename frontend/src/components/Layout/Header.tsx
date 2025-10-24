import React from 'react';
import { Layout, Typography, Space } from 'antd';
import UserInfo from '../UserInfo';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        padding: '0 32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <Space>
        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
          外國學生受教權查核系統
        </Title>
      </Space>
      <UserInfo />
    </AntHeader>
  );
};

export default Header;
