import { Badge, BadgeProps } from './badge'
import { cn } from '@/lib/utils'

export type DocumentStatus = 'ACCEPTED' | 'PENDING' | 'PAID' | 'OVERDUE' | 'DRAFT'
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type CustomerStatus = 'ACTIVE' | 'LEAD' | 'INACTIVE'
export type ProjectStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'

export type AnyStatus = DocumentStatus | TaskStatus | CustomerStatus | ProjectStatus

interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: AnyStatus
}

const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  // Document statuses
  ACCEPTED: { variant: 'success', label: 'Accepted' },
  PENDING: { variant: 'warning', label: 'Pending' },
  PAID: { variant: 'success', label: 'Paid' },
  OVERDUE: { variant: 'destructive', label: 'Overdue' },
  DRAFT: { variant: 'outline', label: 'Draft' },
  
  // Task statuses
  IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
  COMPLETED: { variant: 'success', label: 'Completed' },
  
  // Customer statuses
  ACTIVE: { variant: 'success', label: 'Active' },
  LEAD: { variant: 'warning', label: 'Lead' },
  INACTIVE: { variant: 'outline', label: 'Inactive' },
  
  // Project statuses
  ON_HOLD: { variant: 'outline', label: 'On Hold' },
}

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default', label: status }
  
  return (
    <Badge variant={config.variant} className={cn(className)} {...props}>
      {config.label}
    </Badge>
  )
}
