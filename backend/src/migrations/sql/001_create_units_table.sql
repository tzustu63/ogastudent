-- UP
CREATE TABLE units (
    unit_id VARCHAR(50) PRIMARY KEY,
    unit_name VARCHAR(100) NOT NULL,
    unit_name_en VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引
CREATE INDEX idx_units_is_active ON units(is_active);
CREATE INDEX idx_units_name ON units(unit_name);

-- 插入預設單位資料
INSERT INTO units (unit_id, unit_name, unit_name_en, description) VALUES
('global_affairs', '全球處', 'Global Affairs Office', '負責國際學生事務管理'),
('registrar', '註冊組', 'Registrar Office', '負責學生註冊和學籍管理'),
('career_services', '實就組', 'Career Services', '負責學生實習和就業服務'),
('language_center', '外語中心', 'Language Center', '負責語言教學和師資管理'),
('ministry_education', '教育部', 'Ministry of Education', '政府教育主管機關');

-- DOWN
DROP TABLE IF EXISTS units;