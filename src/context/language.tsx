'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Language } from '@/lib/types'

const translations = {
  ar: {
    appName: 'مركز الصيانة',
    appTagline: 'بلّغ، تابع، واستلم حلولك',
    home: 'الرئيسية',
    fileReport: 'تقديم بلاغ',
    trackReport: 'تتبع بلاغ',
    adminDashboard: 'لوحة الإدارة',
    logout: 'تسجيل الخروج',
    homeTitle: 'مرحباً بك في نظام إدارة البلاغات',
    homeSubtitle: 'قدّم بلاغاً جديداً أو تتبع حالة بلاغك',
    fileReportBtn: 'تقديم بلاغ جديد',
    trackReportBtn: 'تتبع حالة بلاغ',
    reportFormTitle: 'تقديم بلاغ جديد',
    phoneNumber: 'رقم الهاتف',
    phoneNumberHelper: 'سيتم استخدامه لتتبع بلاغك',
    submitReport: 'إرسال البلاغ',
    submitting: 'جارٍ الإرسال...',
    reportSubmitted: 'تم تقديم البلاغ بنجاح!',
    reportId: 'رقم البلاغ',
    trackYourStatus: 'يمكنك تتبع بلاغك برقم:',
    statusTitle: 'تتبع بلاغك',
    enterPhone: 'أدخل رقم الهاتف',
    searchBtn: 'بحث',
    searching: 'جارٍ البحث...',
    noReports: 'لا توجد بلاغات لهذا الرقم',
    reportStatus: 'الحالة',
    submittedAt: 'تاريخ التقديم',
    adminLogin: 'دخول المدير',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    loginBtn: 'دخول',
    loggingIn: 'جارٍ الدخول...',
    loginError: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    dashboardTitle: 'لوحة التحكم',
    totalReports: 'إجمالي البلاغات',
    pendingReports: 'قيد المعالجة',
    resolvedReports: 'تم الحل',
    recentReports: 'أحدث البلاغات',
    allReports: 'جميع البلاغات',
    reportNumber: 'رقم البلاغ',
    status: 'الحالة',
    phone: 'رقم الهاتف',
    date: 'التاريخ',
    actions: 'الإجراءات',
    viewReport: 'عرض',
    updateStatus: 'تحديث الحالة',
    statusHistory: 'سجل الحالات',
    addNote: 'ملاحظة (اختياري)',
    selectStatus: 'اختر الحالة',
    save: 'حفظ',
    saving: 'جارٍ الحفظ...',
    manageStatuses: 'إدارة الحالات',
    addStatus: 'إضافة حالة',
    statusNameAr: 'الاسم بالعربية',
    statusNameEn: 'الاسم بالإنجليزية',
    statusColor: 'اللون',
    defaultStatus: 'حالة افتراضية',
    setDefault: 'تعيين كافتراضي',
    deleteStatus: 'حذف',
    editStatus: 'تعديل',
    manageQuestions: 'إدارة الأسئلة',
    addQuestion: 'إضافة سؤال',
    questionAr: 'السؤال بالعربية',
    questionEn: 'السؤال بالإنجليزية',
    questionType: 'نوع السؤال',
    required: 'إلزامي',
    options: 'الخيارات',
    addOption: 'إضافة خيار',
    optionAr: 'الخيار بالعربية',
    optionEn: 'الخيار بالإنجليزية',
    optionValue: 'القيمة',
    typeText: 'نص قصير',
    typeTextarea: 'نص طويل',
    typeNumber: 'رقم',
    typeBoolean: 'نعم / لا',
    typeSelect: 'قائمة منسدلة',
    typeFile: 'ملف / صورة',
    yes: 'نعم',
    no: 'لا',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    close: 'إغلاق',
    confirm: 'تأكيد',
    back: 'رجوع',
    loading: 'جارٍ التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    reports: 'البلاغات',
    statuses: 'الحالات',
    questions: 'الأسئلة',
    attachFile: 'إرفاق ملف',
    chooseFile: 'اختر ملفاً',
    noFile: 'لم يتم اختيار ملف',
    reportDetails: 'تفاصيل البلاغ',
    answers: 'الإجابات',
    noStatus: 'بدون حالة',
    confirmDelete: 'هل أنت متأكد من الحذف؟',
    active: 'مفعّل',
    inactive: 'معطّل',
    toggleActive: 'تفعيل / تعطيل',
    order: 'الترتيب',
    setupTitle: 'إعداد المدير الأول',
    setupDesc: 'قم بإنشاء حساب المدير للوصول إلى لوحة التحكم',
    setupBtn: 'إنشاء الحساب',
    setupDone: 'تم إنشاء حساب المدير بنجاح',
    name: 'الاسم',
    notFound: 'الصفحة غير موجودة',
    goHome: 'الذهاب للرئيسية',
    filterByStatus: 'تصفية حسب الحالة',
    allStatuses: 'جميع الحالات',
    search: 'بحث',
    exportReport: 'تصدير',
    adminName: 'اسم المدير',
    settings: 'الإعدادات',
  },
  en: {
    appName: 'Maintenance Center',
    appTagline: 'Report, Track, and Receive Solutions',
    home: 'Home',
    fileReport: 'File Report',
    trackReport: 'Track Report',
    adminDashboard: 'Admin Dashboard',
    logout: 'Logout',
    homeTitle: 'Welcome to the Report Management System',
    homeSubtitle: 'File a new report or track your existing report',
    fileReportBtn: 'File New Report',
    trackReportBtn: 'Track Report Status',
    reportFormTitle: 'File New Report',
    phoneNumber: 'Phone Number',
    phoneNumberHelper: 'Used to track your report status',
    submitReport: 'Submit Report',
    submitting: 'Submitting...',
    reportSubmitted: 'Report submitted successfully!',
    reportId: 'Report Number',
    trackYourStatus: 'Track your report with:',
    statusTitle: 'Track Your Report',
    enterPhone: 'Enter phone number',
    searchBtn: 'Search',
    searching: 'Searching...',
    noReports: 'No reports found for this number',
    reportStatus: 'Status',
    submittedAt: 'Submitted At',
    adminLogin: 'Admin Login',
    email: 'Email',
    password: 'Password',
    loginBtn: 'Login',
    loggingIn: 'Logging in...',
    loginError: 'Invalid email or password',
    dashboardTitle: 'Dashboard',
    totalReports: 'Total Reports',
    pendingReports: 'In Progress',
    resolvedReports: 'Resolved',
    recentReports: 'Recent Reports',
    allReports: 'All Reports',
    reportNumber: 'Report #',
    status: 'Status',
    phone: 'Phone',
    date: 'Date',
    actions: 'Actions',
    viewReport: 'View',
    updateStatus: 'Update Status',
    statusHistory: 'Status History',
    addNote: 'Note (optional)',
    selectStatus: 'Select Status',
    save: 'Save',
    saving: 'Saving...',
    manageStatuses: 'Manage Statuses',
    addStatus: 'Add Status',
    statusNameAr: 'Arabic Name',
    statusNameEn: 'English Name',
    statusColor: 'Color',
    defaultStatus: 'Default Status',
    setDefault: 'Set as Default',
    deleteStatus: 'Delete',
    editStatus: 'Edit',
    manageQuestions: 'Manage Questions',
    addQuestion: 'Add Question',
    questionAr: 'Question in Arabic',
    questionEn: 'Question in English',
    questionType: 'Question Type',
    required: 'Required',
    options: 'Options',
    addOption: 'Add Option',
    optionAr: 'Option in Arabic',
    optionEn: 'Option in English',
    optionValue: 'Value',
    typeText: 'Short Text',
    typeTextarea: 'Long Text',
    typeNumber: 'Number',
    typeBoolean: 'Yes / No',
    typeSelect: 'Dropdown',
    typeFile: 'File / Image',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    confirm: 'Confirm',
    back: 'Back',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    reports: 'Reports',
    statuses: 'Statuses',
    questions: 'Questions',
    attachFile: 'Attach File',
    chooseFile: 'Choose File',
    noFile: 'No file chosen',
    reportDetails: 'Report Details',
    answers: 'Answers',
    noStatus: 'No Status',
    confirmDelete: 'Are you sure you want to delete?',
    active: 'Active',
    inactive: 'Inactive',
    toggleActive: 'Toggle Active',
    order: 'Order',
    setupTitle: 'First Admin Setup',
    setupDesc: 'Create an admin account to access the dashboard',
    setupBtn: 'Create Account',
    setupDone: 'Admin account created successfully',
    name: 'Name',
    notFound: 'Page Not Found',
    goHome: 'Go Home',
    filterByStatus: 'Filter by Status',
    allStatuses: 'All Statuses',
    search: 'Search',
    exportReport: 'Export',
    adminName: 'Admin Name',
    settings: 'Settings',
  },
}

export type TranslationKey = keyof typeof translations.ar

interface LanguageContextValue {
  lang: Language
  dir: 'rtl' | 'ltr'
  t: (key: TranslationKey) => string
  toggle: () => void
  isDark: boolean
  toggleTheme: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>('ar')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language | null
    if (savedLang === 'ar' || savedLang === 'en') setLang(savedLang)
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('lang', lang)
  }, [lang])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const t = (key: TranslationKey) => translations[lang][key] ?? key
  const toggle = () => setLang(prev => (prev === 'ar' ? 'en' : 'ar'))

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
      return next
    })
  }

  return (
    <LanguageContext.Provider value={{ lang, dir, t, toggle, isDark, toggleTheme }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
