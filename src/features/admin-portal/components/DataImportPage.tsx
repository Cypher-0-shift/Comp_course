import React, { useRef, useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react'
import { useDataImport, type ImportType } from '../api/useDataImport'
import { validateUploadedFile } from '@/shared/utils/validation'
import { ImportPreviewTable } from './ImportPreviewTable'
import { cn } from '@/shared/utils/cn'

const IMPORT_TYPES: { id: ImportType; label: string; description: string; csvHeaders: string }[] = [
  {
    id: 'departments',
    label: 'Departments',
    description: 'Upload department list',
    csvHeaders: 'name, code',
  },
  {
    id: 'faculty',
    label: 'Faculty',
    description: 'Upload faculty members',
    csvHeaders: 'emp_id, name, email, phone, department_code',
  },
  {
    id: 'students',
    label: 'Students',
    description: 'Upload student enrollments',
    csvHeaders: 'register_no, name, program, mobile, email, department_code',
  },
]

export function DataImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedType, setSelectedType] = useState<ImportType>('departments')
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const {
    preview,
    handleFileLoad,
    importMutation,
    reset,
    validCount,
    errorCount,
  } = useDataImport()

  function handleFile(file: File) {
    setFileError(null)
    const validation = validateUploadedFile(file)
    if (!validation.valid) {
      setFileError(validation.error ?? 'Invalid file')
      return
    }

    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      handleFileLoad(text, selectedType)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const importResult = importMutation.data

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-slate-100">Data Import</h1>
        <p className="text-sm text-slate-400">
          Upload CSV files to populate departments, faculty, or student data for the active academic year.
        </p>
      </div>

      {/* Step 1: Choose type */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">1. Select Import Type</h2>
        <div className="flex flex-wrap gap-2">
          {IMPORT_TYPES.map((t) => (
            <button
              key={t.id}
              id={`import-type-${t.id}`}
              onClick={() => { setSelectedType(t.id); reset(); setFileName(null) }}
              className={cn(
                'flex flex-col items-start rounded-lg border px-4 py-3 text-left transition',
                selectedType === t.id
                  ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-300'
                  : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200'
              )}
            >
              <span className="font-medium">{t.label}</span>
              <span className="text-xs opacity-70">{t.description}</span>
            </button>
          ))}
        </div>

        {/* CSV format hint */}
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/5 bg-white/5 px-3 py-2">
          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400">
            Expected CSV columns:{' '}
            <code className="text-indigo-300">
              {IMPORT_TYPES.find((t) => t.id === selectedType)?.csvHeaders}
            </code>
          </span>
        </div>
      </div>

      {/* Step 2: Upload file */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-300">2. Upload CSV File</h2>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition cursor-pointer',
            fileError ? 'border-red-400/40 bg-red-500/5' : 'border-white/10 hover:border-indigo-400/40 hover:bg-indigo-500/5'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-slate-500" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              {fileName ? fileName : 'Drop CSV here or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supported: .csv, .xlsx — Max 10MB</p>
          </div>
          {fileError && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <XCircle className="h-4 w-4" /> {fileError}
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          id="import-file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {/* Step 3: Preview */}
      {preview.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">3. Preview & Validate</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> {validCount} valid
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {errorCount} errors
                </span>
              )}
            </div>
          </div>

          <ImportPreviewTable rows={preview} />

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-3">
            <button
              id="import-confirm-btn"
              disabled={validCount === 0 || importMutation.isPending || importMutation.isSuccess}
              onClick={() => importMutation.mutate()}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition',
                validCount > 0 && !importMutation.isPending && !importMutation.isSuccess
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/50'
                  : 'cursor-not-allowed bg-white/5 text-slate-500'
              )}
            >
              {importMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {importMutation.isSuccess ? 'Imported!' : `Import ${validCount} Valid Rows`}
            </button>
            <button
              id="import-reset-btn"
              onClick={() => { reset(); setFileName(null) }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 transition hover:border-white/20 hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {importResult && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-2">
            <CheckCircle2 className="h-4 w-4" /> Import Complete
          </div>
          <p className="text-sm text-slate-300">
            {importResult.inserted} rows imported · {importResult.skipped} skipped
          </p>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {importResult.errors.map((e, i) => (
                <li key={i} className="text-xs text-red-400">• {e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {importMutation.isError && (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertCircle className="inline h-4 w-4 mr-1" />
          {(importMutation.error as Error)?.message ?? 'Import failed'}
        </div>
      )}
    </div>
  )
}
