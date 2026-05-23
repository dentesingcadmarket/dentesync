import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
  align?: 'left' | 'right' | 'center'
}

interface Props<T> {
  data: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  rowHref?: (row: T) => string
  empty?: ReactNode
}

export function DataTable<T>({ data, columns, rowKey, onRowClick, rowHref, empty }: Props<T>) {
  if (data.length === 0 && empty) return <>{empty}</>

  const alignClass = (a?: 'left' | 'right' | 'center') =>
    a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {columns.map(c => (
              <th
                key={c.key}
                className={cn(
                  'px-3 py-2.5 text-[10px] uppercase tracking-wider text-[#737373] font-medium',
                  alignClass(c.align),
                  c.headerClassName
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(row => {
            const k = rowKey(row)
            const RowEl = (rowHref ? 'tr' : 'tr') as 'tr'
            return (
              <RowEl
                key={k}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'border-b border-white/[0.03] last:border-0 transition-colors',
                  (onRowClick || rowHref) && 'hover:bg-white/[0.025] cursor-pointer'
                )}
              >
                {columns.map(c => (
                  <td key={c.key} className={cn('px-3 py-3.5 align-middle', alignClass(c.align), c.className)}>
                    {rowHref ? (
                      <a href={rowHref(row)} className="block w-full">
                        {c.cell(row)}
                      </a>
                    ) : (
                      c.cell(row)
                    )}
                  </td>
                ))}
              </RowEl>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function PatientAvatar({ name, color = '#2dd4bf' }: { name: string; color?: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
      style={{ background: `${color}22`, color }}
    >
      {initials || '?'}
    </div>
  )
}
