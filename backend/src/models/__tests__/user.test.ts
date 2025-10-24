import { User, UserRole } from '../user';

describe('User Model', () => {
  describe('constructor', () => {
    it('should create a user with default values', () => {
      const user = new User();
      
      expect(user.role).toBe(UserRole.STUDENT);
      expect(user.is_active).toBe(true);
    });

    it('should create a user with provided data', () => {
      const userData = {
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        unit_id: 'test_unit',
        role: UserRole.UNIT_STAFF,
        is_active: false
      };

      const user = new User(userData);
      
      expect(user.user_id).toBe('test_user');
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('測試使用者');
      expect(user.unit_id).toBe('test_unit');
      expect(user.role).toBe(UserRole.UNIT_STAFF);
      expect(user.is_active).toBe(false);
    });
  });

  describe('validateUser', () => {
    it('should validate a valid user', () => {
      const user = new User({
        user_id: 'valid_user',
        username: 'validuser',
        email: 'valid@example.com',
        name: '有效使用者'
      });

      const result = user.validateUser();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject user with invalid username format', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'invalid-user!',
        email: 'test@example.com',
        name: '測試使用者'
      });

      const result = user.validateUser();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('使用者名稱只能包含英文字母、數字、底線和點');
    });

    it('should reject user with invalid email format', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'invalid-email',
        name: '測試使用者'
      });

      const result = user.validateUser();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('電子郵件格式不正確');
    });

    it('should reject unit staff without unit_id', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        role: UserRole.UNIT_STAFF
      });

      const result = user.validateUser();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('單位職員必須指定所屬單位');
    });
  });

  describe('password management', () => {
    it('should set password hash', async () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者'
      });

      await user.setPassword('testpassword123');
      
      expect(user.password_hash).toBeDefined();
      expect(user.password_hash).not.toBe('testpassword123');
    });

    it('should verify correct password', async () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者'
      });

      await user.setPassword('testpassword123');
      const isValid = await user.verifyPassword('testpassword123');
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者'
      });

      await user.setPassword('testpassword123');
      const isValid = await user.verifyPassword('wrongpassword');
      
      expect(isValid).toBe(false);
    });

    it('should reject short password', async () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者'
      });

      await expect(user.setPassword('123')).rejects.toThrow('密碼長度至少需要6個字元');
    });
  });

  describe('role methods', () => {
    it('should check user roles correctly', () => {
      const adminUser = new User({ role: UserRole.ADMIN });
      const unitStaffUser = new User({ role: UserRole.UNIT_STAFF });
      const auditorUser = new User({ role: UserRole.AUDITOR });
      const studentUser = new User({ role: UserRole.STUDENT });

      expect(adminUser.isAdmin()).toBe(true);
      expect(adminUser.isUnitStaff()).toBe(false);
      
      expect(unitStaffUser.isUnitStaff()).toBe(true);
      expect(unitStaffUser.isAdmin()).toBe(false);
      
      expect(auditorUser.isAuditor()).toBe(true);
      expect(auditorUser.isStudent()).toBe(false);
      
      expect(studentUser.isStudent()).toBe(true);
      expect(studentUser.isAuditor()).toBe(false);
    });

    it('should check unit access permissions', () => {
      const adminUser = new User({ role: UserRole.ADMIN });
      const auditorUser = new User({ role: UserRole.AUDITOR });
      const unitStaffUser = new User({ role: UserRole.UNIT_STAFF, unit_id: 'unit1' });
      const studentUser = new User({ role: UserRole.STUDENT });

      expect(adminUser.canAccessUnit('any_unit')).toBe(true);
      expect(auditorUser.canAccessUnit('any_unit')).toBe(true);
      expect(unitStaffUser.canAccessUnit('unit1')).toBe(true);
      expect(unitStaffUser.canAccessUnit('unit2')).toBe(false);
      expect(studentUser.canAccessUnit('any_unit')).toBe(false);
    });
  });

  describe('changeRole', () => {
    it('should change role to unit staff with unit', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        role: UserRole.STUDENT
      });

      user.changeRole(UserRole.UNIT_STAFF, 'test_unit');
      
      expect(user.role).toBe(UserRole.UNIT_STAFF);
      expect(user.unit_id).toBe('test_unit');
    });

    it('should clear unit when changing from unit staff', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        role: UserRole.UNIT_STAFF,
        unit_id: 'test_unit'
      });

      user.changeRole(UserRole.ADMIN);
      
      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.unit_id).toBeUndefined();
    });
  });

  describe('serialization', () => {
    it('should serialize to API response without password hash', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        role: UserRole.UNIT_STAFF,
        password_hash: 'secret_hash'
      });

      const apiResponse = user.toApiResponse();

      expect(apiResponse).toHaveProperty('user_id', 'test_user');
      expect(apiResponse).toHaveProperty('username', 'testuser');
      expect(apiResponse).toHaveProperty('role_display_name', '單位職員');
      expect(apiResponse).not.toHaveProperty('password_hash');
    });

    it('should serialize to public info format', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        role: UserRole.UNIT_STAFF
      });

      const publicInfo = user.toPublicInfo();

      expect(publicInfo).toHaveProperty('user_id', 'test_user');
      expect(publicInfo).toHaveProperty('name', '測試使用者');
      expect(publicInfo).toHaveProperty('role', UserRole.UNIT_STAFF);
      expect(publicInfo).not.toHaveProperty('email');
      expect(publicInfo).not.toHaveProperty('username');
    });

    it('should never serialize password hash in toJSON', () => {
      const user = new User({
        user_id: 'test_user',
        username: 'testuser',
        email: 'test@example.com',
        name: '測試使用者',
        password_hash: 'secret_hash'
      });

      const json = user.toJSON();

      expect(json).not.toHaveProperty('password_hash');
    });
  });
});