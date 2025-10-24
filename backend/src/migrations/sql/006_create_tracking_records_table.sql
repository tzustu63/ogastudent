-- UP
CREATE TYPE action_type AS ENUM (
    'document_upload', 'document_update', 'document_delete', 
    'document_approve', 'document_reject', 'document_review',
    'student_create', 'student_update', 'student_delete',
    'user_login', 'user_logout', 'permission_change'
);

CREATE TABLE tracking_records (
    record_id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50),
    document_id VARCHAR(50),
    user_id VARCHAR(50) NOT NULL,
    action_type action_type NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL,
    FOREIGN KEY (document_id) REFERENCES student_documents(document_id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 建立索引
CREATE INDEX idx_tracking_records_student ON tracking_records(student_id);
CREATE INDEX idx_tracking_records_document ON tracking_records(document_id);
CREATE INDEX idx_tracking_records_user ON tracking_records(user_id);
CREATE INDEX idx_tracking_records_action ON tracking_records(action_type);
CREATE INDEX idx_tracking_records_created_at ON tracking_records(created_at);

-- 複合索引用於常見查詢
CREATE INDEX idx_tracking_records_student_action ON tracking_records(student_id, action_type);
CREATE INDEX idx_tracking_records_user_action ON tracking_records(user_id, action_type);
CREATE INDEX idx_tracking_records_date_action ON tracking_records(created_at, action_type);

-- 建立分區表（按月分區以提升查詢效能）
-- 這裡先建立基本表，實際部署時可考慮分區

-- DOWN
DROP TABLE IF EXISTS tracking_records;
DROP TYPE IF EXISTS action_type;