/**
 * Format phone number to US format: (111)111-1111
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')
  
  // Limit to 10 digits (US phone number)
  const limited = digits.slice(0, 10)
  
  // Apply formatting
  if (limited.length === 0) return ''
  if (limited.length <= 3) return `(${limited}`
  if (limited.length <= 6) return `(${limited.slice(0, 3)})${limited.slice(3)}`
  return `(${limited.slice(0, 3)})${limited.slice(3, 6)}-${limited.slice(6)}`
}

/**
 * Remove formatting from phone number
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Format ZIP code to US format: 12345 or 12345-6789
 */
export function formatZipCode(value: string): string {
  const digits = value.replace(/\D/g, '')
  const limited = digits.slice(0, 9)
  
  if (limited.length <= 5) return limited
  return `${limited.slice(0, 5)}-${limited.slice(5)}`
}

/**
 * Remove formatting from ZIP code
 */
export function unformatZipCode(value: string): string {
  return value.replace(/\D/g, '')
}
