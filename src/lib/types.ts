export type Language = 'ar' | 'en'

export interface ReportStatus {
  id: string
  name_ar: string
  name_en: string
  color: string
  sort_order: number
  is_default: boolean
  created_at: string
}

export interface QuestionOption {
  label_ar: string
  label_en: string
  value: string
}

export type QuestionType = 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'file'

export interface CustomQuestion {
  id: string
  question_ar: string
  question_en: string
  type: QuestionType
  options: QuestionOption[] | null
  is_required: boolean
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface Report {
  id: string
  phone_number: string
  status_id: string | null
  file_url: string | null
  created_at: string
  updated_at: string
  status?: ReportStatus
  answers?: ReportAnswer[]
  status_history?: ReportStatusHistory[]
}

export interface ReportAnswer {
  id: string
  report_id: string
  question_id: string
  answer_value: string
  question?: CustomQuestion
}

export interface ReportStatusHistory {
  id: string
  report_id: string
  status_id: string
  note: string | null
  changed_at: string
  status?: ReportStatus
}

export interface AdminUser {
  id: string
  user_id: string
  name: string | null
  created_at: string
}
