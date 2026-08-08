import { useState } from 'react'
import { Plus, X, UploadCloud, FileText, CheckCircle2 } from 'lucide-react'

export function UploadFABModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [documentType, setDocumentType] = useState('syllabus')

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      setUploadSuccess(false)
    }
  }

  function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) return

    setIsUploading(true)
    setTimeout(() => {
      setIsUploading(false)
      setUploadSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        setSelectedFile(null)
        setUploadSuccess(false)
      }, 1500)
    }, 1200)
  }

  return (
    <>
      {/* Anchored Floating Action Button (FAB) at Bottom-Right */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="faculty-fab-upload-btn"
          onClick={() => setIsOpen(true)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-950/60 ring-2 ring-indigo-400/40 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95"
          aria-label="Upload document"
          title="Quick Upload Document"
        >
          <Plus className="h-6 w-6 transition-transform duration-200 group-hover:rotate-90" />
          <span className="absolute right-16 hidden whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-100 shadow-xl group-hover:block">
            Upload Document / Syllabus
          </span>
        </button>
      </div>

      {/* Upload Modal Backdrop & Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 ring-1 ring-indigo-500/30">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Upload Course Material</h3>
                  <p className="text-xs text-slate-400">Add documents, syllabus, or marks sheets</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Document Category
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="syllabus">Course Syllabus</option>
                  <option value="attendance">Attendance Register</option>
                  <option value="marks">Internal Evaluation / Marks</option>
                  <option value="notice">Department Circular</option>
                </select>
              </div>

              {/* Dropzone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Select File
                </label>
                <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/50 p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-950 transition">
                  <UploadCloud className="h-8 w-8 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-300">
                    {selectedFile ? selectedFile.name : 'Click to browse or drag & drop file'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">PDF, XLSX, CSV or DOCX up to 10MB</span>
                  <input type="file" onChange={handleFileSelect} className="hidden" accept=".pdf,.xlsx,.csv,.docx,.doc" />
                </label>
              </div>

              {/* Success Notification */}
              {uploadSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-medium text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Document uploaded successfully! Updating repository...</span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isUploading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-950/50 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5" />
                      <span>Submit Document</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
