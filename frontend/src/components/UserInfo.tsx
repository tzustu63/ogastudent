import React from 'react';
import { Dropdown, Avatar, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../stores';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const UserInfo: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const items: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '設定',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: handleLogout,
    },
  ];

  if (!user) return null;

  return (
    <Dropdown menu={{ items }} placement="bottomRight" trigger={['click']}>
      <Space 
        style={{ 
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '8px',
          transition: 'background-color 0.3s',
        }}
        className="user-info-trigger"
        size="middle"
      >
        <Avatar icon={<UserOutlined />} size="default" />
        <Space direction="vertical" size={0} style={{ minWidth: '100px', lineHeight: '1.2' }}>
          <Text strong style={{ fontSize: '14px', display: 'block' }}>
            {user.name}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
            {user.role}
          </Text>
        </Space>
      </Space>
    </Dropdown>
  );
};

export default UserInfo;
