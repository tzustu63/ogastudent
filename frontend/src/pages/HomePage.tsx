import React from 'react';
import { Card, Typography, Space } from 'antd';
import { useAuthStore } from '../stores';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Title level={2}>歡迎使用外國學生受教權查核系統</Title>
        <Paragraph>
          您好，{user?.name}！您目前的角色是：{user?.role}
        </Paragraph>
      </Card>

      <Card title="系統功能">
        <Space direction="vertical">
          <Paragraph>
            <strong>學生管理：</strong>查看和管理外國學生資料
          </Paragraph>
          <Paragraph>
            <strong>文件管理：</strong>上傳和管理學生相關文件
          </Paragraph>
          <Paragraph>
            <strong>報表統計：</strong>查看系統統計和稽核報表
          </Paragraph>
          <Paragraph>
            <strong>通知系統：</strong>接收系統通知和提醒
          </Paragraph>
        </Space>
      </Card>
    </Space>
  );
};

export default HomePage;
