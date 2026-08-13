import { useState, useRef } from 'react'
import { X, UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import Papa from 'papaparse'
import { toast } from 'sonner'

interface UploadDataModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadDataModal({ isOpen, onClose }: UploadDataModalProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Only CSV files are currently supported in the preview.')
      return
    }
    setFile(file)
    setIsProcessing(true)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPreviewData(results.data.slice(0, 5) as Record<string, unknown>[]) // Preview first 5 rows
        setIsProcessing(false)
      },
      error: (error) => {
        console.error(error)
        toast.error('Error parsing CSV file.')
        setIsProcessing(false)
      }
    })
  }

  const handleUploadSubmit = () => {
    if (!file) return
    toast.success('File uploaded successfully! Approval workflow initiated.')
    // In a real app, this would send the file to the backend
    setTimeout(() => {
      onClose()
      setFile(null)
      setPreviewData([])
    }, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-srm-on-surface/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!isProcessing) onClose()
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="lg-modal w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-[#001941] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Upload Enrollment Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {!file ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                dragActive ? 'border-[#001941] bg-[#001941]/5 scale-[1.02]' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleChange}
              />
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-100">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Drag and drop your file here</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                Upload a CSV file containing student enrollment records. Make sure it follows the standard template format.
              </p>
              <button 
                onClick={() => inputRef.current?.click()}
                className="bg-[#001941] text-white px-6 py-2.5 rounded-xl font-bold shadow hover:shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-emerald-900 break-words-safe">{file.name}</p>
                    <p className="text-xs text-emerald-700">Ready to upload • {(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setFile(null)
                    setPreviewData([])
                  }}
                  className="text-emerald-700 hover:text-emerald-900 text-sm font-semibold underline cursor-pointer shrink-0 ml-2"
                >
                  Change File
                </button>
              </div>

              {/* Data Preview */}
              {previewData.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                      Data Preview <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[10px] uppercase">First 5 Rows</span>
                    </h4>
                  </div>
                  <div className="table-container-safe">
                    <table className="w-full text-sm text-left whitespace-nowrap">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                          {Object.keys(previewData[0]).map(key => (
                            <th key={key} className="px-4 py-3 font-semibold">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewData.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            {Object.values(row).map((val: unknown, j) => (
                              <td key={j} className="px-4 py-2.5 text-slate-700 break-words-safe">{val as React.ReactNode}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Warning/Info Box */}
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-900 leading-relaxed break-words-safe">
                  <strong>Note:</strong> Once uploaded, these records will be sent to the HOD for approval. They will not reflect in the student portal until approved.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {file && (
          <div className="px-6 py-4 border-t border-white/40 flex justify-end gap-3" style={{ background: 'rgba(255, 255, 255, 0.40)' }}>
            <button
              onClick={() => {
                setFile(null)
                setPreviewData([])
              }}
              className="px-5 py-2.5 rounded-xl lg-btn-ghost text-slate-800 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl lg-btn-primary font-bold cursor-pointer flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Submit for Approval
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
