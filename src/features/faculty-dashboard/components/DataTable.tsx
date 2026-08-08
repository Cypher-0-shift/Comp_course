import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/shared/utils/cn'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react'

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
  renderExpandedRow?: (row: T) => React.ReactNode
  rowKey: (row: T) => string
  sortKey?: string
  sortDir?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyMessage?: string
  chunkSize?: number
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="animate-pulse border-b border-slate-800/60">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 rounded-full bg-slate-800/60" />
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
  renderExpandedRow,
  rowKey,
  sortKey,
  sortDir,
  onSort,
  emptyMessage = 'No records found',
  chunkSize = 40,
}: DataTableProps<T>) {
  const [visibleCount, setVisibleCount] = useState(chunkSize)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
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

  function toggleRowExpand(key: string, row: T, e: React.MouseEvent) {
    if (renderExpandedRow) {
      e.stopPropagation()
      setExpandedKeys((prev) => {
        const next = new Set(prev)
        if (next.has(key)) {
          next.delete(key)
        } else {
          next.add(key)
        }
        return next
      })
    }
    if (onRowClick) {
      onRowClick(row)
    }
  }

  const visibleRows = rows.slice(0, visibleCount)
  const hasMore = visibleCount < rows.length

  const totalCols = renderExpandedRow ? columns.length + 1 : columns.length

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="w-full overflow-x-auto rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 shadow-xl backdrop-blur min-h-[480px] max-h-[75vh] overflow-y-auto"
      >
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800">
            <tr>
              {renderExpandedRow && (
                <th className="w-10 px-3 py-3.5 text-center text-slate-500 font-semibold select-none">
                  {/* Indicator col */}
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-4 md:py-3.5 font-bold uppercase tracking-wider text-[11px] text-indigo-300 select-none whitespace-nowrap',
                    col.sortable && onSort && 'cursor-pointer hover:text-white transition-colors',
                    col.className
                  )}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && onSort && (
                      <span className="text-indigo-400">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp className="h-3.5 w-3.5 text-indigo-300" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-indigo-300" />
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
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} cols={totalCols} />
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-4 py-16 text-center text-slate-400 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {visibleRows.map((row) => {
                  const key = rowKey(row)
                  const isExpanded = expandedKeys.has(key)

                  return (
                    <React.Fragment key={key}>
                      <tr
                        className={cn(
                          'group transition-colors duration-150',
                          (onRowClick || renderExpandedRow) &&
                            'cursor-pointer hover:bg-indigo-600/10 hover:border-indigo-500/30',
                          isExpanded && 'bg-indigo-950/30 border-indigo-500/40'
                        )}
                        onClick={(e) => toggleRowExpand(key, row, e)}
                      >
                        {renderExpandedRow && (
                          <td className="px-3 py-4 md:py-3.5 text-center text-slate-400">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800/80 text-slate-300 transition group-hover:bg-indigo-600 group-hover:text-white">
                              <ChevronRight
                                className={cn(
                                  'h-3.5 w-3.5 transition-transform duration-200',
                                  isExpanded && 'rotate-90 text-white'
                                )}
                              />
                            </span>
                          </td>
                        )}
                        {columns.map((col) => {
                          const raw = (row as Record<string, unknown>)[col.key]
                          return (
                            <td
                              key={col.key}
                              className={cn(
                                'px-4 py-4 whitespace-nowrap text-slate-300 font-medium',
                                col.className
                              )}
                            >
                              {col.render ? col.render(raw, row) : (raw as React.ReactNode) ?? '—'}
                            </td>
                          )
                        })}
                      </tr>

                      {/* Inline Expanded Accordion Details Row */}
                      {renderExpandedRow && isExpanded && (
                        <tr className="bg-slate-950/60 border-b border-indigo-500/20">
                          <td colSpan={totalCols} className="p-0">
                            <div className="p-4 sm:p-5 border-l-4 border-indigo-500 animate-in slide-in-from-top-2 duration-200">
                              {renderExpandedRow(row)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })}
                {hasMore && (
                  <tr ref={sentinelRef} className="border-b border-slate-800/50">
                    <td colSpan={totalCols} className="px-4 py-3 text-center text-xs text-slate-500 italic">
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
        <div className="flex items-center justify-between px-2 text-xs text-slate-400 font-medium">
          <span>
            Showing <strong className="text-indigo-400">{visibleRows.length}</strong> of{' '}
            <strong className="text-slate-200">{rows.length}</strong> records
          </span>
          {hasMore && <span className="text-slate-500">Scroll down for full record stream</span>}
        </div>
      )}
    </div>
  )
}
