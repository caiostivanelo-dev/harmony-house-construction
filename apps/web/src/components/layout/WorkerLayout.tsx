import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBranding } from '@/contexts/BrandingContext'
import { LogOut, Menu, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function WorkerLayout() {
  const { user, logout } = useAuth()
  const { brandName } = useBranding()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-[var(--brand-primary)]">{brandName}</h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Field Mode
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/worker/time-logging')}
              className="text-gray-600"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMenu && (
          <div className="border-t border-gray-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              <div className="px-3 py-2 text-sm text-gray-600 border-b border-gray-100 pb-2">
                <p className="font-medium text-gray-900">{user?.name || 'Worker'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/worker')
                  setShowMenu(false)
                }}
                className="w-full justify-start text-gray-700"
              >
                My Tasks
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigate('/worker/time-logging')
                  setShowMenu(false)
                }}
                className="w-full justify-start text-gray-700"
              >
                Time Logging
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
    </div>
  )
}
