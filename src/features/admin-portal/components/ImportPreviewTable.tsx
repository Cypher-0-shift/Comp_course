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
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-3 py-2 text-left text-slate-400 font-semibold">Row</th>
            <th className="px-3 py-2 text-left text-slate-400 font-semibold">Status</th>
            {allKeys.map((k) => (
              <th key={k} className="px-3 py-2 text-left text-slate-400 font-semibold whitespace-nowrap">
                {k}
              </th>
            ))}
            <th className="px-3 py-2 text-left text-slate-400 font-semibold">Errors</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.rowIndex}
              className={cn(
                'border-b border-white/5',
                row.valid ? '' : 'bg-red-500/5'
              )}
            >
              <td className="px-3 py-2 text-slate-500">{row.rowIndex}</td>
              <td className="px-3 py-2">
                {row.valid ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                )}
              </td>
              {allKeys.map((k) => (
                <td key={k} className={cn('px-3 py-2 whitespace-nowrap', row.valid ? 'text-slate-300' : 'text-slate-400')}>
                  {row.data[k] || '—'}
                </td>
              ))}
              <td className="px-3 py-2 text-red-400">
                {row.errors?.join('; ') || ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
