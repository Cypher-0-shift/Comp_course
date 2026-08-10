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
    <div className="lg-table-container overflow-x-auto">
      <table className="w-full text-xs text-left">
        <thead className="bg-white/80 border-b border-slate-200/80">
          <tr>
            <th className="px-3.5 py-3 text-left text-[#001941] font-bold uppercase tracking-wider">Row</th>
            <th className="px-3.5 py-3 text-left text-[#001941] font-bold uppercase tracking-wider">Status</th>
            {allKeys.map((k) => (
              <th key={k} className="px-3.5 py-3 text-left text-[#001941] font-bold uppercase tracking-wider whitespace-nowrap">
                {k}
              </th>
            ))}
            <th className="px-3.5 py-3 text-left text-[#001941] font-bold uppercase tracking-wider">Errors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60">
          {rows.map((row) => (
            <tr
              key={row.rowIndex}
              className={cn(
                'transition-colors',
                row.valid ? 'hover:bg-slate-50/80' : 'bg-rose-50/50'
              )}
            >
              <td className="px-3.5 py-2.5 text-slate-500 font-mono font-semibold">{row.rowIndex}</td>
              <td className="px-3.5 py-2.5">
                {row.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-600" />
                )}
              </td>
              {allKeys.map((k) => (
                <td key={k} className={cn('px-3.5 py-2.5 whitespace-nowrap font-medium', row.valid ? 'text-slate-800' : 'text-slate-900')}>
                  {row.data[k] || '—'}
                </td>
              ))}
              <td className="px-3.5 py-2.5 text-rose-600 font-semibold">
                {row.errors?.join('; ') || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
