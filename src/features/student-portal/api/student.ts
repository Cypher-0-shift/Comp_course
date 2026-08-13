import { StudentWithRelations, EnrollmentWithRelations } from '@/shared/types'

// Local DB Row interfaces for Supabase queries
interface StudentEnrollmentDbRow {
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
  credits?: string | number | null
}

interface FacultyAssignmentDbRow {
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
import { supabase } from '@/shared/hooks/useSupabase'

// ---------------------------------------------------------------------------
// getStudentProfile
// ---------------------------------------------------------------------------
// Fetches real student profile data. Source of truth:
//   1. Auth user_metadata (name, register_no, mobile, section, program, dept)
//   2. student_enrollments table (first matching row by email or register_no)
// No hardcoded values. Throws if user is not authenticated.
// ---------------------------------------------------------------------------

export async function getStudentProfile(): Promise<StudentWithRelations | null> {
  const { data: userRes, error: userError } = await supabase.auth.getUser()

  if (userError || !userRes?.user) {
    throw new Error('Not authenticated. Please log in.')
  }

  const user = userRes.user
  const meta = (user.user_metadata ?? {}) as Record<string, string>

  // Build profile from auth metadata first (always available if user exists)
  const baseProfile: StudentWithRelations = {
    id: user.id,
    user_id: user.id,
    register_no: meta.register_no ?? meta.registration_number ?? '',
    name: meta.name ?? meta.full_name ?? '',
    program: meta.program ?? meta.degree ?? '',
    mobile: meta.mobile_no ?? meta.mobile ?? meta.phone ?? '',
    email: user.email ?? '',
    section: meta.section ?? '',
    department_id: meta.department_id ?? '',
    academic_year_id: meta.academic_year_id ?? '',
    created_at: user.created_at ?? '',
    updated_at: user.updated_at ?? user.created_at ?? '',
    department: meta.department_name || meta.department
      ? {
          id: meta.department_id ?? '',
          name: meta.department_name ?? meta.department ?? '',
          code: meta.department_code ?? '',
          academic_year_id: meta.academic_year_id ?? '',
          created_at: '',
          updated_at: '',
        }
      : undefined,
  }

  // Attempt to enrich from student_enrollments (first matching row)
  try {
    let dbRow: StudentEnrollmentDbRow | null = null

    // Try by email first
    if (user.email) {
      const { data: byEmail } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('email_id', user.email)
        .limit(1)
        .maybeSingle()

      if (byEmail) dbRow = byEmail as StudentEnrollmentDbRow
    }

    // If no email match, try by register_no
    if (!dbRow && baseProfile.register_no) {
      const { data: byReg } = await supabase
        .from('student_enrollments')
        .select('*')
        .eq('register_no', baseProfile.register_no)
        .limit(1)
        .maybeSingle()

      if (byReg) dbRow = byReg as StudentEnrollmentDbRow
    }

    if (dbRow) {
      // Enrich with DB values — prefer DB over metadata where available
      if (dbRow.student_name) baseProfile.name = dbRow.student_name
      if (dbRow.register_no) baseProfile.register_no = dbRow.register_no
      if (dbRow.program) baseProfile.program = dbRow.program
      if (dbRow.mobile_no) baseProfile.mobile = dbRow.mobile_no
      if (dbRow.email_id) baseProfile.email = dbRow.email_id
    }
  } catch (err) {
    // DB enrichment failed — continue with auth metadata only
    console.warn('[student.ts] student_enrollments query failed:', err)
  }

  return baseProfile
}

// ---------------------------------------------------------------------------
// getStudentEnrollments
// ---------------------------------------------------------------------------
// Fetches all real enrollment rows for this student from student_enrollments.
// Joins faculty_assignments by subject_code.
// Returns empty array (not fallback data) if no rows found.
// Throws if user is not authenticated.
// ---------------------------------------------------------------------------

export async function getStudentEnrollments(): Promise<EnrollmentWithRelations[]> {
  const { data: userRes, error: userError } = await supabase.auth.getUser()

  if (userError || !userRes?.user) {
    throw new Error('Not authenticated. Please log in.')
  }

  const user = userRes.user
  const meta = (user.user_metadata ?? {}) as Record<string, string>
  const registerNo = meta.register_no ?? meta.registration_number ?? ''

  let rows: StudentEnrollmentDbRow[] = []

  // Query by email
  if (user.email) {
    const { data, error } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('email_id', user.email)

    if (error) {
      console.error('[student.ts] Error fetching enrollments by email:', error)
    } else if (data && data.length > 0) {
      rows = data
    }
  }

  // If nothing found by email, try register_no
  if (rows.length === 0 && registerNo) {
    const { data, error } = await supabase
      .from('student_enrollments')
      .select('*')
      .eq('register_no', registerNo)

    if (error) {
      console.error('[student.ts] Error fetching enrollments by register_no:', error)
    } else if (data) {
      rows = data
    }
  }

  // No enrollments found — return empty (no fake data)
  if (rows.length === 0) {
    return []
  }

  // Collect unique subject codes for faculty lookup
  const subjectCodes = [...new Set(rows.map((r) => r.subject_code).filter(Boolean))] as string[]

  // Fetch faculty assignments for these subject codes
  const facultyMap = new Map<string, FacultyAssignmentDbRow>()
  if (subjectCodes.length > 0) {
    const { data: facData, error: facError } = await supabase
      .from('faculty_assignments')
      .select('*')
      .in('subject_code', subjectCodes)

    if (facError) {
      console.warn('[student.ts] faculty_assignments query failed:', facError)
    } else if (facData) {
      facData.forEach((f) => {
        if (f.subject_code) {
          facultyMap.set(f.subject_code as string, f)
        }
      })
    }
  }

  // Map DB rows → EnrollmentWithRelations
  return rows.map((item): EnrollmentWithRelations => {
    const fac = facultyMap.get(item.subject_code)

    const facultyRecord = fac
      ? {
          id: fac.id ?? fac.emp_id ?? '',
          user_id: fac.emp_id ?? '',
          emp_id: fac.emp_id ?? '',
          name: fac.faculty_name ?? '',
          email: fac.email_id ?? '',
          phone: fac.mobile_number ?? '',
          department_id: fac.department ?? '',
          academic_year_id: '',
          created_at: fac.created_at ?? '',
          updated_at: fac.updated_at ?? fac.created_at ?? '',
        }
      : undefined

    const facultySubjects = facultyRecord
      ? [
          {
            id: `${item.subject_code}-${facultyRecord.emp_id}`,
            faculty_id: facultyRecord.emp_id,
            subject_id: item.subject_code ?? '',
            created_at: '',
            updated_at: '',
            faculty: facultyRecord,
          },
        ]
      : []

    return {
      id: item.id ?? '',
      student_id: item.id ?? '',
      subject_id: item.subject_code ?? '',
      academic_year_id: '',
      status: item.status ?? 'enrolled',
      created_at: item.created_at ?? '',
      updated_at: item.updated_at ?? item.created_at ?? '',
      subject: {
        id: item.subject_code ?? '',
        code: item.subject_code ?? '',
        name: item.subject_name ?? '',
        credits: item.credits ? Number(item.credits) : 0,
        department_id: '',
        academic_year_id: '',
        created_at: '',
        updated_at: '',
        faculty_subjects: facultySubjects,
      },
    }
  })
}
