-- 為效能優化新增索引

-- Students 表索引
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_nationality ON students(nationality);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);

-- Users 表索引
CREATE INDEX IF NOT EXISTS idx_users_unit_id ON users(unit_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Student_Documents 表索引
CREATE INDEX IF NOT EXISTS idx_student_documents_student_id ON student_documents(student_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_type_id ON student_documents(type_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_uploader_id ON student_documents(uploader_id);
CREATE INDEX IF NOT EXISTS idx_student_documents_status ON student_documents(status);
CREATE INDEX IF NOT EXISTS idx_student_documents_uploaded_at ON student_documents(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_student_documents_student_type ON student_documents(student_id, type_id);

-- Tracking_Records 表索引
CREATE INDEX IF NOT EXISTS idx_tracking_records_student_id ON tracking_records(student_id);
CREATE INDEX IF NOT EXISTS idx_tracking_records_document_id ON tracking_records(document_id);
CREATE INDEX IF NOT EXISTS idx_tracking_records_user_id ON tracking_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_records_action_type ON tracking_records(action_type);
CREATE INDEX IF NOT EXISTS idx_tracking_records_created_at ON tracking_records(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_records_student_created ON tracking_records(student_id, created_at);

-- Notifications 表索引（已在 007 中建立，這裡跳過）
-- CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
-- CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
-- CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Document_Types 表索引
CREATE INDEX IF NOT EXISTS idx_document_types_responsible_unit_id ON document_types(responsible_unit_id);
CREATE INDEX IF NOT EXISTS idx_document_types_is_required ON document_types(is_required);

-- 複合索引用於常見查詢
CREATE INDEX IF NOT EXISTS idx_student_documents_student_status ON student_documents(student_id, status);
CREATE INDEX IF NOT EXISTS idx_tracking_records_student_action_date ON tracking_records(student_id, action_type, created_at);

-- 全文搜尋索引（如果需要）
-- CREATE INDEX IF NOT EXISTS idx_students_name_fulltext ON students USING gin(to_tsvector('english', name));
-- CREATE INDEX IF NOT EXISTS idx_students_email_fulltext ON students USING gin(to_tsvector('english', email));
