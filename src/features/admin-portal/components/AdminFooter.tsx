import { ShieldCheck, Sparkles } from 'lucide-react'

export function AdminFooter() {
  return (
    <footer className="lg-footer py-4 px-6 mt-auto">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 md:flex-row text-xs">

        {/* Left: Portal identity */}
        <div className="flex items-center gap-2 text-slate-600">
          <ShieldCheck className="h-4 w-4 text-[#001941] shrink-0" />
          <span className="font-bold text-[#001941]">Executive Administration</span>
          <span className="text-slate-400">&bull;</span>
          <span>&copy; {new Date().getFullYear()} Compensatory Course Dashboard</span>
        </div>

        {/* Right: Attribution pill */}
        <div className="lg-pill-slate flex items-center gap-1.5 px-3.5 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#001941] shrink-0" />
          <span className="text-slate-600">
            Developed by{' '}
            <strong className="text-[#001941] font-bold">Sanjay Ganesh</strong> &{' '}
            <strong className="text-[#001941] font-bold">Tushar Sinha</strong>{' '}
            (3rd Year AIML) under the guidance of{' '}
            <strong className="text-[#001941] font-bold">Dr. Vinoth R</strong>
          </span>
        </div>
      </div>
    </footer>
  )
}
