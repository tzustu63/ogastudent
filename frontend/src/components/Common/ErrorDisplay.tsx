import React from 'react';
import { Result, Button } from 'antd';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = '發生錯誤',
  message = '無法載入資料，請稍後再試',
  onRetry,
}) => {
  return (
    <Result
      status="error"
      title={title}
      subTitle={message}
      extra={
        onRetry && (
          <Button type="primary" onClick={onRetry}>
            重試
          </Button>
        )
      }
    />
  );
};

export default ErrorDisplay;
