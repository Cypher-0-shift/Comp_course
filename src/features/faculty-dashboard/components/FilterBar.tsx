import * as Select from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import type { FilterOptions } from '@/shared/types'

export interface FilterOption {
  value: string
  label: string
}

export interface FilterBarConfig {
  department?: FilterOption[]
  program?: FilterOption[]
  subject?: FilterOption[]
  status?: FilterOption[]
}

interface FilterBarProps {
  filters: FilterOptions
  options: FilterBarConfig
  onChange: (key: keyof FilterOptions, value: string) => void
  onReset: () => void
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  options: FilterOption[]
  onChange: (value: string) => void
}

function SelectField({ id, label, value, options, onChange }: SelectFieldProps) {
  return (
    <Select.Root value={value || 'all'} onValueChange={(v) => onChange(v === 'all' ? '' : v)}>
      <Select.Trigger
        id={id}
        className={cn(
          'flex h-12 md:h-9 w-full md:w-auto md:min-w-[140px] items-center justify-between gap-1.5 rounded-lg',
          'border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm',
          'outline-none transition hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30',
          value && 'border-indigo-300 bg-indigo-50 text-indigo-700'
        )}
        aria-label={label}
      >
        <Select.Value placeholder={label} />
        <Select.Icon>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="z-50 min-w-[160px] max-h-[300px] overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="p-1">
            <Select.Item
              value="all"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 outline-none hover:bg-slate-50 hover:text-slate-900 data-[state=checked]:text-indigo-600 data-[state=checked]:font-medium"
            >
              <Select.ItemIndicator>
                <Check className="h-3.5 w-3.5" />
              </Select.ItemIndicator>
              <Select.ItemText>All {label}s</Select.ItemText>
            </Select.Item>
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-50 hover:text-slate-900 data-[state=checked]:text-indigo-600 data-[state=checked]:font-medium"
              >
                <Select.ItemIndicator>
                  <Check className="h-3.5 w-3.5" />
                </Select.ItemIndicator>
                <Select.ItemText>{opt.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}

export function FilterBar({ filters, options, onChange, onReset }: FilterBarProps) {
  const hasActiveFilter = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-col md:flex-row flex-wrap items-stretch md:items-center gap-2 md:gap-3 w-full">
      {options.department && options.department.length > 0 && (
        <SelectField
          id="filter-department"
          label="Department"
          value={filters.department ?? ''}
          options={options.department}
          onChange={(v) => onChange('department', v)}
        />
      )}
      {options.program && options.program.length > 0 && (
        <SelectField
          id="filter-program"
          label="Program"
          value={filters.program ?? ''}
          options={options.program}
          onChange={(v) => onChange('program', v)}
        />
      )}
      {options.subject && options.subject.length > 0 && (
        <SelectField
          id="filter-subject"
          label="Subject"
          value={filters.subject ?? ''}
          options={options.subject}
          onChange={(v) => onChange('subject', v)}
        />
      )}
      {options.status && options.status.length > 0 && (
        <SelectField
          id="filter-status"
          label="Status"
          value={filters.status ?? ''}
          options={options.status}
          onChange={(v) => onChange('status', v)}
        />
      )}
      {hasActiveFilter && (
        <button
          onClick={onReset}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
