import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, List } from 'antd';
import {
  UserOutlined,
  FileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import reportService, { DashboardStats } from '../../services/report.service';
import { Loading, ErrorDisplay } from '../Common';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('載入統計資料失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchStats} />;
  if (!stats) return null;

  // 暫時使用列表顯示文件統計，之後可以加回圖表
  const documentTypesList = stats.documentsByType.map((item, index) => ({
    key: index,
    title: item.typeName,
    description: `${item.count} 個文件`,
  }));

  const activityColumns = [
    {
      title: '學生',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '文件類型',
      dataIndex: 'documentType',
      key: 'documentType',
    },
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (time: string) => new Date(time).toLocaleString('zh-TW'),
    },
  ];

  return (
    <div>
      <Title level={3}>進度監控儀表板</Title>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="學生總數"
              value={stats.totalStudents}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="在學學生"
              value={stats.activeStudents}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="平均完成度"
              value={stats.averageCompletion}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待處理文件"
              value={stats.pendingDocuments}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="各類型文件統計">
            <List
              dataSource={documentTypesList}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileOutlined />}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近活動">
            <Table
              columns={activityColumns}
              dataSource={stats.recentActivities}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
