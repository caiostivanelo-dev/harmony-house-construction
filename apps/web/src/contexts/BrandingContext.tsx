import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface CompanyBranding {
  displayName: string
  logoUrl?: string
  primaryColor: string
  accentColor: string
  emailFromName: string
  emailFromAddress: string
}

interface BrandingContextType {
  branding: CompanyBranding | null
  isLoading: boolean
  brandName: string
  logoUrl?: string
}

const defaultBranding: CompanyBranding = {
  displayName: 'Harmony House Construction',
  logoUrl: undefined,
  primaryColor: '#1ECAD3',
  accentColor: '#1ECAD3',
  emailFromName: 'Harmony House Construction',
  emailFromAddress: 'noreply@harmonyhouse.com',
}

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  isLoading: true,
  brandName: defaultBranding.displayName,
  logoUrl: undefined,
})

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<CompanyBranding | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['branding'],
    queryFn: () => api.getBranding(),
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  useEffect(() => {
    if (data) {
      setBranding(data)
      
      // Apply CSS variables
      const root = document.documentElement
      root.style.setProperty('--brand-primary', data.primaryColor)
      root.style.setProperty('--brand-accent', data.accentColor)
    } else {
      // Apply defaults if no branding
      const root = document.documentElement
      root.style.setProperty('--brand-primary', defaultBranding.primaryColor)
      root.style.setProperty('--brand-accent', defaultBranding.accentColor)
    }
  }, [data])

  // Apply defaults on mount before branding loads
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--brand-primary', defaultBranding.primaryColor)
    root.style.setProperty('--brand-accent', defaultBranding.accentColor)
  }, [])

  const value: BrandingContextType = {
    branding: branding || data || defaultBranding,
    isLoading,
    brandName: branding?.displayName || data?.displayName || defaultBranding.displayName,
    logoUrl: branding?.logoUrl || data?.logoUrl,
  }

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding() {
  const context = useContext(BrandingContext)
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider')
  }
  return context
}
