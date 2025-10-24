import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, DatePicker, Select, Space, message } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import reportService, { AuditReport, AuditReportParams } from '../../services/report.service';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const AuditReportView: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<AuditReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async (params: AuditReportParams = {}) => {
    setLoading(true);
    try {
      const response = await reportService.getAuditReport({
        ...params,
        page,
        limit: pageSize,
      });
      setData(response.records);
      setTotal(response.total);
    } catch (error) {
      message.error('載入稽核報表失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = (values: any) => {
    const params: AuditReportParams = {};
    
    if (values.dateRange) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD');
      params.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }
    
    if (values.action) {
      params.action = values.action;
    }

    setPage(1);
    fetchData(params);
  };

  const handleExport = async () => {
    try {
      const values = form.getFieldsValue();
      const params: AuditReportParams = {};
      
      if (values.dateRange) {
        params.startDate = values.dateRange[0].format('YYYY-MM-DD');
        params.endDate = values.dateRange[1].format('YYYY-MM-DD');
      }

      const blob = await reportService.exportAuditReport(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-report-${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('報表匯出成功');
    } catch (error) {
      message.error('報表匯出失敗');
    }
  };

  const columns: ColumnsType<AuditReport> = [
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
      title: '單位',
      dataIndex: 'unitName',
      key: 'unitName',
      width: 120,
    },
    {
      title: '時間',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString('zh-TW'),
    },
    {
      title: '說明',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  return (
    <Card title="稽核報表">
      <Form form={form} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="dateRange">
          <RangePicker placeholder={['開始日期', '結束日期']} />
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
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查詢
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              匯出
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
        scroll={{ x: 1200 }}
      />
    </Card>
  );
};

export default AuditReportView;
