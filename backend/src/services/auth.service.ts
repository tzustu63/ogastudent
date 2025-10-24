import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole } from '../types';

export interface JwtPayload {
  user_id: string;
  username: string;
  email: string;
  role: UserRole;
  unit_id: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.refreshTokenExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * 產生JWT access token
   */
  generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      unit_id: user.unit_id
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpiresIn as any });
  }

  /**
   * 產生JWT refresh token
   */
  generateRefreshToken(user: User): string {
    const payload: JwtPayload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      unit_id: user.unit_id
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.refreshTokenExpiresIn as any });
  }

  /**
   * 產生token pair (access + refresh)
   */
  generateTokenPair(user: User): TokenPair {
    const access_token = this.generateAccessToken(user);
    const refresh_token = this.generateRefreshToken(user);

    return {
      access_token,
      refresh_token,
      expires_in: this.parseExpiresIn(this.jwtExpiresIn)
    };
  }

  /**
   * 驗證JWT token
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('INVALID_TOKEN');
      }
      throw new Error('TOKEN_VERIFICATION_FAILED');
    }
  }

  /**
   * 解碼token (不驗證)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 雜湊密碼
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 驗證密碼
   */
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * 從refresh token產生新的access token
   */
  refreshAccessToken(refreshToken: string): string {
    const payload = this.verifyToken(refreshToken);
    
    // 建立新的access token
    const newPayload: JwtPayload = {
      user_id: payload.user_id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      unit_id: payload.unit_id
    };

    return jwt.sign(newPayload, this.jwtSecret, { expiresIn: this.jwtExpiresIn as any });
  }

  /**
   * 解析expires_in字串為秒數
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // 預設24小時

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400;
    }
  }
}

export default new AuthService();
