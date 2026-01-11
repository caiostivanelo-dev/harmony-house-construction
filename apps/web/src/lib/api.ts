// API client configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ApiError {
  message: string
  statusCode?: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> || {}),
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP error! status: ${response.status}`,
          statusCode: response.status,
        }
        
        try {
          const errorData = await response.json()
          error.message = errorData.message || error.message
        } catch {
          // If error response is not JSON, use default message
        }
        
        throw error
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw { message: error.message } as ApiError
      }
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

const apiClient = new ApiClient(API_BASE_URL)

// Frontend types (matching backend responses)
export interface Customer {
  id: string
  name: string
  emails: { work: string; personal?: string } | string
  phones: { work: string; personal?: string } | string
  addresses: Array<{
    street: string
    city: string
    state: string
    zip: string
    country: string
  }>
  leadSource?: string | null
  notes?: string | null
  companyId: string
  createdAt: string
  updatedAt: string
  // Financial aggregates
  totalEstimatesValue?: number
  totalInvoicesValue?: number
  totalPaid?: number
  totalOutstanding?: number
  documentsCount?: number
  projectsCount?: number
}

export interface Project {
  id: string
  name: string
  status: string
  customerId: string
  companyId: string
  createdAt: string
  updatedAt: string
  customer?: Customer
  // Financial aggregates
  totalEstimatedValue?: number
  totalInvoicedValue?: number
  totalPaid?: number
  totalOutstanding?: number
}

export interface EstimateLineItem {
  type: 'LABOR' | 'MATERIAL' | 'OTHER_COST'
  name: string
  hours?: number // For LABOR items
  quantity?: number // For MATERIAL items
  companyCost: number // Internal company cost
  customerPrice: number // Price charged to customer
  tax?: number // Tax percentage (e.g., 10.0 for 10%)
  taxAmount?: number // Calculated tax amount
  visible?: number // 0 = hidden, 1 = visible to customer
}

export interface EstimateSection {
  name: string // Section name (e.g., "Demolition & Disposal", "Plumbing")
  items: EstimateLineItem[]
}

export interface EstimateItem {
  category: string
  description: string
  labor?: number // Optional - for detailed estimates (legacy)
  materials?: number // Optional - for detailed estimates (legacy)
  cost: number // Total cost (legacy - labor + materials, or direct value)
}

export interface Document {
  id: string
  type: 'ESTIMATE' | 'INVOICE' | 'CHANGE_ORDER'
  status: 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'PAID' | 'OVERDUE'
  number: string
  totalValue: number
  balanceDue: number
  sentDate?: string | null
  dueDate?: string | null
  projectId?: string | null
  customerId: string
  createdAt: string
  updatedAt: string
  project?: Project
  customer?: Customer
  // Estimate-specific fields
  estimateDate?: string | null
  projectDates?: string | null
  preparedBy?: string | null
  validityDays?: number | null
      notes?: string | null
      introduction?: string | null
      taxRate?: number | null
      items?: EstimateItem[] | null // Legacy format
      sections?: EstimateSection[] | null // New advanced format
}

export interface Task {
  id: string
  title: string
  date: string
  duration: number
  notes?: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  projectId: string
  createdAt: string
  updatedAt: string
  project?: Project
  assignedUsers?: Array<{
    id: string
    name: string
    email: string
  }>
}

export interface TimeLog {
  id: string
  date: string
  hours: number
  type: 'REGULAR' | 'OVERTIME'
  approved: boolean
  userId: string
  taskId: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string
    email: string
  }
  task?: Task
}

// API helpers
export const api = {
  // Customers
  getCustomers: () => apiClient.get<Customer[]>('/customers'),
  getCustomerById: (id: string) => apiClient.get<Customer>(`/customers/${id}`),
  createCustomer: (data: {
    name: string
    emails: { work: string; personal?: string }
    phones: { work: string; personal?: string }
    addresses: Array<{
      street: string
      city: string
      state: string
      zip: string
      country: string
    }>
    leadSource?: string
    notes?: string
  }) => apiClient.post<Customer>('/customers', data),
  updateCustomer: (id: string, data: {
    name?: string
    emails?: { work: string; personal?: string }
    phones?: { work: string; personal?: string }
    addresses?: Array<{
      street: string
      city: string
      state: string
      zip: string
      country: string
    }>
    leadSource?: string
    notes?: string
  }) => apiClient.patch<Customer>(`/customers/${id}`, data),

  // Projects
  getProjects: (params?: { customerId?: string }) =>
    apiClient.get<Project[]>('/projects', params),
  createProject: (data: { name: string; customerId: string; status?: string }) =>
    apiClient.post<Project>('/projects', data),

  // Documents
  getDocuments: (params?: { customerId?: string; projectId?: string; type?: string }) =>
    apiClient.get<Document[]>('/documents', params),
  getEstimates: () => apiClient.get<Document[]>('/documents', { type: 'ESTIMATE' }),
  getInvoices: () => apiClient.get<Document[]>('/documents', { type: 'INVOICE' }),
  createDocument: (data: {
    type: 'ESTIMATE' | 'INVOICE' | 'CHANGE_ORDER'
    customerId: string
    projectId?: string
    totalValue: number
    balanceDue: number
    status: 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'PAID' | 'OVERDUE'
    sentDate?: string
    dueDate?: string
    // Estimate-specific fields
    estimateDate?: string
    projectDates?: string
    preparedBy?: string
    validityDays?: number
    notes?: string
      items?: EstimateItem[]
      introduction?: string
      taxRate?: number
      sections?: EstimateSection[]
    }) => apiClient.post<Document>('/documents', data),
  updateDocument: (id: string, data: {
    type?: 'ESTIMATE' | 'INVOICE' | 'CHANGE_ORDER'
    customerId?: string
    projectId?: string
    totalValue?: number
    balanceDue?: number
    status?: 'DRAFT' | 'PENDING' | 'ACCEPTED' | 'PAID' | 'OVERDUE'
    sentDate?: string
    dueDate?: string
    // Estimate-specific fields
    estimateDate?: string
    projectDates?: string
    preparedBy?: string
    validityDays?: number
    notes?: string
    items?: EstimateItem[]
      introduction?: string
      taxRate?: number
      sections?: EstimateSection[]
    }) => apiClient.patch<Document>(`/documents/${id}`, data),
    downloadEstimatePDF: (id: string) => {
    const token = localStorage.getItem('token')
    const url = `${API_BASE_URL}/documents/${id}/pdf`
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) throw new Error('Failed to download PDF')
      return res.blob()
    })
  },
  deleteDocument: (id: string) => apiClient.delete(`/documents/${id}`),
  getEstimateFinancials: (id: string) => apiClient.get<{
    companyCosts: {
      labor: number
      material: number
      other: number
      total: number
    }
    customerCosts: {
      subtotal: number
      tax: number
      total: number
    }
    profit: {
      gross: number
      markup: number
      margin: number
    }
    taxRate: number
  }>(`/documents/${id}/financials`),

  // Tasks
  getTasks: (params?: { projectId?: string; assignedUserId?: string }) =>
    apiClient.get<Task[]>('/tasks', params),
  createTask: (data: {
    title: string
    projectId: string
    date: string
    duration: number
    notes?: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  }) => apiClient.post<Task>('/tasks', data),
  updateTask: (id: string, data: {
    title?: string
    projectId?: string
    date?: string
    duration?: number
    notes?: string
    status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  }) => apiClient.patch<Task>(`/tasks/${id}`, data),
  assignTaskUsers: (taskId: string, userIds: string[]) =>
    apiClient.patch<Task>(`/tasks/${taskId}/assign`, { userIds }),

  // TimeLogs
  getTimeLogs: (params?: { userId?: string; date?: string }) =>
    apiClient.get<TimeLog[]>('/timelogs', params),
  createTimeLog: (data: {
    taskId: string
    userId: string
    date: string
    hours: number
    type: 'REGULAR' | 'OVERTIME'
  }) => apiClient.post<TimeLog>('/timelogs', data),

  // Users
  getUsers: () => apiClient.get<Array<{
    id: string
    name: string
    email: string
    role: string
    companyId: string
    createdAt: string
    updatedAt: string
  }>>('/users'),

  // Dashboard
  getDashboardSummary: () => apiClient.get<{
    estimates: {
      total: number
      totalAmount: number
      byStatus: Record<string, { count: number; amount: number }>
    }
    invoices: {
      total: number
      totalAmount: number
      byStatus: Record<string, { count: number; amount: number }>
    }
    changeOrders: {
      total: number
      totalAmount: number
      byStatus: Record<string, { count: number; amount: number }>
    }
    outstandingBalance?: number
    paidThisPeriod?: number
    revenueByStatus?: Record<string, number>
  }>('/dashboard/summary'),

  // Customer Statement
  getCustomerStatement: (id: string) => apiClient.get<{
    customer: {
      id: string
      name: string
      emails: any
      phones: any
      addresses: any
    }
    documents: Array<{
      id: string
      number: string
      type: string
      status: string
      totalValue?: number
      balanceDue?: number
      sentDate?: string
      dueDate?: string
      project?: { id: string; name: string } | null
    }>
    totals: {
      totalInvoiced?: number
      totalPaid?: number
      totalOutstanding?: number
    }
    generatedAt: string
  }>(`/customers/${id}/statement`),

  // Project Financials
  getProjectFinancials: (id: string) => apiClient.get<{
    project: {
      id: string
      name: string
      status: string
    }
    customer: {
      id: string
      name: string
    }
    documents: Array<{
      id: string
      number: string
      type: string
      status: string
      totalValue?: number
      balanceDue?: number
      sentDate?: string
      dueDate?: string
    }>
    financials: {
      totalEstimatedValue: number
      totalInvoicedValue: number
      totalPaid?: number
      totalOutstanding?: number
    }
    generatedAt: string
  }>(`/projects/${id}/financials`),

  // Billing
  getBillingStatus: () => apiClient.get<{
    plan: string
    status: string
    trialEndsAt?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }>('/billing/status'),
  createCheckoutSession: (planId: string) => apiClient.post<{
    sessionId: string
    url: string
  }>('/billing/checkout', { planId }),
  syncSubscriptionStatus: () => apiClient.post<{ message: string }>('/billing/sync', {}),

  // Branding
  getBranding: () => apiClient.get<{
    displayName: string
    logoUrl?: string
    primaryColor: string
    accentColor: string
    emailFromName: string
    emailFromAddress: string
  }>('/branding/me'),
  updateBranding: (branding: {
    displayName?: string
    logoUrl?: string
    primaryColor?: string
    accentColor?: string
    emailFromName?: string
    emailFromAddress?: string
  }) => apiClient.patch<{
    displayName: string
    logoUrl?: string
    primaryColor: string
    accentColor: string
    emailFromName: string
    emailFromAddress: string
  }>('/branding/me', branding),
  seedBrandingDefaults: () => apiClient.post<{
    displayName: string
    logoUrl?: string
    primaryColor: string
    accentColor: string
    emailFromName: string
    emailFromAddress: string
  }>('/branding/seed', {}),
}
