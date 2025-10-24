import React from "react";
import { Card, Progress, Space, Typography, Row, Col, Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface CompletionProgressProps {
  completionRate: number;
  completed?: number;
  total?: number;
  title?: string;
}

const CompletionProgress: React.FC<CompletionProgressProps> = ({
  completionRate,
  completed = 0,
  total = 18,
  title = "資料完成度",
}) => {
  const getProgressStatus = (rate: number) => {
    if (rate === 100) return "success";
    if (rate >= 70) return "normal";
    if (rate >= 40) return "active";
    return "exception";
  };

  return (
    <Card>
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Title level={5}>{title}</Title>

        <Progress
          percent={completionRate}
          status={getProgressStatus(completionRate)}
          size={20}
          format={(percent) => `${percent}%`}
        />

        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="已完成"
              value={completed}
              suffix={`/ ${total}`}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="待完成"
              value={total - completed}
              prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
            />
          </Col>
        </Row>

        {completionRate < 100 && (
          <Text type="secondary">還有 {total - completed} 項資料待上傳</Text>
        )}
      </Space>
    </Card>
  );
};

export default CompletionProgress;
