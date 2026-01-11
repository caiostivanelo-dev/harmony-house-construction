import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  FileText, 
  Receipt, 
  FolderKanban, 
  Calendar, 
  Image, 
  Users, 
  Map, 
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { useAuth } from '@/contexts/AuthContext'
import { useBranding } from '@/contexts/BrandingContext'

interface NavItem {
  label: string
  path: string
  icon: React.ElementType
  roles?: string[]
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Time Tracking', path: '/time-tracking', icon: Clock, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Task List', path: '/tasks', icon: CheckSquare },
  { label: 'Lead Pipeline', path: '/leads', icon: TrendingUp },
  { label: 'Estimates', path: '/estimates', icon: FileText },
  { label: 'Invoices', path: '/invoices', icon: Receipt, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Projects', path: '/projects', icon: FolderKanban, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Schedule', path: '/schedule', icon: Calendar },
  { label: 'Photos & Files', path: '/files', icon: Image },
  { label: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'MANAGER', 'SALES'] },
  { label: 'Map', path: '/map', icon: Map },
  { label: 'Reports', path: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
  { label: 'Billing', path: '/billing', icon: Settings, roles: ['ADMIN'] },
  { label: 'Branding', path: '/settings/branding', icon: Settings, roles: ['ADMIN'] },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const { brandName, logoUrl } = useBranding()

  // Filter nav items based on role
  const navItems = allNavItems.filter((item) => {
    if (!item.roles) return true // No restriction means all roles can see it
    if (!user) return false
    return item.roles.includes(user.role)
  })

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="flex h-16 items-center px-6 border-b border-gray-200 gap-3">
        {logoUrl ? (
          <img src={logoUrl} alt={brandName} className="h-8 w-auto" />
        ) : (
          <h1 className="text-xl font-bold text-[var(--brand-primary)]">{brandName}</h1>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900 border-l-2 border-[var(--brand-primary)]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar 
            alt="John Doe" 
            fallback="JD"
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role || 'Guest'}
            </p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}
