import type { Restaurant } from '../types/restaurant'

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord | null => {
  if (typeof value === 'object' && value !== null) {
    return value as UnknownRecord
  }

  return null
}

const asString = (value: unknown): string | null => {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

const asNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }

  return null
}

const extractCuisineNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim()
      }

      const record = asRecord(item)
      if (!record) {
        return null
      }

      return (
        asString(record.name) ??
        asString(record.uniqueName) ??
        asString(record.displayName)
      )
    })
    .filter((item): item is string => Boolean(item))
}

const extractRating = (restaurant: UnknownRecord): number | null => {
  const directCandidates = [
    restaurant.ratingAverage,
    restaurant.starRating,
    restaurant.rating,
  ]

  for (const candidate of directCandidates) {
    const numericValue = asNumber(candidate)
    if (numericValue !== null) {
      return numericValue
    }
  }

  const ratingObject = asRecord(restaurant.rating)
  if (!ratingObject) {
    return null
  }

  const nestedCandidates = [
    ratingObject.starRating,
    ratingObject.ratingAverage,
    ratingObject.average,
    ratingObject.value,
  ]

  for (const candidate of nestedCandidates) {
    const numericValue = asNumber(candidate)
    if (numericValue !== null) {
      return numericValue
    }
  }

  return null
}

const buildAddress = (restaurant: UnknownRecord): string => {
  const addressRecord = asRecord(restaurant.address)

  const parts = [
    asString(addressRecord?.firstLine),
    asString(addressRecord?.street),
    asString(addressRecord?.city),
    asString(addressRecord?.postalCode),
  ].filter((part): part is string => Boolean(part))

  if (parts.length > 0) {
    return parts.join(', ')
  }

  const fallbackParts = [
    asString(restaurant.addressLine1),
    asString(restaurant.addressLine2),
    asString(restaurant.city),
    asString(restaurant.postcode),
    asString(restaurant.postalCode),
  ].filter((part): part is string => Boolean(part))

  return fallbackParts.join(', ')
}

export const mapRestaurant = (value: unknown, index: number): Restaurant | null => {
  const restaurant = asRecord(value)
  if (!restaurant) {
    return null
  }

  const name = asString(restaurant.name)
  if (!name) {
    return null
  }

  return {
    id: asString(restaurant.id) ?? `${name}-${index}`,
    name,
    cuisines: extractCuisineNames(restaurant.cuisines),
    rating: extractRating(restaurant),
    address: buildAddress(restaurant) || 'Address unavailable',
  }
}