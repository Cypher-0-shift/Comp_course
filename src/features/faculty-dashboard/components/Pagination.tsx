import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { PaginationState } from '@/shared/types'

interface PaginationProps {
  state: PaginationState
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

const PAGE_SIZES = [10, 20, 50, 100]

export function Pagination({ state, onPageChange, onPageSizeChange }: PaginationProps) {
  const { page, pageSize, total = 0 } = state
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-sm text-slate-400">
      {/* Row count summary */}
      <span>
        {total === 0 ? 'No results' : `Showing ${from}–${to} of ${total} records`}
      </span>

      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <label className="flex items-center gap-1.5">
          <span className="text-xs">Rows</span>
          <select
            id="pagination-page-size"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(0)
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-400/50"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* Prev / Next */}
        <div className="flex items-center gap-1">
          <button
            id="pagination-prev"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 transition',
              page === 0
                ? 'cursor-not-allowed opacity-30'
                : 'hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-300'
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          <span className="min-w-[3.5rem] text-center text-xs">
            {page + 1} / {totalPages}
          </span>

          <button
            id="pagination-next"
            disabled={page + 1 >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 transition',
              page + 1 >= totalPages
                ? 'cursor-not-allowed opacity-30'
                : 'hover:border-indigo-400/40 hover:bg-indigo-500/10 hover:text-indigo-300'
            )}
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
