-- UP
CREATE TYPE student_status AS ENUM ('active', 'graduated', 'suspended', 'withdrawn');

CREATE TABLE students (
    student_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    nationality VARCHAR(100),
    program VARCHAR(200),
    enrollment_date DATE,
    expected_graduation_date DATE,
    status student_status DEFAULT 'active',
    passport_number VARCHAR(50),
    phone VARCHAR(50),
    emergency_contact JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_nationality ON students(nationality);
CREATE INDEX idx_students_program ON students(program);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_enrollment_date ON students(enrollment_date);

-- 建立更新時間觸發器
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
DROP TABLE IF EXISTS students;
DROP TYPE IF EXISTS student_status;