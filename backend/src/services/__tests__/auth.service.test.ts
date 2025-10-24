import authService from '../auth.service';
import { User, UserRole } from '../../models/user';

describe('AuthService', () => {
  const mockUserData = {
    user_id: 'test-user-1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
    unit_id: 'unit-1',
    role: UserRole.UNIT_STAFF,
    is_active: true
  };
  
  const mockUser: any = new User(mockUserData);

  describe('Token Generation', () => {
    it('should generate access token', () => {
      const token = authService.generateAccessToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT格式: header.payload.signature
    });

    it('should generate refresh token', () => {
      const token = authService.generateRefreshToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate token pair', () => {
      const tokens = authService.generateTokenPair(mockUser);
      
      expect(tokens).toHaveProperty('access_token');
      expect(tokens).toHaveProperty('refresh_token');
      expect(tokens).toHaveProperty('expires_in');
      expect(typeof tokens.expires_in).toBe('number');
    });
  });

  describe('Token Verification', () => {
    it('should verify valid token', () => {
      const token = authService.generateAccessToken(mockUser);
      const payload = authService.verifyToken(token);
      
      expect(payload).toBeDefined();
      expect(payload.user_id).toBe(mockUser.user_id);
      expect(payload.username).toBe(mockUser.username);
      expect(payload.role).toBe(mockUser.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow();
    });

    it('should decode token without verification', () => {
      const token = authService.generateAccessToken(mockUser);
      const payload = authService.decodeToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.user_id).toBe(mockUser.user_id);
    });
  });

  describe('Password Hashing', () => {
    it('should hash password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword('wrongPassword', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh access token from valid refresh token', () => {
      const refreshToken = authService.generateRefreshToken(mockUser);
      const newAccessToken = authService.refreshAccessToken(refreshToken);
      
      expect(newAccessToken).toBeDefined();
      expect(typeof newAccessToken).toBe('string');
      
      const payload = authService.verifyToken(newAccessToken);
      expect(payload.user_id).toBe(mockUser.user_id);
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        authService.refreshAccessToken('invalid-token');
      }).toThrow();
    });
  });
});
