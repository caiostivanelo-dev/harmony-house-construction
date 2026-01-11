import { useForm, useFieldArray } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Customer } from '@/lib/api'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { formatPhoneNumber, unformatPhoneNumber, formatZipCode } from '@/lib/formatters'
import { lookupAddressByZip } from '@/lib/address-lookup'
import { searchAddresses, parseAddressSuggestion, AddressSuggestion } from '@/lib/address-autocomplete'

interface CustomerFormData {
  name: string
  emails: {
    work: string
    personal?: string
  }
  phones: {
    work: string
    personal?: string
  }
  addresses: Array<{
    street: string
    city: string
    state: string
    zip: string
    country: string
  }>
  leadSource?: string
  notes?: string
}

interface CustomerFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
}

export function CustomerForm({ open, onOpenChange, customer }: CustomerFormProps) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormData) => api.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerFormData }) => 
      api.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', customer?.id] })
      onOpenChange(false)
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    defaultValues: {
      name: '',
      emails: { work: '', personal: '' },
      phones: { work: '', personal: '' },
      addresses: [{ street: '', city: '', state: '', zip: '', country: 'USA' }],
      leadSource: '',
      notes: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'addresses',
  })

  useEffect(() => {
    if (customer) {
      // Parse customer data
      const emails = typeof customer.emails === 'string'
        ? JSON.parse(customer.emails)
        : customer.emails || { work: '', personal: '' }
      
      const phonesRaw = typeof customer.phones === 'string'
        ? JSON.parse(customer.phones)
        : customer.phones || { work: '', personal: '' }
      
      // Format phone numbers if they exist
      const phones = {
        work: phonesRaw.work ? formatPhoneNumber(phonesRaw.work) : '',
        personal: phonesRaw.personal ? formatPhoneNumber(phonesRaw.personal) : '',
      }
      
      const addresses = typeof customer.addresses === 'string'
        ? JSON.parse(customer.addresses)
        : customer.addresses || []
      
      if (addresses.length === 0) {
        addresses.push({ street: '', city: '', state: '', zip: '', country: 'USA' })
      }

      reset({
        name: customer.name || '',
        emails,
        phones,
        addresses,
        leadSource: customer.leadSource || '',
        notes: customer.notes || '',
      })
    } else {
      reset({
        name: '',
        emails: { work: '', personal: '' },
        phones: { work: '', personal: '' },
        addresses: [{ street: '', city: '', state: '', zip: '', country: 'USA' }],
        leadSource: '',
        notes: '',
      })
    }
  }, [customer, reset])

  const onSubmit = (data: CustomerFormData) => {
    // Remove phone formatting before submitting
    const cleanedData = {
      ...data,
      phones: {
        work: unformatPhoneNumber(data.phones.work || ''),
        personal: data.phones.personal ? unformatPhoneNumber(data.phones.personal) : undefined,
      },
    }

    if (customer) {
      updateMutation.mutate({ id: customer.id, data: cleanedData })
    } else {
      createMutation.mutate(cleanedData)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Edit Customer' : 'New Customer'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Emails */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email-work">Work Email *</Label>
              <Input
                id="email-work"
                type="email"
                {...register('emails.work', { required: 'Work email is required' })}
                className="mt-1"
              />
              {errors.emails?.work && (
                <p className="text-sm text-red-500 mt-1">{errors.emails.work.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email-personal">Personal Email</Label>
              <Input
                id="email-personal"
                type="email"
                {...register('emails.personal')}
                className="mt-1"
              />
            </div>
          </div>

          {/* Phones */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone-work">Work Phone *</Label>
              <PhoneInput
                id="phone-work"
                value={watch('phones.work') || ''}
                onChange={(value) => {
                  setValue('phones.work', unformatPhoneNumber(value), { shouldValidate: true })
                }}
                error={errors.phones?.work?.message}
              />
            </div>
            <div>
              <Label htmlFor="phone-personal">Personal Phone</Label>
              <PhoneInput
                id="phone-personal"
                value={watch('phones.personal') || ''}
                onChange={(value) => {
                  setValue('phones.personal', unformatPhoneNumber(value))
                }}
              />
            </div>
          </div>

          {/* Addresses */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Addresses</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ street: '', city: '', state: '', zip: '', country: 'USA' })}
              >
                + Add Address
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 mb-4 space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Address {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div>
                  <Label htmlFor={`address-${index}-street`}>Street *</Label>
                  <AddressAutocompleteInput
                    index={index}
                    value={watch(`addresses.${index}.street`) || ''}
                    onSelect={(address) => {
                      setValue(`addresses.${index}.street`, address.street)
                      setValue(`addresses.${index}.city`, address.city)
                      setValue(`addresses.${index}.state`, address.state)
                      setValue(`addresses.${index}.zip`, address.zip)
                      setValue(`addresses.${index}.country`, address.country)
                    }}
                    onChange={(value) => {
                      setValue(`addresses.${index}.street`, value)
                    }}
                    register={register}
                    error={errors.addresses?.[index]?.street?.message}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`address-${index}-city`}>City *</Label>
                    <Input
                      id={`address-${index}-city`}
                      {...register(`addresses.${index}.city`, { required: 'City is required' })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`address-${index}-state`}>State *</Label>
                    <Input
                      id={`address-${index}-state`}
                      {...register(`addresses.${index}.state`, { required: 'State is required' })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`address-${index}-zip`}>ZIP Code *</Label>
                    <ZipCodeInput
                      id={`address-${index}-zip`}
                      value={watch(`addresses.${index}.zip`) || ''}
                      onChange={async (value) => {
                        setValue(`addresses.${index}.zip`, value.replace(/\D/g, ''), { shouldValidate: true })
                        
                        // Auto-fill address when ZIP has 5 digits
                        const cleanZip = value.replace(/\D/g, '')
                        if (cleanZip.length === 5) {
                          try {
                            const addressData = await lookupAddressByZip(cleanZip)
                            if (addressData) {
                              console.log('Address data received:', addressData)
                              // Pre-fill street name if available (user will add house number)
                              if (addressData.street) {
                                const currentStreet = watch(`addresses.${index}.street`) || ''
                                console.log('Setting street to:', addressData.street, 'Current:', currentStreet)
                                // Always update if street is empty, or if it doesn't start with a number
                                if (!currentStreet.trim() || !/^\d/.test(currentStreet.trim())) {
                                  setValue(`addresses.${index}.street`, addressData.street, { shouldValidate: false })
                                }
                              } else {
                                console.log('No street found in address data')
                              }
                              setValue(`addresses.${index}.city`, addressData.city, { shouldValidate: false })
                              setValue(`addresses.${index}.state`, addressData.stateCode || addressData.state || '', { shouldValidate: false })
                              setValue(`addresses.${index}.country`, 'USA', { shouldValidate: false })
                            } else {
                              console.log('No address data returned for ZIP:', cleanZip)
                            }
                          } catch (error) {
                            console.error('Error looking up address:', error)
                          }
                        }
                      }}
                      error={errors.addresses?.[index]?.zip?.message}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`address-${index}-country`}>Country *</Label>
                    <Input
                      id={`address-${index}-country`}
                      {...register(`addresses.${index}.country`, { required: 'Country is required' })}
                      className="mt-1"
                      defaultValue="USA"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Lead Source */}
          <div>
            <Label htmlFor="leadSource">Lead Source</Label>
            <Input
              id="leadSource"
              {...register('leadSource')}
              className="mt-1"
              placeholder="e.g., Website, Referral, Social Media"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              {...register('notes')}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : customer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Phone Input Component with formatting
interface PhoneInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
}

function PhoneInput({ id, value, onChange, error }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState(formatPhoneNumber(value))

  useEffect(() => {
    setDisplayValue(formatPhoneNumber(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setDisplayValue(formatted)
    onChange(formatted)
  }

  return (
    <div>
      <Input
        id={id}
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder="(111) 111-1111"
        className="mt-1"
        maxLength={14} // (111)111-1111
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

// ZIP Code Input Component with auto-complete
interface ZipCodeInputProps {
  id: string
  value: string
  onChange: (value: string) => Promise<void>
  error?: string
}

function ZipCodeInput({ id, value, onChange, error }: ZipCodeInputProps) {
  const [displayValue, setDisplayValue] = useState(formatZipCode(value))
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setDisplayValue(formatZipCode(value))
  }, [value])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatZipCode(e.target.value)
    setDisplayValue(formatted)
    setIsLoading(true)
    await onChange(formatted)
    setIsLoading(false)
  }

  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="12345"
          className="mt-1"
          maxLength={10} // 12345-6789
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

// Address Autocomplete Input Component
interface AddressAutocompleteInputProps {
  index: number
  value: string
  onSelect: (address: { street: string; city: string; state: string; zip: string; country: string }) => void
  onChange: (value: string) => void
  register: any
  error?: string
}

function AddressAutocompleteInput({ index, value, onSelect, onChange, register, error }: AddressAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    onChange(query)
    
    if (query.length >= 3) {
      setIsLoading(true)
      const results = await searchAddresses(query)
      setSuggestions(results)
      setShowSuggestions(true)
      setIsLoading(false)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSelect = (suggestion: AddressSuggestion) => {
    const parsed = parseAddressSuggestion(suggestion)
    onSelect(parsed)
    setShowSuggestions(false)
    setSuggestions([])
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={inputRef}>
      <Input
        id={`address-${index}-street`}
        {...register(`addresses.${index}.street`, { required: 'Street is required' })}
        value={value}
        onChange={handleInputChange}
        className="mt-1"
        placeholder="Type address (e.g., 123 Main St, Delray Beach)"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              onClick={() => handleSelect(suggestion)}
            >
              <div className="text-sm text-gray-900">{suggestion.display_name}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
