import { CheckCircle2, XCircle } from 'lucide-react'
import type { ParsedRow } from '@/shared/utils/validation'
import { cn } from '@/shared/utils/cn'

interface ImportPreviewTableProps {
  rows: ParsedRow[]
}

export function ImportPreviewTable({ rows }: ImportPreviewTableProps) {
  if (rows.length === 0) return null

  const allKeys = Object.keys(rows[0].data)

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-xl">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-950/90 border-b border-slate-800">
          <tr>
            <th className="px-3.5 py-3 text-left text-indigo-300 font-bold uppercase tracking-wider">Row</th>
            <th className="px-3.5 py-3 text-left text-indigo-300 font-bold uppercase tracking-wider">Status</th>
            {allKeys.map((k) => (
              <th key={k} className="px-3.5 py-3 text-left text-indigo-300 font-bold uppercase tracking-wider whitespace-nowrap">
                {k}
              </th>
            ))}
            <th className="px-3.5 py-3 text-left text-indigo-300 font-bold uppercase tracking-wider">Errors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {rows.map((row) => (
            <tr
              key={row.rowIndex}
              className={cn(
                'transition-colors',
                row.valid ? 'hover:bg-indigo-900/30' : 'bg-red-500/10'
              )}
            >
              <td className="px-3.5 py-2.5 text-slate-400 font-mono">{row.rowIndex}</td>
              <td className="px-3.5 py-2.5">
                {row.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
              </td>
              {allKeys.map((k) => (
                <td key={k} className={cn('px-3.5 py-2.5 whitespace-nowrap font-medium', row.valid ? 'text-slate-200' : 'text-slate-300')}>
                  {row.data[k] || '—'}
                </td>
              ))}
              <td className="px-3.5 py-2.5 text-red-400 font-medium">
                {row.errors?.join('; ') || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
