export type UserRole = 'ADMIN' | 'MANAGER' | 'WORKER' | 'SALES'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  companyId: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: string
  projectsCount: number
  totalValue: number
}

export interface Project {
  id: string
  customerId: string
  name: string
  status: string
  value: number
  progress?: number
}

export interface Task {
  id: string
  projectId: string
  title: string
  date: string
  duration: number
  status: string
  notes?: string
}

export interface TimeLog {
  id: string
  userId: string
  taskId: string
  date: string
  hours: number
  type: 'REGULAR' | 'OVERTIME'
  approved: boolean
}

export interface Document {
  id: string
  projectId?: string
  customerId: string
  type: 'ESTIMATE' | 'INVOICE' | 'CHANGE_ORDER'
  status: string
  number: string
  totalValue: number
  balanceDue: number
  sentDate?: string
  dueDate?: string
}
