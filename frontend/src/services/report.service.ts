import apiClient from './api';

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  averageCompletion: number;
  pendingDocuments: number;
  completedDocuments: number;
  documentsByType: Array<{
    typeName: string;
    count: number;
    completionRate: number;
  }>;
  recentActivities: Array<{
    id: string;
    action: string;
    studentName: string;
    documentType: string;
    timestamp: string;
  }>;
}

export interface AuditReport {
  id: string;
  studentId: string;
  studentName: string;
  action: string;
  documentType: string;
  userName: string;
  unitName: string;
  timestamp: string;
  description: string;
}

export interface AuditReportParams {
  startDate?: string;
  endDate?: string;
  unitId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

class ReportService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/reports/dashboard');
    return response.data.data;
  }

  async getAuditReport(params: AuditReportParams = {}): Promise<{
    records: AuditReport[];
    total: number;
  }> {
    const response = await apiClient.get<{ success: boolean; data: { records: AuditReport[]; total: number } }>('/reports/audit', { params });
    return response.data.data;
  }

  async exportAuditReport(params: AuditReportParams = {}): Promise<Blob> {
    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  async getTrackingRecords(params: any = {}): Promise<any> {
    const response = await apiClient.get<{ success: boolean; data: { records: any[]; total: number } }>('/tracking', { params });
    return response.data.data;
  }
}

export default new ReportService();
