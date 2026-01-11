import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBranding } from '@/contexts/BrandingContext'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Save } from 'lucide-react'

export default function BrandingSettings() {
  const { user } = useAuth()
  const { branding, isLoading: brandingLoading } = useBranding()
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState(branding?.displayName || '')
  const [logoUrl, setLogoUrl] = useState(branding?.logoUrl || '')
  const [primaryColor, setPrimaryColor] = useState(branding?.primaryColor || '#1ECAD3')
  const [accentColor, setAccentColor] = useState(branding?.accentColor || '#1ECAD3')
  const [emailFromName, setEmailFromName] = useState(branding?.emailFromName || '')
  const [emailFromAddress, setEmailFromAddress] = useState(branding?.emailFromAddress || '')

  // Update form when branding loads
  useEffect(() => {
    if (branding) {
      setDisplayName(branding.displayName)
      setLogoUrl(branding.logoUrl || '')
      setPrimaryColor(branding.primaryColor)
      setAccentColor(branding.accentColor)
      setEmailFromName(branding.emailFromName)
      setEmailFromAddress(branding.emailFromAddress)
    }
  }, [branding])

  const updateMutation = useMutation({
    mutationFn: (data: {
      displayName?: string
      logoUrl?: string
      primaryColor?: string
      accentColor?: string
      emailFromName?: string
      emailFromAddress?: string
    }) => api.updateBranding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding'] })
      alert('Branding updated successfully!')
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update branding')
    },
  })

  const seedMutation = useMutation({
    mutationFn: () => api.seedBrandingDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branding'] })
      alert('Harmony defaults applied successfully!')
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to apply defaults')
    },
  })

  const handleSeedDefaults = () => {
    if (window.confirm('Are you sure you want to apply Harmony House Construction defaults? This will only fill empty branding fields and will not overwrite existing values.')) {
      seedMutation.mutate()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!displayName.trim()) {
      alert('Display name is required')
      return
    }

    // Validate colors
    const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/
    if (primaryColor && !hexColorRegex.test(primaryColor)) {
      alert('Primary color must be a valid hex color (e.g., #111827)')
      return
    }
    if (accentColor && !hexColorRegex.test(accentColor)) {
      alert('Accent color must be a valid hex color (e.g., #0EA5E9)')
      return
    }

    // Validate URL if provided
    if (logoUrl && !isValidUrl(logoUrl)) {
      alert('Logo URL must be a valid URL')
      return
    }

    updateMutation.mutate({
      displayName: displayName.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      primaryColor: primaryColor || undefined,
      accentColor: accentColor || undefined,
      emailFromName: emailFromName.trim() || undefined,
      emailFromAddress: emailFromAddress.trim() || undefined,
    })
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Branding Settings"
          description="Customize your company branding"
        />
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">You don't have permission to view branding settings.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (brandingLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Branding Settings"
          description="Customize your company branding"
        />
        <div className="text-center py-12 text-gray-500">Loading branding settings...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding Settings"
        description="Customize how your company appears across the application, PDFs, and emails"
      />

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Company Branding</CardTitle>
            <CardDescription>
              Customize your company's appearance across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div>
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Company Name"
                className="mt-1"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This name appears in headers, PDFs, and emails
              </p>
            </div>

            {/* Logo URL */}
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL to your company logo (displayed in headers and PDFs)
              </p>
              {logoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">Preview:</p>
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-12 border border-gray-200 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Primary Color */}
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#111827"
                  pattern="^#[0-9A-Fa-f]{3,6}$"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Main brand color (used in headers, borders, primary elements)
              </p>
            </div>

            {/* Accent Color */}
            <div>
              <Label htmlFor="accentColor">Accent Color</Label>
              <div className="flex items-center gap-3 mt-1">
                <Input
                  id="accentColor"
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#0EA5E9"
                  pattern="^#[0-9A-Fa-f]{3,6}$"
                  className="flex-1"
                />
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Accent color (used in buttons, badges, highlights)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Customize email sender information (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email From Name */}
            <div>
              <Label htmlFor="emailFromName">Email From Name</Label>
              <Input
                id="emailFromName"
                value={emailFromName}
                onChange={(e) => setEmailFromName(e.target.value)}
                placeholder="Your Company Name"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Name that appears as email sender (defaults to Display Name if not set)
              </p>
            </div>

            {/* Email From Address */}
            <div>
              <Label htmlFor="emailFromAddress">Email From Address</Label>
              <Input
                id="emailFromAddress"
                type="email"
                value={emailFromAddress}
                onChange={(e) => setEmailFromAddress(e.target.value)}
                placeholder="noreply@yourcompany.com"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address used as sender (defaults to system email if not set)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleSeedDefaults}
            disabled={seedMutation.isPending || updateMutation.isPending}
          >
            {seedMutation.isPending ? 'Applying...' : 'Apply Harmony Defaults'}
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
      </form>
    </div>
  )
}
