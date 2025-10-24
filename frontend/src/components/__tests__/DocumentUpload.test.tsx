import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentUpload from '../Document/DocumentUpload';
import { useDocumentStore } from '../../stores';

vi.mock('../../stores', () => ({
  useDocumentStore: vi.fn(),
}));

describe('DocumentUpload', () => {
  const mockDocumentTypes = [
    { label: '畢業證書', value: 'type1' },
    { label: '成績單', value: 'type2' },
  ];

  it('renders upload form with required fields', () => {
    const mockUploadDocument = vi.fn();
    (useDocumentStore as any).mockReturnValue({
      uploadDocument: mockUploadDocument,
    });

    render(
      <DocumentUpload
        studentId="student1"
        documentTypes={mockDocumentTypes}
      />
    );

    expect(screen.getByText('上傳文件')).toBeInTheDocument();
    expect(screen.getByText('文件類型')).toBeInTheDocument();
    expect(screen.getByText('點擊或拖曳檔案到此區域上傳')).toBeInTheDocument();
  });

  it('validates file selection before upload', async () => {
    const mockUploadDocument = vi.fn();
    (useDocumentStore as any).mockReturnValue({
      uploadDocument: mockUploadDocument,
    });

    render(
      <DocumentUpload
        studentId="student1"
        documentTypes={mockDocumentTypes}
      />
    );

    const uploadButton = screen.getByRole('button', { name: /上傳/i });
    fireEvent.click(uploadButton);

    // Form validation should prevent submission without file
    expect(mockUploadDocument).not.toHaveBeenCalled();
  });
});
