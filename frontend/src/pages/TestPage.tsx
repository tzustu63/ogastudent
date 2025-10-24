import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const TestPage: React.FC = () => {
  return (
    <Card>
      <Title level={2}>測試頁面</Title>
      <p>如果你看到這個頁面，表示前端正常運行。</p>
      <p>當前時間：{new Date().toLocaleString('zh-TW')}</p>
    </Card>
  );
};

export default TestPage;