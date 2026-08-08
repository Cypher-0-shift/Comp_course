import { ShieldCheck, Sparkles } from 'lucide-react'

export function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 py-4 px-6 text-xs text-slate-400">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="h-4 w-4 text-violet-400 shrink-0" />
          <span className="font-semibold text-slate-200">Executive Administration</span>
          <span>&bull;</span>
          <span>&copy; {new Date().getFullYear()} Compensatory Course Dashboard</span>
        </div>

        {/* Project Attribution Credits */}
        <div className="flex items-center gap-1.5 text-center text-slate-300 font-medium bg-slate-800/80 border border-slate-700/60 px-3.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span>
            Created by <strong className="text-white font-semibold">Sanjay Ganesh</strong> &{' '}
            <strong className="text-white font-semibold">Tushar Sinha</strong> (3rd Year AIML) under the guidance of{' '}
            <strong className="text-violet-400 font-semibold">Dr. Vinoth R</strong>
          </span>
        </div>
      </div>
    </footer>
  )
}
