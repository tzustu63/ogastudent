-- UP
CREATE TABLE document_types (
    type_id VARCHAR(50) PRIMARY KEY,
    type_name VARCHAR(100) NOT NULL,
    type_name_en VARCHAR(100),
    responsible_unit_id VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT true,
    validation_rules JSONB,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responsible_unit_id) REFERENCES units(unit_id)
);

-- 建立索引
CREATE INDEX idx_document_types_unit ON document_types(responsible_unit_id);
CREATE INDEX idx_document_types_required ON document_types(is_required);
CREATE INDEX idx_document_types_order ON document_types(display_order);

-- 插入18種佐證資料類型
INSERT INTO document_types (type_id, type_name, type_name_en, responsible_unit_id, validation_rules, display_order) VALUES
('graduation_certificate', '畢業證書', 'Graduation Certificate', 'registrar', '{"formats": ["pdf", "jpg", "png"], "max_size": "10MB"}', 1),
('grade_5_students', '中五生', 'Grade 5 Students', 'registrar', '{"formats": ["pdf", "doc", "docx"], "max_size": "5MB"}', 2),
('academic_transcripts', '歷年成績單', 'Academic Transcripts', 'registrar', '{"formats": ["pdf"], "max_size": "10MB"}', 3),
('tuition_fee_standard', '學雜費收退費基準', 'Tuition Fee Standard', 'registrar', '{"formats": ["pdf", "doc", "docx"], "max_size": "5MB"}', 4),
('internship_contract', '學生實習合約', 'Student Internship Contract', 'career_services', '{"formats": ["pdf", "doc", "docx"], "max_size": "10MB"}', 5),
('graduate_employment', '畢業流向', 'Graduate Employment', 'career_services', '{"formats": ["pdf", "xlsx"], "max_size": "10MB"}', 6),
('chinese_teachers', '華語師資', 'Chinese Language Teachers', 'language_center', '{"formats": ["pdf", "doc", "docx"], "max_size": "5MB"}', 7),
('course_schedule', '課程時間表', 'Course Schedule', 'global_affairs', '{"formats": ["pdf", "xlsx"], "max_size": "5MB"}', 8),
('attendance_record', '出席記錄', 'Attendance Record', 'global_affairs', '{"formats": ["pdf", "xlsx"], "max_size": "10MB"}', 9),
('dormitory_info', '宿舍資訊', 'Dormitory Information', 'global_affairs', '{"formats": ["pdf", "doc", "docx"], "max_size": "5MB"}', 10),
('insurance_info', '保險資訊', 'Insurance Information', 'global_affairs', '{"formats": ["pdf"], "max_size": "5MB"}', 11),
('health_check', '健康檢查', 'Health Check', 'global_affairs', '{"formats": ["pdf"], "max_size": "10MB"}', 12),
('visa_permit', '簽證居留證', 'Visa and Residence Permit', 'global_affairs', '{"formats": ["pdf", "jpg", "png"], "max_size": "10MB"}', 13),
('financial_proof', '財力證明', 'Financial Proof', 'global_affairs', '{"formats": ["pdf"], "max_size": "10MB"}', 14),
('language_proficiency', '語言能力證明', 'Language Proficiency', 'global_affairs', '{"formats": ["pdf", "jpg", "png"], "max_size": "10MB"}', 15),
('study_plan', '學習計畫', 'Study Plan', 'global_affairs', '{"formats": ["pdf", "doc", "docx"], "max_size": "5MB"}', 16),
('recommendation_letter', '推薦信', 'Recommendation Letter', 'global_affairs', '{"formats": ["pdf", "doc", "docx"], "max_size": "5MB"}', 17),
('other_documents', '其他相關文件', 'Other Related Documents', 'global_affairs', '{"formats": ["pdf", "doc", "docx", "jpg", "png"], "max_size": "10MB"}', 18);

-- DOWN
DROP TABLE IF EXISTS document_types;