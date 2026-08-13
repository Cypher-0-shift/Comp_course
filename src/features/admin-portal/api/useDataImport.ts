import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'
import { validateStudentRow, validateFacultyRow, validateDepartmentRow } from '@/shared/utils/validation'
import type { ImportType, ParsedRow, ImportResult } from '@/shared/utils/validation'
import { SafeError } from '@/shared/utils/error-handler'

export type { ImportType, ParsedRow, ImportResult }

export function useDataImport() {
  const supabase = useSupabase()
  const [preview, setPreview] = useState<ParsedRow[]>([])
  const [importType, setImportType] = useState<ImportType | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({})

  function parseCSV(text: string): string[][] {
    const lines = text.trim().split('\n')
    return lines.map((line) =>
      line.split(',').map((cell) => cell.trim().replace(/^"(.*)"$/, '$1'))
    )
  }

  function validateRows(rows: string[][], type: ImportType): { parsed: ParsedRow[]; errors: Record<number, string[]> } {
    const parsed: ParsedRow[] = []
    const errors: Record<number, string[]> = {}

    const [header, ...dataRows] = rows

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      if (row.every((cell) => !cell)) continue // skip blank rows

      const obj: Record<string, string> = {}
      header.forEach((col, idx) => { obj[col.toLowerCase().trim()] = row[idx] ?? '' })

      let result
      if (type === 'students') result = validateStudentRow(obj)
      else if (type === 'faculty') result = validateFacultyRow(obj)
      else result = validateDepartmentRow(obj)

      if (result.success) {
        parsed.push({ rowIndex: i + 1, data: result.data, valid: true })
      } else {
        parsed.push({ rowIndex: i + 1, data: obj, valid: false, errors: result.errors })
        errors[i + 1] = result.errors
      }
    }

    return { parsed, errors }
  }

  function handleFileLoad(text: string, type: ImportType) {
    const rows = parseCSV(text)
    const { parsed, errors } = validateRows(rows, type)
    setPreview(parsed)
    setImportType(type)
    setValidationErrors(errors)
  }

  const importMutation = useMutation({
    mutationFn: async (passcode: string) => {
      if (!importType) throw new SafeError('No import type selected')

      const validRows = preview.filter((r) => r.valid).map((r) => r.data)
      if (validRows.length === 0) throw new SafeError('No valid rows to import')

      // Server-side verification via Supabase RPC (passcode stored as Supabase secret, never in bundle)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.rpc as any)('import_data_with_verification', {
        p_passcode: passcode,
        p_import_type: importType,
        p_rows: validRows,
      })

      if (error) {
        // Surface a safe error message; do not expose raw DB error details
        throw new SafeError(
          error.message?.includes('invalid passcode') || error.message?.includes('denied')
            ? 'Invalid Security Verification Passcode. Data import denied.'
            : 'Import failed. Please check your passcode and try again.'
        )
      }

      if (!data) {
        throw new SafeError('No response from import function. Please contact the administrator.')
      }

      return data as ImportResult
    },
  })

  function reset() {
    setPreview([])
    setImportType(null)
    setValidationErrors({})
    importMutation.reset()
  }

  return {
    preview,
    importType,
    validationErrors,
    handleFileLoad,
    importMutation,
    reset,
    hasErrors: Object.keys(validationErrors).length > 0,
    validCount: preview.filter((r) => r.valid).length,
    errorCount: preview.filter((r) => !r.valid).length,
  }
}
