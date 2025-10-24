import { Student, StudentStatus } from '../student';

describe('Student Model', () => {
  describe('constructor', () => {
    it('should create a student with default values', () => {
      const student = new Student();
      
      expect(student.status).toBe(StudentStatus.ACTIVE);
    });

    it('should create a student with provided data', () => {
      const studentData = {
        student_id: 'test_student',
        name: '測試學生',
        email: 'student@example.com',
        nationality: '台灣',
        program: '資訊工程學系',
        enrollment_date: new Date('2023-09-01'),
        status: StudentStatus.ACTIVE
      };

      const student = new Student(studentData);
      
      expect(student.student_id).toBe('test_student');
      expect(student.name).toBe('測試學生');
      expect(student.email).toBe('student@example.com');
      expect(student.nationality).toBe('台灣');
      expect(student.program).toBe('資訊工程學系');
      expect(student.enrollment_date).toEqual(new Date('2023-09-01'));
      expect(student.status).toBe(StudentStatus.ACTIVE);
    });
  });

  describe('validateStudent', () => {
    it('should validate a valid student', () => {
      const student = new Student({
        student_id: 'valid_student',
        name: '有效學生',
        email: 'valid@example.com'
      });

      const result = student.validateStudent();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject student with invalid student_id format', () => {
      const student = new Student({
        student_id: 'invalid student!',
        name: '無效學生'
      });

      const result = student.validateStudent();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('學生ID只能包含英文字母、數字、底線和連字號');
    });

    it('should reject student with invalid email format', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        email: 'invalid-email'
      });

      const result = student.validateStudent();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('電子郵件格式不正確');
    });

    it('should reject student with invalid date logic', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        enrollment_date: new Date('2023-09-01'),
        expected_graduation_date: new Date('2023-08-01')
      });

      const result = student.validateStudent();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('預計畢業日期必須晚於入學日期');
    });

    it('should reject student with invalid passport number format', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        passport_number: 'invalid-passport!'
      });

      const result = student.validateStudent();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('護照號碼格式不正確，應只包含大寫英文字母和數字');
    });
  });

  describe('status methods', () => {
    it('should check student status correctly', () => {
      const activeStudent = new Student({ status: StudentStatus.ACTIVE });
      const graduatedStudent = new Student({ status: StudentStatus.GRADUATED });
      const suspendedStudent = new Student({ status: StudentStatus.SUSPENDED });
      const withdrawnStudent = new Student({ status: StudentStatus.WITHDRAWN });

      expect(activeStudent.isActive()).toBe(true);
      expect(activeStudent.isGraduated()).toBe(false);
      
      expect(graduatedStudent.isGraduated()).toBe(true);
      expect(graduatedStudent.isActive()).toBe(false);
      
      expect(suspendedStudent.isSuspended()).toBe(true);
      expect(suspendedStudent.isActive()).toBe(false);
      
      expect(withdrawnStudent.isWithdrawn()).toBe(true);
      expect(withdrawnStudent.isActive()).toBe(false);
    });

    it('should update student status', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        status: StudentStatus.ACTIVE
      });

      student.graduate();
      expect(student.status).toBe(StudentStatus.GRADUATED);

      student.suspend();
      expect(student.status).toBe(StudentStatus.SUSPENDED);

      student.withdraw();
      expect(student.status).toBe(StudentStatus.WITHDRAWN);

      student.reactivate();
      expect(student.status).toBe(StudentStatus.ACTIVE);
    });
  });

  describe('updateBasicInfo', () => {
    it('should update basic information', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '原始學生',
        email: 'original@example.com',
        nationality: '原始國籍'
      });

      student.updateBasicInfo({
        name: '更新學生',
        email: 'updated@example.com',
        nationality: '更新國籍'
      });

      expect(student.name).toBe('更新學生');
      expect(student.email).toBe('updated@example.com');
      expect(student.nationality).toBe('更新國籍');
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update emergency contact', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生'
      });

      const emergencyContact = {
        name: '緊急聯絡人',
        relationship: '父親',
        phone: '0912345678',
        email: 'emergency@example.com'
      };

      student.updateEmergencyContact(emergencyContact);

      expect(student.emergency_contact).toEqual(emergencyContact);
    });
  });

  describe('getEnrollmentDurationInMonths', () => {
    it('should calculate enrollment duration for active student', () => {
      const enrollmentDate = new Date();
      enrollmentDate.setMonth(enrollmentDate.getMonth() - 12); // 12 months ago

      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        enrollment_date: enrollmentDate,
        status: StudentStatus.ACTIVE
      });

      const duration = student.getEnrollmentDurationInMonths();
      
      expect(duration).toBeGreaterThanOrEqual(11);
      expect(duration).toBeLessThanOrEqual(13);
    });

    it('should return null when enrollment date is not set', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生'
      });

      const duration = student.getEnrollmentDurationInMonths();
      
      expect(duration).toBeNull();
    });
  });

  describe('isNearGraduation', () => {
    it('should return true for students graduating within 6 months', () => {
      const graduationDate = new Date();
      graduationDate.setMonth(graduationDate.getMonth() + 3); // 3 months from now

      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        expected_graduation_date: graduationDate,
        status: StudentStatus.ACTIVE
      });

      expect(student.isNearGraduation()).toBe(true);
    });

    it('should return false for students graduating after 6 months', () => {
      const graduationDate = new Date();
      graduationDate.setMonth(graduationDate.getMonth() + 12); // 12 months from now

      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        expected_graduation_date: graduationDate,
        status: StudentStatus.ACTIVE
      });

      expect(student.isNearGraduation()).toBe(false);
    });

    it('should return false for non-active students', () => {
      const graduationDate = new Date();
      graduationDate.setMonth(graduationDate.getMonth() + 3);

      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        expected_graduation_date: graduationDate,
        status: StudentStatus.GRADUATED
      });

      expect(student.isNearGraduation()).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize to API response format', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        email: 'test@example.com',
        nationality: '台灣',
        program: '資訊工程學系',
        status: StudentStatus.ACTIVE
      });

      const apiResponse = student.toApiResponse();

      expect(apiResponse).toHaveProperty('student_id', 'test_student');
      expect(apiResponse).toHaveProperty('name', '測試學生');
      expect(apiResponse).toHaveProperty('status_display_name', '在學');
      expect(apiResponse).toHaveProperty('enrollment_duration_months');
      expect(apiResponse).toHaveProperty('is_near_graduation');
    });

    it('should serialize to brief info format', () => {
      const student = new Student({
        student_id: 'test_student',
        name: '測試學生',
        nationality: '台灣',
        program: '資訊工程學系',
        status: StudentStatus.ACTIVE
      });

      const briefInfo = student.toBriefInfo();

      expect(briefInfo).toHaveProperty('student_id', 'test_student');
      expect(briefInfo).toHaveProperty('name', '測試學生');
      expect(briefInfo).toHaveProperty('status_display_name', '在學');
      expect(briefInfo).not.toHaveProperty('email');
      expect(briefInfo).not.toHaveProperty('phone');
    });
  });
});