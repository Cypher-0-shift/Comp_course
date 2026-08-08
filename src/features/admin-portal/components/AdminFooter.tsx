import { Shield, HelpCircle, FileText } from 'lucide-react'

export function AdminFooter() {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-xs text-slate-500">
      <div className="mx-auto flex max-w-full flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300">Compensatory Course Dashboard</span>
          <span>&bull;</span>
          <span>&copy; {new Date().getFullYear()} Executive Administration</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#policy"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 transition hover:text-violet-400"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Institutional Policy</span>
          </a>
          <a
            href="#guidelines"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 transition hover:text-violet-400"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Academic Regulations</span>
          </a>
          <a
            href="#support"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 transition hover:text-violet-400"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Admin Support</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
