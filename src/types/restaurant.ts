export interface Restaurant {
  id: string
  name: string
  cuisines: string[]
  rating: number | null
  address: string
}

export interface RestaurantApiResponse {
  restaurants?: unknown[]
}