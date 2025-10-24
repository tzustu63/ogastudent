import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { useAuthStore } from '../../stores';

vi.mock('../../stores', () => ({
  useAuthStore: vi.fn(),
}));

describe('ProtectedRoute', () => {
  it('redirects to login when not authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      loadStoredAuth: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: { id: '1', name: 'Test User', role: 'admin' },
      isLoading: false,
      loadStoredAuth: vi.fn(),
    });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
