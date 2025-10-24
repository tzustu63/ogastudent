-- UP
CREATE TYPE content_type AS ENUM ('file', 'web_url');
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');

CREATE TABLE student_documents (
    document_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    type_id VARCHAR(50) NOT NULL,
    uploader_id VARCHAR(50) NOT NULL,
    content_type content_type NOT NULL,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    web_url TEXT,
    remarks TEXT,
    status document_status DEFAULT 'pending',
    version INTEGER DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES document_types(type_id),
    FOREIGN KEY (uploader_id) REFERENCES users(user_id),
    CONSTRAINT chk_content_type CHECK (
        (content_type = 'file' AND file_path IS NOT NULL AND web_url IS NULL) OR
        (content_type = 'web_url' AND web_url IS NOT NULL AND file_path IS NULL)
    )
);

-- 建立索引
CREATE INDEX idx_student_documents_student ON student_documents(student_id);
CREATE INDEX idx_student_documents_type ON student_documents(type_id);
CREATE INDEX idx_student_documents_uploader ON student_documents(uploader_id);
CREATE INDEX idx_student_documents_status ON student_documents(status);
CREATE INDEX idx_student_documents_current ON student_documents(is_current);
CREATE INDEX idx_student_documents_uploaded_at ON student_documents(uploaded_at);

-- 複合索引用於查詢學生的特定文件類型
CREATE INDEX idx_student_documents_student_type ON student_documents(student_id, type_id);
CREATE INDEX idx_student_documents_student_current ON student_documents(student_id, is_current);

-- 建立更新時間觸發器
CREATE TRIGGER update_student_documents_updated_at BEFORE UPDATE ON student_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN
DROP TRIGGER IF EXISTS update_student_documents_updated_at ON student_documents;
DROP TABLE IF EXISTS student_documents;
DROP TYPE IF EXISTS content_type;
DROP TYPE IF EXISTS document_status;