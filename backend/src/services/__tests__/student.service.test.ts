import { Pool } from 'pg';
import { StudentService } from '../student.service';
import { StudentStatus } from '../../models/student';

// Mock the pool
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(),
  end: jest.fn(),
  on: jest.fn()
} as unknown as Pool;

describe('StudentService', () => {
  let studentService: StudentService;

  beforeEach(() => {
    studentService = new StudentService(mockPool);
    jest.clearAllMocks();
  });

  describe('createStudent', () => {
    it('should create a new student successfully', async () => {
      const studentData = {
        student_id: 'S001',
        name: 'Test Student',
        email: 'test@example.com',
        nationality: 'Taiwan',
        program: 'Computer Science',
        status: StudentStatus.ACTIVE
      };

      // Mock repository methods
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // findById - not exists
        .mockResolvedValueOnce({ rows: [] }) // isEmailExists - false
        .mockResolvedValueOnce({ 
          rows: [{ ...studentData, created_at: new Date(), updated_at: new Date() }] 
        }); // create

      const result = await studentService.createStudent(studentData);

      expect(result).toBeDefined();
      expect(result.student_id).toBe(studentData.student_id);
    });

    it('should throw error if student ID already exists', async () => {
      const studentData = {
        student_id: 'S001',
        name: 'Test Student'
      };

      // Mock existing student
      (mockPool.query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ ...studentData, created_at: new Date() }] 
      });

      await expect(studentService.createStudent(studentData)).rejects.toThrow('學生ID已存在');
    });

    it('should throw error if required fields are missing', async () => {
      const studentData = {
        student_id: 'S001'
        // missing name
      };

      await expect(studentService.createStudent(studentData)).rejects.toThrow('學生ID和姓名為必填欄位');
    });
  });

  describe('updateStudent', () => {
    it('should update student successfully', async () => {
      const studentId = 'S001';
      const updateData = {
        email: 'newemail@example.com',
        phone: '0912345678'
      };

      const existingStudent = {
        student_id: studentId,
        name: 'Test Student',
        email: 'old@example.com',
        status: StudentStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Mock repository methods
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [existingStudent] }) // findById
        .mockResolvedValueOnce({ rows: [] }) // isEmailExists - false
        .mockResolvedValueOnce({ 
          rows: [{ ...existingStudent, ...updateData, updated_at: new Date() }] 
        }); // update

      const result = await studentService.updateStudent(studentId, updateData);

      expect(result).toBeDefined();
      expect(result.student_id).toBe(studentId);
    });

    it('should throw error if student not found', async () => {
      const studentId = 'S999';
      const updateData = { email: 'test@example.com' };

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // findById - not found

      await expect(studentService.updateStudent(studentId, updateData)).rejects.toThrow('找不到學生');
    });
  });

  describe('getStudentProfile', () => {
    it('should return student profile with completion stats', async () => {
      const studentId = 'S001';
      const studentData = {
        student_id: studentId,
        name: 'Test Student',
        email: 'test@example.com',
        status: StudentStatus.ACTIVE,
        created_at: new Date(),
        updated_at: new Date()
      };

      const completionStats = {
        total_required: 18,
        completed: 10,
        completion_rate: 55.56,
        missing_document_types: ['type1', 'type2']
      };

      // Mock repository methods
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [studentData] }) // findById
        .mockResolvedValueOnce({ rows: [completionStats] }) // getStudentCompletionStats
        .mockResolvedValueOnce({ rows: [] }); // findCurrentByStudent

      const result = await studentService.getStudentProfile(studentId);

      expect(result).toBeDefined();
      expect(result.student).toBeDefined();
      expect(result.completion).toBeDefined();
      expect(result.completion.total_required).toBe(18);
      expect(result.completion.completed).toBe(10);
    });

    it('should throw error if student not found', async () => {
      const studentId = 'S999';

      (mockPool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // findById - not found

      await expect(studentService.getStudentProfile(studentId)).rejects.toThrow('找不到學生');
    });
  });

  describe('searchStudents', () => {
    it('should search students with filters', async () => {
      const filters = {
        nationality: 'Taiwan',
        status: StudentStatus.ACTIVE
      };

      const mockStudents = [
        {
          student_id: 'S001',
          name: 'Student 1',
          nationality: 'Taiwan',
          status: StudentStatus.ACTIVE,
          created_at: new Date()
        },
        {
          student_id: 'S002',
          name: 'Student 2',
          nationality: 'Taiwan',
          status: StudentStatus.ACTIVE,
          created_at: new Date()
        }
      ];

      // Mock repository methods
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [{ count: '2' }] }) // count query
        .mockResolvedValueOnce({ rows: mockStudents }); // data query

      const result = await studentService.searchStudents(filters);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toBeDefined();
    });
  });

  describe('importStudents', () => {
    it('should import multiple students successfully', async () => {
      const studentsData = [
        { student_id: 'S001', name: 'Student 1' },
        { student_id: 'S002', name: 'Student 2' }
      ];

      // Mock all students don't exist and can be created
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // S001 findById
        .mockResolvedValueOnce({ rows: [] }) // S001 isEmailExists
        .mockResolvedValueOnce({ rows: [studentsData[0]] }) // S001 create
        .mockResolvedValueOnce({ rows: [] }) // S002 findById
        .mockResolvedValueOnce({ rows: [] }) // S002 isEmailExists
        .mockResolvedValueOnce({ rows: [studentsData[1]] }); // S002 create

      const result = await studentService.importStudents(studentsData);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle partial import failures', async () => {
      const studentsData = [
        { student_id: 'S001', name: 'Student 1' },
        { student_id: '', name: 'Student 2' } // Invalid - missing ID
      ];

      // Mock first student succeeds
      (mockPool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // S001 findById
        .mockResolvedValueOnce({ rows: [] }) // S001 isEmailExists
        .mockResolvedValueOnce({ rows: [studentsData[0]] }); // S001 create

      const result = await studentService.importStudents(studentsData);

      expect(result.success).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('必填欄位');
    });
  });
});
