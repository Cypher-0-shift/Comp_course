import { z } from 'zod'

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

const departmentRowSchema = z.object({
  name: z.string().min(2).max(100),
  code: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/, 'Department code must be uppercase alphanumeric'),
})

const facultyRowSchema = z.object({
  emp_id: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/, 'Employee ID must be uppercase alphanumeric'),
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format'),
  department_code: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/, 'Department code must be uppercase alphanumeric'),
})

const studentRowSchema = z.object({
  register_no: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/, 'Register No must be uppercase alphanumeric'),
  name: z.string().min(2).max(100),
  program: z.string().min(2).max(50),
  mobile: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid mobile number format'),
  email: z.string().email().max(255),
  department_code: z.string().min(2).max(10).regex(/^[A-Z0-9]+$/, 'Department code must be uppercase alphanumeric'),
})

export function validateStudentRow(row: Record<string, string>): { success: true; data: Record<string, string> } | { success: false; errors: string[] } {
  const result = studentRowSchema.safeParse(row)
  if (result.success) return { success: true, data: result.data }
  return { success: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) }
}

export function validateFacultyRow(row: Record<string, string>): { success: true; data: Record<string, string> } | { success: false; errors: string[] } {
  const result = facultyRowSchema.safeParse(row)
  if (result.success) return { success: true, data: result.data }
  return { success: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) }
}

export function validateDepartmentRow(row: Record<string, string>): { success: true; data: Record<string, string> } | { success: false; errors: string[] } {
  const result = departmentRowSchema.safeParse(row)
  if (result.success) return { success: true, data: result.data }
  return { success: false, errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`) }
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

/**
 * Validates a file's content based on its magic bytes.
 * PDF: 25 50 44 46 (%PDF)
 * DOCX/XLSX (ZIP): 50 4B 03 04 (PK\x03\x04)
 * CSV: Checked via ascii printable charset (heuristic)
 */
export async function validateFileContent(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      if (!e.target || !e.target.result) return resolve(false);
      
      const arr = new Uint8Array(e.target.result as ArrayBuffer);
      if (arr.length < 4) return resolve(false);

      const header = Array.from(arr.subarray(0, 4))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('').toUpperCase();
      
      if (header === '25504446') return resolve(true); // PDF
      if (header === '504B0304') return resolve(true); // DOCX, XLSX

      // For CSV, check if the first 100 bytes (or file size if smaller) are valid printable ASCII/UTF8 chars
      // We'll just allow basic ascii text: 0x09 (tab), 0x0A (LF), 0x0D (CR), 0x20-0x7E
      let isText = true;
      for (let i = 0; i < Math.min(arr.length, 100); i++) {
        const b = arr[i];
        if (b !== 0x09 && b !== 0x0A && b !== 0x0D && (b < 0x20 || b > 0x7E)) {
          isText = false;
          break;
        }
      }
      
      resolve(isText);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 100));
  });
}

