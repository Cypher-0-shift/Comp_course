// Shared TypeScript types for the Compensatory Course Dashboard (3-Table Flat Schema)

export type UserRole = 'student' | 'faculty' | 'hod' | 'dean'

export interface PaginationState {
  page: number
  pageSize: number
  total?: number
}

export interface FilterOptions {
  [key: string]: string | undefined
}

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

// End of types