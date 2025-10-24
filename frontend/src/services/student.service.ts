import apiClient from './api';

export interface Student {
  student_id: string;
  name: string;
  email?: string;
  nationality?: string;
  program?: string;
  enrollment_date?: string;
  expected_graduation_date?: string;
  status: string;
  status_display_name?: string;
  passport_number?: string;
  phone?: string;
  emergency_contact?: any;
  enrollment_duration_months?: number;
  is_near_graduation?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentDocument {
  document_id: string;
  student_id: string;
  type_id: string;
  typeName: string;
  content_type: 'file' | 'web_url';
  file_path?: string;
  file_name?: string;
  web_url?: string;
  remarks?: string;
  status: string;
  uploaded_at: string;
  uploader: {
    user_id: string;
    name: string;
    unitName: string;
  };
}

export interface StudentProfile {
  student: Student;
  documents: StudentDocument[];
  completion: {
    total_required: number;
    completed: number;
    completion_rate: number;
    missing_document_types: string[];
  };
  summary: {
    total_documents: number;
    approved_documents: number;
    pending_documents: number;
    rejected_documents: number;
    under_review_documents: number;
  };
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  nationality?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
}

class StudentService {
  async getStudents(params: StudentListParams = {}): Promise<StudentListResponse> {
    const response = await apiClient.get<{ success: boolean; data: Student[]; pagination: any }>('/students', { params });
    return {
      students: response.data.data,
      total: response.data.pagination.total,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
    };
  }

  async getStudentById(id: string): Promise<Student> {
    const response = await apiClient.get<Student>(`/students/${id}`);
    return response.data;
  }

  async getStudentProfile(id: string): Promise<StudentProfile> {
    const response = await apiClient.get<{ success: boolean; data: StudentProfile }>(`/students/${id}/profile`);
    return response.data.data;
  }

  async getStudentDocuments(id: string): Promise<StudentDocument[]> {
    const response = await apiClient.get<StudentDocument[]>(`/students/${id}/documents`);
    return response.data;
  }

  async getStudentCompletion(id: string): Promise<{ completionRate: number; completed: number; total: number }> {
    const response = await apiClient.get(`/students/${id}/completion`);
    return response.data;
  }

  async createStudent(data: Partial<Student>): Promise<Student> {
    const response = await apiClient.post<{ success: boolean; data: Student; message: string }>('/students', data);
    return response.data.data;
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    const response = await apiClient.put<Student>(`/students/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: string): Promise<void> {
    await apiClient.delete(`/students/${id}`);
  }
}

export default new StudentService();
