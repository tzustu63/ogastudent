import { Pool } from 'pg';
import { UserRepository, UserFilter } from '../user-repository';
import { User, UserRole } from '../../models/user';

// Mock the pg Pool
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

describe('UserRepository', () => {
  let mockPool: jest.Mocked<Pool>;
  let userRepository: UserRepository;

  beforeEach(() => {
    mockPool = new Pool() as jest.Mocked<Pool>;
    userRepository = new UserRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUsername', () => {
    it('should return user when found by username', async () => {
      const mockRow = {
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        role: UserRole.UNIT_STAFF,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValue({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await userRepository.findByUsername('testuser');

      expect(result).toBeInstanceOf(User);
      expect(result?.username).toBe('testuser');
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = $1',
        ['testuser']
      );
    });

    it('should return null when user not found by username', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await userRepository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(userRepository.findByUsername('testuser')).rejects.toThrow('根據使用者名稱查詢失敗');
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      const mockRow = {
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        role: UserRole.UNIT_STAFF,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      mockPool.query.mockResolvedValue({
        rows: [mockRow],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@example.com');
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
    });
  });

  describe('findByUnit', () => {
    it('should return paginated users by unit', async () => {
      const mockRows = [
        {
          user_id: 'user1',
          username: 'user1',
          name: '使用者1',
          unit_id: 'test_unit',
          role: UserRole.UNIT_STAFF,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          user_id: 'user2',
          username: 'user2',
          name: '使用者2',
          unit_id: 'test_unit',
          role: UserRole.UNIT_STAFF,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '2' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 2,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await userRepository.findByUnit('test_unit', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(User);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.currentPage).toBe(1);
    });
  });

  describe('findByRole', () => {
    it('should return paginated users by role', async () => {
      const mockRows = [
        {
          user_id: 'admin1',
          username: 'admin1',
          name: '管理員1',
          role: UserRole.ADMIN,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await userRepository.findByRole(UserRole.ADMIN);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].role).toBe(UserRole.ADMIN);
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered users with search term', async () => {
      const filters: UserFilter = {
        unit_id: 'test_unit',
        role: UserRole.UNIT_STAFF,
        is_active: true,
        search: '測試'
      };

      const mockRows = [
        {
          user_id: 'user1',
          username: 'testuser',
          name: '測試使用者',
          unit_id: 'test_unit',
          role: UserRole.UNIT_STAFF,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      mockPool.query
        .mockResolvedValueOnce({
          rows: [{ count: '1' }],
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        })
        .mockResolvedValueOnce({
          rows: mockRows,
          rowCount: 1,
          command: 'SELECT',
          oid: 0,
          fields: []
        });

      const result = await userRepository.findWithFilters(filters);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('測試使用者');
    });
  });

  describe('isUsernameExists', () => {
    it('should return true when username exists', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ exists: true }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await userRepository.isUsernameExists('testuser');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE username = $1 LIMIT 1',
        ['testuser']
      );
    });

    it('should return false when username does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await userRepository.isUsernameExists('nonexistent');

      expect(result).toBe(false);
    });

    it('should exclude specific user when checking username existence', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      await userRepository.isUsernameExists('testuser', 'exclude_user');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT 1 FROM users WHERE username = $1 AND user_id != $2 LIMIT 1',
        ['testuser', 'exclude_user']
      );
    });
  });

  describe('isEmailExists', () => {
    it('should return true when email exists', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ exists: true }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await userRepository.isEmailExists('test@example.com');

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await userRepository.isEmailExists('nonexistent@example.com');

      expect(result).toBe(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time successfully', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await userRepository.updateLastLogin('test_user');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET last_login = CURRENT_TIMESTAMP'),
        ['test_user']
      );
    });

    it('should return false when user not found', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await userRepository.updateLastLogin('nonexistent_user');

      expect(result).toBe(false);
    });
  });

  describe('enable/disable', () => {
    it('should enable user successfully', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await userRepository.enable('test_user');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET is_active = true'),
        ['test_user']
      );
    });

    it('should disable user successfully', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await userRepository.disable('test_user');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET is_active = false'),
        ['test_user']
      );
    });
  });

  describe('changeRole', () => {
    it('should change user role successfully', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await userRepository.changeRole('test_user', UserRole.ADMIN, 'new_unit');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET role = $1, unit_id = $2'),
        [UserRole.ADMIN, 'new_unit', 'test_user']
      );
    });

    it('should change role without unit', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 1,
        command: 'UPDATE',
        oid: 0,
        fields: []
      });

      const result = await userRepository.changeRole('test_user', UserRole.ADMIN);

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SET role = $1, unit_id = $2'),
        [UserRole.ADMIN, null, 'test_user']
      );
    });
  });

  describe('getUserStats', () => {
    it('should return comprehensive user statistics', async () => {
      const mockResults = [
        // Total and active users
        { rows: [{ total_users: '50', active_users: '45' }] },
        // Users by role
        { rows: [{ role: 'admin', count: '5' }, { role: 'unit_staff', count: '40' }] },
        // Users by unit
        { rows: [{ unit_id: 'unit1', unit_name: '單位1', count: '20' }, { unit_id: 'unit2', unit_name: '單位2', count: '25' }] }
      ];

      mockPool.query
        .mockResolvedValueOnce(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any)
        .mockResolvedValueOnce(mockResults[2] as any);

      const result = await userRepository.getUserStats();

      expect(result.total_users).toBe(50);
      expect(result.active_users).toBe(45);
      expect(result.users_by_role).toHaveLength(2);
      expect(result.users_by_unit).toHaveLength(2);
    });
  });
});