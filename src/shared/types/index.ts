// Shared TypeScript types for the Compensatory Course Dashboard
// Mirrors the Supabase database schema from CONTEXT.md

export type UserRole = 'student' | 'faculty' | 'hod' | 'dean'

export interface AcademicYear {
  id: string
  start_year: number
  end_year: number
  is_active: boolean
  label: string
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  academic_year_id: string
  created_at: string
  updated_at: string
}

export interface Faculty {
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

export interface Subject {
  id: string
  code: string
  name: string
  department_id: string
  academic_year_id: string
  created_at: string
  updated_at: string
}

export interface FacultySubject {
  id: string
  faculty_id: string
  subject_id: string
  created_at: string
  updated_at: string
}

export interface Student {
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
}

export interface Enrollment {
  id: string
  student_id: string
  subject_id: string
  academic_year_id: string
  status: 'enrolled' | 'completed' | 'dropped'
  created_at: string
  updated_at: string
}

// Extended types with relations for API responses
export interface StudentWithRelations extends Student {
  department?: Department
  academic_year?: AcademicYear
  enrollments?: EnrollmentWithRelations[]
}

export interface EnrollmentWithRelations extends Enrollment {
  student?: Student
  subject?: Subject
  academic_year?: AcademicYear
}

export interface FacultyWithRelations extends Faculty {
  department?: Department
  academic_year?: AcademicYear
  faculty_subjects?: FacultySubjectWithSubject[]
}

export interface FacultySubjectWithSubject extends FacultySubject {
  subject?: Subject
}

export interface SubjectWithRelations extends Subject {
  department?: Department
  academic_year?: AcademicYear
  faculty_subjects?: FacultySubjectWithFaculty[]
}

export interface FacultySubjectWithFaculty extends FacultySubject {
  faculty?: Faculty
}

export interface DepartmentWithCounts extends Department {
  students_registered?: number
  faculty_assignments?: FacultyWithRelations[]
  student_enrollments?: EnrollmentWithRelations[]
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