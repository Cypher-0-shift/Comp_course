// Shared TypeScript types for the Compensatory Course Dashboard (3-Table Flat Schema)

export type UserRole = 'student' | 'faculty' | 'hod' | 'dean'

export interface Department {
  id: string
  sl_no: number
  department_name: string
  students_registered: number
  created_at: string
  updated_at: string
}

export interface StudentEnrollment {
  id: string
  sno: number | null
  student_name: string
  register_no: string
  program: string
  mobile_no: string | null
  email_id: string
  subject_code: string
  subject_name: string
  status: string
  created_at: string
  updated_at: string
}

export interface FacultyAssignment {
  id: string
  sno: number | null
  subject_code: string
  subject_name: string
  students_registered: number
  faculty_name: string
  department: string
  emp_id: string
  mobile_number: string | null
  email_id: string | null
  created_at: string
  updated_at: string
}

// Backward compatibility interfaces/aliases for existing views
export interface StudentWithRelations {
  id: string
  user_id: string
  register_no: string
  name: string
  program: string
  mobile: string
  email: string
  section: string
  department_id: string
  academic_year_id: string
  created_at: string
  updated_at: string
  department?: {
    id: string
    name: string
    code: string
    academic_year_id: string
    created_at: string
    updated_at: string
  }
}

export interface EnrollmentWithRelations {
  id: string
  student_id: string
  subject_id: string
  academic_year_id: string
  status: string
  created_at: string
  updated_at: string
  subject?: {
    id: string
    code: string
    name: string
    credits: number
    department_id: string
    academic_year_id: string
    created_at: string
    updated_at: string
    faculty_subjects?: Array<{
      id: string
      faculty_id: string
      subject_id: string
      created_at: string
      updated_at: string
      faculty?: {
        id: string
        user_id: string
        emp_id: string
        name: string
        email: string
        phone: string
        department_id: string
        academic_year_id: string
        created_at: string
        updated_at: string
      }
    }>
  }
}

// Auth-related types
export interface AuthUser {
  id: string
  email: string
  app_metadata: {
    provider: string
    providers: string[]
    role: UserRole
    department_id: string | null
  }
  user_metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: AuthUser
}

// UI/Component types
export interface FilterOptions {
  department?: string
  program?: string
  subject?: string
  status?: string
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
}

// Upload & Approval Workflow Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ApprovalEntityType = 'new_course' | 'new_student' | 'new_enrollment'

export interface UploadBatch {
  id: string
  uploaded_by_faculty_id: string
  file_name: string
  file_type: 'xlsx' | 'csv'
  row_count: number
  status: 'processing' | 'awaiting_approval' | 'partially_applied' | 'completed' | 'failed'
  created_at: string
}

export interface ApprovalRequest {
  id: string
  batch_id: string
  entity_type: ApprovalEntityType
  status: ApprovalStatus
  // Snapshot of the parsed row(s), shown to the approver for review
  payload: {
    subject_code?: string
    subject_name?: string
    student_name?: string
    register_no?: string
    program?: string
    mobile_no?: string
    email_id?: string
  }
  raised_by_faculty_id: string
  reviewed_by_user_id: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
}

export interface AppNotification {
  id: string
  recipient_role: 'faculty' | 'hod' | 'dean' | 'admin'
  recipient_id: string
  title: string
  body: string
  link: string
  read: boolean
  created_at: string
}