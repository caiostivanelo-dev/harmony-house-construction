/**
 * Lookup address by ZIP code using zippopotam.us API + Nominatim for street info
 * Returns address information for US ZIP codes including a sample street name
 */
export interface AddressLookupResult {
  street?: string
  city: string
  state: string
  stateCode?: string
  zip: string
  country: string
}

export async function lookupAddressByZip(zipCode: string): Promise<AddressLookupResult | null> {
  // Remove formatting
  const cleanZip = zipCode.replace(/\D/g, '')
  
  // Must be 5 digits for US ZIP
  if (cleanZip.length !== 5) {
    return null
  }

  try {
    // Get basic ZIP info from zippopotam.us
    const zipResponse = await fetch(`https://api.zippopotam.us/us/${cleanZip}`)
    
    if (!zipResponse.ok) {
      return null
    }

    const zipData = await zipResponse.json()
    
    if (!zipData.places || zipData.places.length === 0) {
      return null
    }

    const place = zipData.places[0]
    const city = place['place name'] || ''
    const state = place['state'] || ''
    const stateCode = place['state abbreviation'] || state

    // Now search for a sample address in this ZIP to get a common street name
    try {
      // Try multiple search strategies to find a street name
      const searchQueries = [
        `${city} ${stateCode} ${cleanZip}`,
        `zipcode ${cleanZip} ${city}`,
        `${cleanZip}`,
      ]

      for (const query of searchQueries) {
        const addressResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us&limit=10&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'HarmonyHouseSaaS/1.0',
            },
          }
        )

      if (addressResponse.ok) {
        const addressData = await addressResponse.json()
        // Try to find an address with a road name
        for (const item of addressData) {
          if (item.address) {
            // Check if ZIP matches (can be string or number)
            const itemZip = String(item.postcode || '').replace(/\D/g, '')
            if (itemZip === cleanZip || item.display_name?.includes(cleanZip)) {
              const addr = item.address as any
              // Get street name without house number (user will add the number)
              const street = addr.road || addr.pedestrian || addr.path || addr.street || addr.highway || ''
              if (street && street.length > 2) {
                // Found a valid street name
                console.log('Found street:', street, 'for ZIP:', cleanZip)
                return {
                  street,
                  city,
                  state,
                  stateCode,
                  zip: cleanZip,
                  country: 'USA',
                }
              }
            }
          }
        }
      }
        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      console.warn('Could not fetch street name from Nominatim:', error)
    }

    // Fallback: return without street if Nominatim fails
    return {
      street: undefined,
      city,
      state,
      stateCode,
      zip: cleanZip,
      country: 'USA',
    }
  } catch (error) {
    console.error('Error looking up address:', error)
    return null
  }
}
