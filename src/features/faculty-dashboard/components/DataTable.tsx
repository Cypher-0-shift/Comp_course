import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export interface ColumnDef<T> {
  key: string
  header: string
  render?: (value: unknown, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  rows: T[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
  rowKey: (row: T) => string
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  chunkSize?: number
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse border-b border-white/5">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded-full bg-white/10" />
        </td>
      ))}
    </tr>
  )
}

export function DataTable<T extends object>({
  columns,
  rows,
  isLoading,
  onRowClick,
  rowKey,
  sortKey,
  sortDir,
  onSort,
  emptyMessage = 'No records found',
  chunkSize = 40,
}: DataTableProps<T>) {
  const [visibleCount, setVisibleCount] = useState(chunkSize)
  const sentinelRef = useRef<HTMLTableRowElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Reset visibleCount and scroll position when rows array changes (e.g. search or filter)
  useEffect(() => {
    setVisibleCount(chunkSize)
    if (containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [rows, chunkSize])

  // IntersectionObserver to load next chunk of rows seamlessly as user scrolls down
  useEffect(() => {
    if (visibleCount >= rows.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + chunkSize, rows.length))
        }
      },
      { rootMargin: '200px' }
    )

    const el = sentinelRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [visibleCount, rows.length, chunkSize])

  const visibleRows = rows.slice(0, visibleCount)
  const hasMore = visibleCount < rows.length

  return (
    <div className="flex flex-col gap-2.5">
      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur max-h-[70vh] overflow-y-auto"
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-white/10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-semibold text-slate-300 select-none whitespace-nowrap',
                    col.sortable && onSort && 'cursor-pointer hover:text-white transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && onSort && (
                      <span className="text-slate-500">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5" />
                        )}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-slate-400 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {visibleRows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    className={cn(
                      'border-b border-white/5 transition-colors duration-150',
                      onRowClick &&
                        'cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-400/20'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((col) => {
                      const raw = (row as Record<string, unknown>)[col.key]
                      return (
                        <td
                          key={col.key}
                          className={cn('px-4 py-3 text-slate-200 whitespace-nowrap', col.className)}
                        >
                          {col.render ? col.render(raw, row) : (raw as React.ReactNode) ?? '—'}
                        </td>
                      )
                    })}
                  </tr>
                ))}
                {hasMore && (
                  <tr ref={sentinelRef} className="border-b border-white/5">
                    <td colSpan={columns.length} className="px-4 py-3 text-center text-xs text-slate-500 italic">
                      Loading more records…
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Record Counter Badge */}
      {!isLoading && rows.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{visibleRows.length}</strong> of{' '}
            <strong className="text-slate-200">{rows.length}</strong> records
          </span>
          {hasMore && <span className="text-slate-500">Scroll down to view more</span>}
        </div>
      )}
    </div>
  )
}
