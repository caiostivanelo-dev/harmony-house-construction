import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

export function Select({ value, onChange, children, ...props }: SelectProps & { onValueChange?: (value: string) => void }) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (props.onValueChange) {
      props.onValueChange(e.target.value)
    }
    if (onChange) {
      onChange(e)
    }
  }

  return (
    <SelectContext.Provider value={{ value: value as string || '', onValueChange: props.onValueChange || (() => {}) }}>
      <select
        value={value}
        onChange={handleChange}
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          props.className
        )}
        {...props}
      >
        {children}
      </select>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children }: { children?: React.ReactNode }) {
  // This is just a pass-through - actual select is rendered by Select component
  return <>{children}</>
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <option value="">{placeholder || 'Select...'}</option>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>
}
