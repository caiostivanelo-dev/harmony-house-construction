import { useLocation } from 'react-router-dom'
import { ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Topbar() {
  const location = useLocation()
  
  const getBreadcrumbs = () => {
    const path = location.pathname
    const breadcrumbs = [{ label: 'Home', path: '/dashboard' }]
    
    if (path === '/dashboard') {
      breadcrumbs.push({ label: 'Dashboard', path: '/dashboard' })
    } else if (path === '/customers') {
      breadcrumbs.push({ label: 'Customers', path: '/customers' })
    } else if (path.startsWith('/customers/')) {
      breadcrumbs.push({ label: 'Customers', path: '/customers' })
      breadcrumbs.push({ label: 'Customer Details', path: path })
    } else if (path === '/projects') {
      breadcrumbs.push({ label: 'Projects', path: '/projects' })
    } else if (path === '/tasks') {
      breadcrumbs.push({ label: 'Task List', path: '/tasks' })
    } else if (path === '/time-tracking') {
      breadcrumbs.push({ label: 'Time Tracking', path: '/time-tracking' })
    } else if (path === '/invoices') {
      breadcrumbs.push({ label: 'Invoices', path: '/invoices' })
    } else if (path === '/estimates') {
      breadcrumbs.push({ label: 'Estimates', path: '/estimates' })
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
            <span
              className={cn(
                'text-sm',
                index === breadcrumbs.length - 1
                  ? 'font-medium text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          <span>Jan 1 - Dec 31, 2024</span>
        </Button>
      </div>
    </header>
  )
}
