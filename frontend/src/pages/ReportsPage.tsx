import React from 'react';
import { Tabs } from 'antd';
import { Dashboard, AuditReport, TrackingRecords } from '../components/Report';

const ReportsPage: React.FC = () => {
  const items = [
    {
      key: 'dashboard',
      label: '儀表板',
      children: <Dashboard />,
    },
    {
      key: 'audit',
      label: '稽核報表',
      children: <AuditReport />,
    },
    {
      key: 'tracking',
      label: '追蹤記錄',
      children: <TrackingRecords />,
    },
  ];

  return <Tabs items={items} />;
};

export default ReportsPage;
