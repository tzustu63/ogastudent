import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../models/user';
import { UserRepository } from '../repositories/user-repository';
import { PaginationOptions, PaginatedResult } from '../repositories/base-repository';

export interface CreateUserParams {
  username: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  unit_id?: string;
}

export interface UpdateUserParams {
  email?: string;
  name?: string;
  role?: UserRole;
  unit_id?: string;
  is_active?: boolean;
}

export class UserService {
  private userRepository: UserRepository;

  constructor(pool: Pool) {
    this.userRepository = new UserRepository(pool);
  }

  /**
   * 取得使用者列表
   */
  async getUsers(options: PaginationOptions & { role?: string; unit_id?: string }): Promise<PaginatedResult<User>> {
    const filters: any = {};
    
    if (options.role) {
      filters.role = options.role;
    }
    
    if (options.unit_id) {
      filters.unit_id = options.unit_id;
    }

    return await this.userRepository.findWithFilters(filters, options);
  }

  /**
   * 根據 ID 取得使用者
   */
  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  /**
   * 根據使用者名稱取得使用者
   */
  async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  /**
   * 創建新使用者
   */
  async createUser(params: CreateUserParams): Promise<User> {
    const { username, email, name, password, role, unit_id } = params;

    // 檢查使用者名稱是否已存在
    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new Error('使用者名稱已存在');
    }

    // 檢查電子郵件是否已存在
    const existingEmail = await this.userRepository.findByEmail(email);
    if (existingEmail) {
      throw new Error('電子郵件已被使用');
    }

    // 創建使用者物件
    const user = new User({
      user_id: uuidv4(),
      username,
      email,
      name,
      role,
      unit_id,
      is_active: true
    });

    // 設定密碼
    await user.setPassword(password);

    // 驗證使用者資料
    const validation = user.validateUser();
    if (!validation.isValid) {
      throw new Error(`使用者資料驗證失敗: ${validation.errors.join(', ')}`);
    }

    // 儲存到資料庫
    return await this.userRepository.create(user);
  }

  /**
   * 更新使用者
   */
  async updateUser(userId: string, params: UpdateUserParams): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    // 更新基本資訊
    if (params.email !== undefined || params.name !== undefined || params.unit_id !== undefined) {
      user.updateInfo({
        email: params.email,
        name: params.name,
        unit_id: params.unit_id
      });
    }

    // 更新角色
    if (params.role !== undefined) {
      user.changeRole(params.role, params.unit_id);
    }

    // 更新啟用狀態
    if (params.is_active !== undefined) {
      if (params.is_active) {
        user.enable();
      } else {
        user.disable();
      }
    }

    // 驗證使用者資料
    const validation = user.validateUser();
    if (!validation.isValid) {
      throw new Error(`使用者資料驗證失敗: ${validation.errors.join(', ')}`);
    }

    return await this.userRepository.update(userId, user);
  }

  /**
   * 刪除使用者
   */
  async deleteUser(userId: string): Promise<boolean> {
    return await this.userRepository.delete(userId);
  }

  /**
   * 重設密碼
   */
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('使用者不存在');
    }

    await user.setPassword(newPassword);
    await this.userRepository.update(userId, user);
  }

  /**
   * 啟用使用者
   */
  async enableUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    user.enable();
    return await this.userRepository.update(userId, user);
  }

  /**
   * 停用使用者
   */
  async disableUser(userId: string): Promise<User | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    user.disable();
    return await this.userRepository.update(userId, user);
  }
}
