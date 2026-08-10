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
        <h1 className="text-2xl font-bold text-[#001941] flex items-center gap-2 tracking-tight">
          <span>Data Import</span>
          <span className="lg-pill-slate flex items-center gap-1 text-[11px] font-bold text-[#001941] px-2.5 py-0.5">
            <ShieldCheck className="h-3 w-3 text-[#001941]" /> 2-Layer Verified
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload CSV files to populate departments, faculty, or student data for the active academic year.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="rounded-2xl border border-amber-300/80 bg-amber-50/70 backdrop-blur-md p-4 text-amber-900 shadow-sm">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>Notice: Data Replacement Policy</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed font-medium">
          Uploading and confirming a new dataset will <strong className="text-amber-950 underline font-bold">REPLACE ALL EXISTING RECORDS</strong> for the selected category (Departments, Faculty, or Students). Ensure your CSV contains the complete master dataset.
        </p>
      </div>

      {/* Step 1: Choose type */}
      <div className="lg-card p-6">
        <h2 className="mb-3 text-sm font-bold text-[#001941]">1. Select Import Type</h2>
        <div className="flex flex-wrap gap-3">
          {IMPORT_TYPES.map((t) => (
            <button
              key={t.id}
              id={`import-type-${t.id}`}
              onClick={() => { setSelectedType(t.id); reset(); setFileName(null) }}
              className={cn(
                'flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition cursor-pointer',
                selectedType === t.id
                  ? 'border-[#001941]/40 bg-[#001941]/10 text-[#001941] font-bold shadow-xs'
                  : 'border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-white/60'
              )}
            >
              <span className="font-semibold text-sm">{t.label}</span>
              <span className="text-xs text-slate-500">{t.description}</span>
            </button>
          ))}
        </div>

        {/* CSV format hint */}
        <div className="mt-4 flex items-center gap-2 lg-pill-slate px-3.5 py-2">
          <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 font-medium">
            Expected CSV columns:{' '}
            <code className="text-[#001941] font-mono font-bold">
              {IMPORT_TYPES.find((t) => t.id === selectedType)?.csvHeaders}
            </code>
          </span>
        </div>
      </div>

      {/* Step 2: Upload file */}
      <div className="lg-card p-6">
        <h2 className="mb-3 text-sm font-bold text-[#001941]">2. Upload CSV File</h2>
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition cursor-pointer',
            fileError ? 'border-rose-300 bg-rose-50/50' : 'border-slate-300/80 hover:border-[#001941]/40 hover:bg-white/60'
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-[#001941]" />
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">
              {fileName ? fileName : 'Drop CSV here or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Supported: .csv, .xlsx — Max 10MB</p>
          </div>
          {fileError && (
            <div className="flex items-center gap-2 text-rose-600 text-sm font-medium">
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
        <div className="lg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#001941]">3. Preview & Validate</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" /> {validCount} valid
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-rose-600 font-bold">
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
                'lg-btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {importMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {importMutation.isSuccess ? 'Imported!' : `Import ${validCount} Valid Rows`}
            </button>
            <button
              id="import-reset-btn"
              onClick={() => { reset(); setFileName(null) }}
              className="lg-btn-ghost flex items-center gap-1.5 px-3.5 py-2 text-sm text-slate-600 font-semibold cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {importResult && (
        <div className="rounded-2xl border border-emerald-300/80 bg-emerald-50/80 backdrop-blur-md p-4 text-emerald-950">
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
            <CheckCircle2 className="h-4 w-4" /> Import Complete
          </div>
          <p className="text-sm font-semibold text-emerald-900">
            {importResult.inserted} rows imported · {importResult.skipped} skipped
          </p>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {importResult.errors.map((e, i) => (
                <li key={i} className="text-xs text-rose-700 font-medium">• {e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {importMutation.isError && (
        <div className="rounded-2xl border border-rose-300/80 bg-rose-50/80 backdrop-blur-md p-4 text-sm text-rose-800 font-semibold">
          <AlertCircle className="inline h-4 w-4 mr-1.5" />
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
