import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter style={{ textAlign: 'center', padding: '16px 50px' }}>
      <Text type="secondary">
        外國學生受教權查核系統 © {new Date().getFullYear()}
      </Text>
    </AntFooter>
  );
};

export default Footer;
