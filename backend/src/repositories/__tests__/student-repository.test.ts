import { Pool } from 'pg';
import { StudentRepository, StudentFilter } from '../student-repository';
import { Student, StudentStatus } from '../../models/student';

// Mock the pg Pool
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn()
  }))
}));

describe('StudentRepository', () => {
  let mockPool: jest.Mocked<Pool>;
  let studentRepository: StudentRepository;

  beforeEach(() => {
    mockPool = new Pool() as jest.Mocked<Pool>;
    studentRepository = new StudentRepository(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return student when found by email', async () => {
      const mockRow = {
        student_id: 'test_student',
        name: '測試學生',
        email: 'test@example.com',
        nationality: '台灣',
        program: '資訊工程學系',
        status: StudentStatus.ACTIVE,
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

      const result = await studentRepository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(Student);
      expect(result?.email).toBe('test@example.com');
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM students WHERE email = $1',
        ['test@example.com']
      );
    });

    it('should return null when student not found by email', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await studentRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should throw error when query fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Database error'));

      await expect(studentRepository.findByEmail('test@example.com')).rejects.toThrow('根據電子郵件查詢學生失敗');
    });
  });

  describe('findByPassportNumber', () => {
    it('should return student when found by passport number', async () => {
      const mockRow = {
        student_id: 'test_student',
        name: '測試學生',
        passport_number: 'A123456789',
        status: StudentStatus.ACTIVE,
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

      const result = await studentRepository.findByPassportNumber('A123456789');

      expect(result).toBeInstanceOf(Student);
      expect(result?.passport_number).toBe('A123456789');
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM students WHERE passport_number = $1',
        ['A123456789']
      );
    });
  });

  describe('findByNationality', () => {
    it('should return paginated students by nationality', async () => {
      const mockRows = [
        {
          student_id: 'student1',
          name: '學生1',
          nationality: '台灣',
          status: StudentStatus.ACTIVE,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          student_id: 'student2',
          name: '學生2',
          nationality: '台灣',
          status: StudentStatus.ACTIVE,
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

      const result = await studentRepository.findByNationality('台灣', { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toBeInstanceOf(Student);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.currentPage).toBe(1);
    });
  });

  describe('findByStatus', () => {
    it('should return paginated students by status', async () => {
      const mockRows = [
        {
          student_id: 'student1',
          name: '學生1',
          status: StudentStatus.ACTIVE,
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

      const result = await studentRepository.findByStatus(StudentStatus.ACTIVE);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(StudentStatus.ACTIVE);
    });
  });

  describe('findWithFilters', () => {
    it('should return filtered students with search term', async () => {
      const filters: StudentFilter = {
        nationality: '台灣',
        status: StudentStatus.ACTIVE,
        search: '測試'
      };

      const mockRows = [
        {
          student_id: 'student1',
          name: '測試學生',
          nationality: '台灣',
          status: StudentStatus.ACTIVE,
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

      const result = await studentRepository.findWithFilters(filters);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('測試學生');
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

      const result = await studentRepository.isEmailExists('test@example.com');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT 1 FROM students WHERE email = $1 LIMIT 1',
        ['test@example.com']
      );
    });

    it('should return false when email does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await studentRepository.isEmailExists('nonexistent@example.com');

      expect(result).toBe(false);
    });

    it('should exclude specific student when checking email existence', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      await studentRepository.isEmailExists('test@example.com', 'exclude_student');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT 1 FROM students WHERE email = $1 AND student_id != $2 LIMIT 1',
        ['test@example.com', 'exclude_student']
      );
    });
  });

  describe('isPassportNumberExists', () => {
    it('should return true when passport number exists', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ exists: true }],
        rowCount: 1,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await studentRepository.isPassportNumberExists('A123456789');

      expect(result).toBe(true);
    });

    it('should return false when passport number does not exist', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
        oid: 0,
        fields: []
      });

      const result = await studentRepository.isPassportNumberExists('B987654321');

      expect(result).toBe(false);
    });
  });

  describe('findNearGraduation', () => {
    it('should return students near graduation', async () => {
      const mockRows = [
        {
          student_id: 'student1',
          name: '即將畢業學生',
          status: StudentStatus.ACTIVE,
          expected_graduation_date: new Date('2024-06-01'),
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      // Mock executeQuery method
      jest.spyOn(studentRepository as any, 'executeQuery').mockResolvedValue(mockRows);

      const result = await studentRepository.findNearGraduation();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Student);
      expect(result[0].name).toBe('即將畢業學生');
    });
  });

  describe('getStudentStats', () => {
    it('should return comprehensive student statistics', async () => {
      const mockResults = [
        // Total and active students
        { rows: [{ total_students: '100', active_students: '80' }] },
        // Students by status
        { rows: [{ status: 'active', count: '80' }, { status: 'graduated', count: '20' }] },
        // Students by nationality
        { rows: [{ nationality: '台灣', count: '50' }, { nationality: '日本', count: '30' }] },
        // Students by program
        { rows: [{ program: '資訊工程學系', count: '40' }, { program: '電機工程學系', count: '35' }] },
        // Near graduation count
        { rows: [{ near_graduation_count: '15' }] }
      ];

      mockPool.query
        .mockResolvedValueOnce(mockResults[0] as any)
        .mockResolvedValueOnce(mockResults[1] as any)
        .mockResolvedValueOnce(mockResults[2] as any)
        .mockResolvedValueOnce(mockResults[3] as any)
        .mockResolvedValueOnce(mockResults[4] as any);

      const result = await studentRepository.getStudentStats();

      expect(result.total_students).toBe(100);
      expect(result.active_students).toBe(80);
      expect(result.students_by_status).toHaveLength(2);
      expect(result.students_by_nationality).toHaveLength(2);
      expect(result.students_by_program).toHaveLength(2);
      expect(result.near_graduation_count).toBe(15);
    });
  });
});