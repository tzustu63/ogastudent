import apiClient from './api';

export interface DocumentType {
  id: string;
  typeName: string;
  typeNameEn: string;
  responsibleUnitId: string;
  responsibleUnitName: string;
  isRequired: boolean;
  validationRules?: string;
}

export interface UploadDocumentData {
  studentId: string;
  typeId: string;
  remarks?: string;
}

export interface AddWebLinkData {
  studentId: string;
  typeId: string;
  webUrl: string;
  remarks?: string;
}

export interface UpdateDocumentStatusData {
  status: string;
  remarks?: string;
}

class DocumentService {
  async getDocumentTypes(): Promise<DocumentType[]> {
    const response = await apiClient.get<{ success: boolean; data: DocumentType[] }>('/documents/types');
    return response.data.data;
  }

  async uploadDocument(file: File, data: UploadDocumentData): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('student_id', data.studentId);
    formData.append('type_id', data.typeId);
    if (data.remarks) {
      formData.append('remarks', data.remarks);
    }

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async addWebLink(data: AddWebLinkData): Promise<any> {
    const linkData = {
      student_id: data.studentId,
      type_id: data.typeId,
      web_url: data.webUrl,
      remarks: data.remarks
    };
    const response = await apiClient.post('/documents/link', linkData);
    return response.data;
  }

  async getDocumentById(id: string): Promise<any> {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  }

  async downloadDocument(id: string): Promise<{ blob: Blob; filename: string }> {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    
    // 從 Content-Disposition header 取得檔名
    let filename = `document_${id}`;
    const contentDisposition = response.headers['content-disposition'];
    
    if (contentDisposition) {
      // 優先嘗試從 filename*=UTF-8'' 格式取得檔名（RFC 5987，支援中文）
      const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
      if (filenameStarMatch && filenameStarMatch[1]) {
        try {
          // 解碼 URL 編碼的檔名
          filename = decodeURIComponent(filenameStarMatch[1].trim());
        } catch (error) {
          console.error('解碼檔名失敗:', error);
        }
      } else {
        // 備用：從 filename= 格式取得檔名
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
    }
    
    return { blob: response.data, filename };
  }

  async updateDocumentStatus(documentId: string, data: UpdateDocumentStatusData): Promise<any> {
    const response = await apiClient.put(`/documents/${documentId}/status`, data);
    return response.data;
  }

  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`);
  }
}

export default new DocumentService();
