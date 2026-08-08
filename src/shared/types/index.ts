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