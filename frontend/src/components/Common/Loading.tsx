import React from 'react';
import { Spin } from 'antd';

interface LoadingProps {
  tip?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ tip = '載入中...', fullScreen = false }) => {
  const style = fullScreen
    ? {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px',
      };

  return (
    <div style={style}>
      <Spin size="large" tip={tip}>
        <div style={{ minHeight: 100 }} />
      </Spin>
    </div>
  );
};

export default Loading;
