import React, { useRef, useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2, XCircle, Loader2, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useDataImport, type ImportType } from '../api/useDataImport'
import { validateUploadedFile } from '@/shared/utils/validation'
import { ImportPreviewTable } from './ImportPreviewTable'
import { ImportVerificationModal } from './ImportVerificationModal'
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
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  async function handleExecuteImport(passcode: string) {
    await importMutation.mutateAsync(passcode)
    setIsModalOpen(false)
  }

  const importResult = importMutation.data

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <span>Data Import</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> 2-Layer Verified
          </span>
        </h1>
        <p className="text-sm text-slate-500">
          Upload CSV files to populate departments, faculty, or student data for the active academic year.
        </p>
      </div>

      {/* Prominent Data Replacement Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Notice: Data Replacement Policy</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Uploading and confirming a new dataset will <strong className="text-amber-950 underline font-semibold">REPLACE ALL EXISTING RECORDS</strong> for the selected category (Departments, Faculty, or Students). Ensure your CSV contains the complete master dataset.
        </p>
      </div>

      {/* Step 1: Choose type */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">1. Select Import Type</h2>
        <div className="flex flex-wrap gap-2">
          {IMPORT_TYPES.map((t) => (
            <button
              key={t.id}
              id={`import-type-${t.id}`}
              onClick={() => { setSelectedType(t.id); reset(); setFileName(null) }}
              className={cn(
                'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition cursor-pointer',
                selectedType === t.id
                  ? 'border-indigo-500 bg-indigo-50/80 text-indigo-700 font-semibold shadow-2xs'
                  : 'border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className="font-medium">{t.label}</span>
              <span className="text-xs opacity-80">{t.description}</span>
            </button>
          ))}
        </div>

        {/* CSV format hint */}
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2">
          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600">
            Expected CSV columns:{' '}
            <code className="text-indigo-600 font-mono font-semibold">
              {IMPORT_TYPES.find((t) => t.id === selectedType)?.csvHeaders}
            </code>
          </span>
        </div>
      </div>

      {/* Step 2: Upload file */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">2. Upload CSV File</h2>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition cursor-pointer',
            fileError ? 'border-red-300 bg-red-50/50' : 'border-slate-200 hover:border-indigo-400/60 hover:bg-indigo-50/30'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-slate-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-800">
              {fileName ? fileName : 'Drop CSV here or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supported: .csv, .xlsx — Max 10MB</p>
          </div>
          {fileError && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
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
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">3. Preview & Validate</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> {validCount} valid
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-600 font-semibold">
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
              onClick={() => setIsModalOpen(true)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition cursor-pointer shadow-sm',
                validCount > 0 && !importMutation.isPending && !importMutation.isSuccess
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-950/20'
                  : 'cursor-not-allowed bg-slate-100 text-slate-400'
              )}
            >
              {importMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {importMutation.isSuccess ? 'Imported!' : `Import ${validCount} Valid Rows`}
            </button>
            <button
              id="import-reset-btn"
              onClick={() => { reset(); setFileName(null) }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 px-3.5 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
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

      {/* Layer 2 Execution Verification Modal */}
      <ImportVerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleExecuteImport}
        importType={selectedType}
        rowCount={validCount}
        isPending={importMutation.isPending}
      />
    </div>
  )
}
