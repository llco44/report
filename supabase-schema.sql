-- ============================================================
-- نظام إدارة البلاغات - Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- 1. Report Statuses (customizable by admin)
CREATE TABLE IF NOT EXISTS report_statuses (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ar     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#6B7280',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Custom Questions (admin-configurable form questions)
CREATE TABLE IF NOT EXISTS custom_questions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_ar TEXT NOT NULL,
  question_en TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'number', 'boolean', 'select', 'file')),
  options     JSONB,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Reports
CREATE TABLE IF NOT EXISTS reports (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  status_id    UUID REFERENCES report_statuses(id),
  file_url     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Report Answers (answers to custom questions)
CREATE TABLE IF NOT EXISTS report_answers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id    UUID REFERENCES reports(id) ON DELETE CASCADE,
  question_id  UUID REFERENCES custom_questions(id),
  answer_value TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Status History (audit trail for status changes)
CREATE TABLE IF NOT EXISTS report_status_history (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id  UUID REFERENCES reports(id) ON DELETE CASCADE,
  status_id  UUID REFERENCES report_statuses(id),
  note       TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. App Settings (key-value store for admin-configurable options)
CREATE TABLE IF NOT EXISTS app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service manages settings" ON app_settings FOR ALL USING (auth.role() = 'service_role');

-- Seed: default notification email
INSERT INTO app_settings (key, value) VALUES
  ('notify_emails', 'sho.admin57@gmail.com')
ON CONFLICT DO NOTHING;

-- 7. Admin Users (links Supabase Auth users to admin role)
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE report_statuses       ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_questions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports               ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_answers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users           ENABLE ROW LEVEL SECURITY;

-- report_statuses: anyone can read, service role manages
CREATE POLICY "Public read statuses"      ON report_statuses FOR SELECT USING (true);
CREATE POLICY "Service manages statuses"  ON report_statuses FOR ALL    USING (auth.role() = 'service_role');

-- custom_questions: anyone can read active questions, service role manages all
CREATE POLICY "Public read active questions" ON custom_questions FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service manages questions"    ON custom_questions FOR ALL    USING (auth.role() = 'service_role');

-- reports: anyone can insert, service role reads all
CREATE POLICY "Public insert reports"   ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Service manages reports" ON reports FOR ALL    USING (auth.role() = 'service_role');

-- report_answers: anyone can insert, service role reads all
CREATE POLICY "Public insert answers"   ON report_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service manages answers" ON report_answers FOR ALL    USING (auth.role() = 'service_role');

-- report_status_history: service role manages
CREATE POLICY "Service manages history" ON report_status_history FOR ALL USING (auth.role() = 'service_role');

-- admin_users: authenticated users can read their own row
CREATE POLICY "Self read admin"          ON admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service manages admins"   ON admin_users FOR ALL    USING (auth.role() = 'service_role');

-- ============================================================
-- Seed: Default Statuses
-- ============================================================
INSERT INTO report_statuses (name_ar, name_en, color, sort_order, is_default) VALUES
  ('مستلم',        'Received',    '#3B82F6', 0, TRUE),
  ('قيد المعالجة', 'In Progress', '#F59E0B', 1, FALSE),
  ('تم الحل',      'Resolved',    '#10B981', 2, FALSE),
  ('مغلق',         'Closed',      '#6B7280', 3, FALSE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Seed: Default Questions
-- ============================================================
INSERT INTO custom_questions (question_ar, question_en, type, options, is_required, sort_order) VALUES
  (
    'الاسم الكامل', 'Full Name', 'text', NULL, TRUE, 0
  ),
  (
    'نوع العطل', 'Fault Type', 'select',
    '[
      {"label_ar":"كهرباء",      "label_en":"Electricity",   "value":"electricity"},
      {"label_ar":"سباكة",       "label_en":"Plumbing",      "value":"plumbing"},
      {"label_ar":"تكييف",       "label_en":"AC",            "value":"ac"},
      {"label_ar":"سلامة",       "label_en":"Safety",        "value":"safety"},
      {"label_ar":"أبواب وأقفال","label_en":"Doors & Locks", "value":"doors"},
      {"label_ar":"أخرى",        "label_en":"Other",         "value":"other"}
    ]'::jsonb,
    TRUE, 1
  ),
  (
    'وصف المشكلة', 'Problem Description', 'textarea', NULL, TRUE, 2
  ),
  (
    'الأولوية', 'Priority', 'select',
    '[
      {"label_ar":"بسيط",  "label_en":"Simple", "value":"simple"},
      {"label_ar":"متوسط", "label_en":"Medium", "value":"medium"},
      {"label_ar":"عاجل",  "label_en":"Urgent", "value":"urgent"}
    ]'::jsonb,
    FALSE, 3
  ),
  (
    'مرفق صورة أو ملف', 'Attach Image or File', 'file', NULL, FALSE, 4
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- Storage Bucket for Report Files
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-files', 'report-files', true)
ON CONFLICT DO NOTHING;

-- Allow anyone to upload and read from report-files bucket
CREATE POLICY "Public upload report-files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-files');

CREATE POLICY "Public read report-files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-files');

-- ============================================================
-- Done! Go to /admin/setup to create your first admin account.
-- ============================================================
