/**
 * Address autocomplete using Nominatim (OpenStreetMap) - FREE API
 * Allows searching for full addresses including street names
 */
export interface AddressSuggestion {
  display_name: string
  place_id: number
  lat: string
  lon: string
  address: {
    house_number?: string
    road?: string
    city?: string
    state?: string
    postcode?: string
    country?: string
    country_code?: string
  }
}

export async function searchAddresses(query: string, limit: number = 5): Promise<AddressSuggestion[]> {
  if (!query || query.length < 3) {
    return []
  }

  try {
    // Use Nominatim API (OpenStreetMap) - FREE, no API key needed
    // Focus on US addresses
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=${limit}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'HarmonyHouseSaaS/1.0', // Required by Nominatim
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.map((item: any) => ({
      display_name: item.display_name,
      place_id: item.place_id,
      lat: item.lat,
      lon: item.lon,
      address: item.address || {},
    }))
  } catch (error) {
    console.error('Error searching addresses:', error)
    return []
  }
}

/**
 * Parse address suggestion to our address format
 */
export function parseAddressSuggestion(suggestion: AddressSuggestion): {
  street: string
  city: string
  state: string
  zip: string
  country: string
} {
  const addr = suggestion.address as any // Nominatim address structure can vary
  const street = [addr.house_number, addr.road].filter(Boolean).join(' ') || ''
  const city = addr.city || addr.town || addr.village || addr.municipality || ''
  const state = addr.state || ''
  const zip = addr.postcode || ''
  const country = addr.country_code?.toUpperCase() === 'US' ? 'USA' : addr.country || 'USA'

  return {
    street,
    city,
    state,
    zip,
    country,
  }
}
