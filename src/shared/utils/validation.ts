export type ImportType = 'students' | 'faculty' | 'departments'

export interface ParsedRow {
  rowIndex: number
  data: Record<string, string>
  valid: boolean
  errors?: string[]
}

export interface ImportResult {
  inserted: number
  skipped: number
  errors: string[]
}

export function validateStudentRow(row: Record<string, string>): { success: true; data: Record<string, string> } | { success: false; errors: string[] } {
  return { success: true, data: row }
}

export function validateFacultyRow(row: Record<string, string>): { success: true; data: Record<string, string> } | { success: false; errors: string[] } {
  return { success: true, data: row }
}

export function validateDepartmentRow(row: Record<string, string>): { success: true; data: Record<string, string> } | { success: false; errors: string[] } {
  return { success: true, data: row }
}

export const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls']
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File too large. Max size is 10MB` }
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` }
  }

  return { valid: true }
}
