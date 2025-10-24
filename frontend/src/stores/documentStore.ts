import { create } from 'zustand';
import documentService, {
  DocumentType,
  UploadDocumentData,
  AddWebLinkData,
} from '../services/document.service';

interface DocumentState {
  documentTypes: DocumentType[];
  isLoading: boolean;
  uploadProgress: number;
  error: string | null;
  
  // Actions
  fetchDocumentTypes: () => Promise<void>;
  uploadDocument: (file: File, data: UploadDocumentData) => Promise<void>;
  addWebLink: (data: AddWebLinkData) => Promise<void>;
  setUploadProgress: (progress: number) => void;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documentTypes: [],
  isLoading: false,
  uploadProgress: 0,
  error: null,

  fetchDocumentTypes: async () => {
    set({ isLoading: true, error: null });
    try {
      const types = await documentService.getDocumentTypes();
      set({
        documentTypes: types,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '載入文件類型失敗',
        isLoading: false,
      });
    }
  },

  uploadDocument: async (file: File, data: UploadDocumentData) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      await documentService.uploadDocument(file, data);
      set({
        isLoading: false,
        uploadProgress: 100,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '上傳文件失敗',
        isLoading: false,
        uploadProgress: 0,
      });
      throw error;
    }
  },

  addWebLink: async (data: AddWebLinkData) => {
    set({ isLoading: true, error: null });
    try {
      await documentService.addWebLink(data);
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || '新增網頁連結失敗',
        isLoading: false,
      });
      throw error;
    }
  },

  setUploadProgress: (progress: number) => set({ uploadProgress: progress }),
  
  clearError: () => set({ error: null }),
}));
