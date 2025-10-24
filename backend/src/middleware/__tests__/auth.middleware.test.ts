import { Request, Response, NextFunction } from 'express';
import { authenticate, requireRole, requireUnit } from '../auth.middleware';
import authService from '../../services/auth.service';
import { User, UserRole } from '../../models/user';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should reject request without authorization header', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NO_TOKEN'
          })
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      };
      
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should accept request with valid token', () => {
      const mockUserData = {
        user_id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        name: 'Test User',
        unit_id: 'unit-1',
        role: UserRole.UNIT_STAFF
      };
      
      const mockUser: any = new User(mockUserData);
      const token = authService.generateAccessToken(mockUser);
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };
      
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.user_id).toBe('test-user-1');
    });

    it('should reject request with invalid token', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };
      
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      mockRequest.user = {
        user_id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.ADMIN,
        unit_id: 'unit-1'
      };
      
      const middleware = requireRole(UserRole.ADMIN);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject user without authentication', () => {
      const middleware = requireRole(UserRole.ADMIN);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject user with incorrect role', () => {
      mockRequest.user = {
        user_id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.STUDENT,
        unit_id: 'unit-1'
      };
      
      const middleware = requireRole(UserRole.ADMIN);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should allow user with any of multiple allowed roles', () => {
      mockRequest.user = {
        user_id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.AUDITOR,
        unit_id: 'unit-1'
      };
      
      const middleware = requireRole(UserRole.ADMIN, UserRole.AUDITOR);
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('requireUnit', () => {
    it('should allow user from correct unit', () => {
      mockRequest.user = {
        user_id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.UNIT_STAFF,
        unit_id: 'unit-1'
      };
      
      const middleware = requireUnit('unit-1');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject user from different unit', () => {
      mockRequest.user = {
        user_id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.UNIT_STAFF,
        unit_id: 'unit-2'
      };
      
      const middleware = requireUnit('unit-1');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should allow user from any of multiple allowed units', () => {
      mockRequest.user = {
        user_id: 'test-user-1',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.UNIT_STAFF,
        unit_id: 'unit-2'
      };
      
      const middleware = requireUnit('unit-1', 'unit-2', 'unit-3');
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
