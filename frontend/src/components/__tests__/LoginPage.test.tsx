import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { useAuthStore } from '../../stores';

vi.mock('../../stores', () => ({
  useAuthStore: vi.fn(),
}));

describe('LoginPage', () => {
  it('renders login form with username and password fields', () => {
    const mockLogin = vi.fn();
    (useAuthStore as any).mockReturnValue({ login: mockLogin });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('使用者名稱')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密碼')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登入/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const mockLogin = vi.fn();
    (useAuthStore as any).mockReturnValue({ login: mockLogin });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /登入/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('請輸入使用者名稱')).toBeInTheDocument();
      expect(screen.getByText('請輸入密碼')).toBeInTheDocument();
    });
  });
});
