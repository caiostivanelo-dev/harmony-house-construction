import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserRole } from '@/types'

interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  companyId: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  canViewFinancials: () => boolean
  canCreateInvoice: () => boolean
  canCreateEstimate: () => boolean
  canManageTasks: () => boolean
  canViewCustomers: () => boolean
  canViewTimeTracking: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user from localStorage or JWT token
    // For now, we'll use a mock user for testing
    // In production, decode JWT and set user
    const token = localStorage.getItem('token')
    if (token) {
      try {
        // Decode JWT (simple base64 decode for now)
        // In production, use a proper JWT library
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.sub || payload.id,
          email: payload.email,
          name: payload.name,
          role: payload.role || 'WORKER',
          companyId: payload.companyId || '',
        })
      } catch (error) {
        console.error('Failed to decode token:', error)
        localStorage.removeItem('token')
      }
    }
    setIsLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const canViewFinancials = () => {
    if (!user) return false
    return user.role === 'ADMIN' || user.role === 'MANAGER'
  }

  const canCreateInvoice = () => {
    if (!user) return false
    return user.role === 'ADMIN' || user.role === 'MANAGER'
  }

  const canCreateEstimate = () => {
    if (!user) return false
    return user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'SALES'
  }

  const canManageTasks = () => {
    if (!user) return false
    return user.role === 'ADMIN' || user.role === 'MANAGER'
  }

  const canViewCustomers = () => {
    if (!user) return false
    return user.role === 'ADMIN' || user.role === 'MANAGER' || user.role === 'SALES'
  }

  const canViewTimeTracking = () => {
    if (!user) return false
    return user.role === 'ADMIN' || user.role === 'MANAGER'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        logout,
        canViewFinancials,
        canCreateInvoice,
        canCreateEstimate,
        canManageTasks,
        canViewCustomers,
        canViewTimeTracking,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
