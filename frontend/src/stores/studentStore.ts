import { create } from 'zustand';
import studentService, {
  Student,
  StudentProfile,
  StudentListParams,
} from '../services/student.service';

interface StudentState {
  students: Student[];
  currentStudent: StudentProfile | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStudents: (params?: StudentListParams) => Promise<void>;
  fetchStudentProfile: (id: string) => Promise<void>;
  createStudent: (data: Partial<Student>) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  clearCurrentStudent: () => void;
  clearError: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  students: [],
  currentStudent: null,
  total: 0,
  page: 1,
  limit: 10,
  isLoading: false,
  error: null,

  fetchStudents: async (params: StudentListParams = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await studentService.getStudents(params);
      set({
        students: response.students,
        total: response.total,
        page: response.page,
        limit: response.limit,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '載入學生資料失敗',
        isLoading: false,
      });
    }
  },

  fetchStudentProfile: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await studentService.getStudentProfile(id);
      set({
        currentStudent: profile,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '載入學生檔案失敗',
        isLoading: false,
      });
    }
  },

  createStudent: async (data: Partial<Student>) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.createStudent(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '建立學生失敗',
        isLoading: false,
      });
      throw error;
    }
  },

  updateStudent: async (id: string, data: Partial<Student>) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.updateStudent(id, data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '更新學生失敗',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteStudent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await studentService.deleteStudent(id);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '刪除學生失敗',
        isLoading: false,
      });
      throw error;
    }
  },

  clearCurrentStudent: () => set({ currentStudent: null }),
  
  clearError: () => set({ error: null }),
}));
