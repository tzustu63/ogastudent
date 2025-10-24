import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Input, Select, Button, Space, DatePicker } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import reportService from '../../services/report.service';

const { RangePicker } = DatePicker;

interface TrackingRecord {
  id: string;
  studentName: string;
  action: string;
  documentType: string;
  userName: string;
  description: string;
  timestamp: string;
}

const TrackingRecords: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<TrackingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async (params: any = {}) => {
    setLoading(true);
    try {
      const response = await reportService.getTrackingRecords({
        ...params,
        page,
        limit: pageSize,
      });
      setData(response.records || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch tracking records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = (values: any) => {
    const params: any = {};
    
    if (values.search) {
      params.search = values.search;
    }
    
    if (values.action) {
      params.action = values.action;
    }
    
    if (values.dateRange) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD');
      params.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }

    setPage(1);
    fetchData(params);
  };

  const handleReset = () => {
    form.resetFields();
    setPage(1);
    fetchData();
  };

  const columns: ColumnsType<TrackingRecord> = [
    {
      title: '學生',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 100,
    },
    {
      title: '文件類型',
      dataIndex: 'documentType',
      key: 'documentType',
      width: 150,
    },
    {
      title: '操作者',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString('zh-TW'),
    },
  ];

  return (
    <Card title="追蹤記錄查詢">
      <Form form={form} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="search">
          <Input placeholder="搜尋學生或操作者" style={{ width: 200 }} />
        </Form.Item>

        <Form.Item name="action">
          <Select
            placeholder="操作類型"
            allowClear
            style={{ width: 150 }}
            options={[
              { label: '上傳', value: 'upload' },
              { label: '更新', value: 'update' },
              { label: '刪除', value: 'delete' },
              { label: '審核', value: 'review' },
              { label: '查看', value: 'view' },
            ]}
          />
        </Form.Item>

        <Form.Item name="dateRange">
          <RangePicker placeholder={['開始日期', '結束日期']} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查詢
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 筆記錄`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        scroll={{ x: 1000 }}
      />
    </Card>
  );
};

export default TrackingRecords;
