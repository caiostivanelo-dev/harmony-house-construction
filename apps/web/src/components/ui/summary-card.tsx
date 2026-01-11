import { Card, CardContent, CardHeader, CardTitle } from './card'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  className?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  children?: ReactNode
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  className,
  trend,
  children,
}: SummaryCardProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">
            {title}
          </CardTitle>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
