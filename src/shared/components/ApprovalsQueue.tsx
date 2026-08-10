import { useState } from 'react'
import { FileUp, Clock, CheckCircle2, XCircle, ChevronRight, Download } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/shared/hooks/useSupabase'

export function ApprovalsQueue({ role }: { role: 'faculty' | 'admin' | 'hod' | 'dean' }) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending')
  const supabase = useSupabase()

  const { data: batches = [] } = useQuery({
    queryKey: ['approvals-queue-batches', role],
    staleTime: 3 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from('student_enrollments')
        .select('subject_code, department_name, status, created_at')
        .order('created_at', { ascending: false })
        .limit(20)

      if (!data || data.length === 0) return []

      return data.map((r, i) => ({
        id: `batch-${i}`,
        fileName: `${r.subject_code || 'ENROLLMENT'}_List.csv`,
        date: new Date(r.created_at || Date.now()).toISOString().split('T')[0],
        status: r.status === 'enrolled' ? 'completed' : r.status === 'dropped' ? 'failed' : 'awaiting_approval',
        count: 1,
        type: 'enrollment_update',
      }))
    },
  })

  const pendingBatches = batches.filter(b => b.status === 'awaiting_approval' || b.status === 'processing')
  const historyBatches = batches.filter(b => b.status === 'completed' || b.status === 'failed' || b.status === 'partially_applied')

  const displayBatches = activeTab === 'pending' ? pendingBatches : historyBatches

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Header & Tabs */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="font-bold text-lg text-slate-800">
          {role === 'faculty' ? 'My Upload Batches' : 'Approval Requests'}
        </h3>
        
        <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'pending' ? 'bg-white text-[#001941] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'history' ? 'bg-white text-[#001941] shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {displayBatches.length > 0 ? (
          displayBatches.map(batch => (
            <div key={batch.id} className="group border border-slate-200 rounded-xl p-4 hover:border-[#001941]/30 hover:shadow-md transition-all bg-white cursor-pointer flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  batch.status === 'awaiting_approval' ? 'bg-amber-50 text-amber-600' :
                  batch.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-rose-50 text-rose-600'
                }`}>
                  {batch.status === 'awaiting_approval' ? <Clock className="w-6 h-6" /> :
                   batch.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                   <XCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 group-hover:text-[#001941] transition-colors flex items-center gap-2">
                    {batch.fileName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1"><FileUp className="w-3.5 h-3.5" /> {batch.count} Records</span>
                    <span>Uploaded: {batch.date}</span>
                    <span className="capitalize text-slate-400 border-l border-slate-300 pl-4">{batch.type.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  batch.status === 'awaiting_approval' ? 'bg-amber-100 text-amber-800' :
                  batch.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {batch.status.replace('_', ' ')}
                </span>
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-[#001941] group-hover:text-white group-hover:border-[#001941] transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mb-4">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-700">No {activeTab} batches</h4>
            <p className="text-sm text-slate-500 max-w-sm mt-1">
              {role === 'faculty' 
                ? "You haven't uploaded any data batches yet, or they have all been processed." 
                : "There are no pending requests requiring your approval at this time."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ClipboardCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}
