import { FormEvent, useMemo, useState } from 'react'
import './App.css'
import type { Restaurant, RestaurantApiResponse } from './types/restaurant'
import { mapRestaurant } from './utils/restaurantMapper'

const DEFAULT_POSTCODE = 'EC4M7RF'

const normalizePostcode = (postcode: string): string => {
  return postcode.replace(/\s+/g, '').toUpperCase()
}

function App() {
  const [postcodeInput, setPostcodeInput] = useState(DEFAULT_POSTCODE)
  const [submittedPostcode, setSubmittedPostcode] = useState(DEFAULT_POSTCODE)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const resultTitle = useMemo(() => {
    if (!submittedPostcode) {
      return 'Restaurants'
    }

    return `First 10 restaurants for ${submittedPostcode}`
  }, [submittedPostcode])

  const fetchRestaurants = async (postcode: string) => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch(
        `/api/discovery/uk/restaurants/enriched/bypostcode/${postcode}`,
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = (await response.json()) as RestaurantApiResponse
      const mappedRestaurants = (data.restaurants ?? [])
        .map(mapRestaurant)
        .filter((restaurant): restaurant is Restaurant => restaurant !== null)
        .slice(0, 10)

      setRestaurants(mappedRestaurants)
      setSubmittedPostcode(postcode)
    } catch (error) {
      console.error(error)
      setRestaurants([])
      setErrorMessage(
        'Unable to load restaurant data right now. Please try another UK postcode.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const normalizedPostcode = normalizePostcode(postcodeInput)

    if (!normalizedPostcode) {
      setErrorMessage('Please enter a UK postcode.')
      return
    }

    await fetchRestaurants(normalizedPostcode)
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Restaurant Finder</p>
        <h1>Search restaurants by UK postcode</h1>
        <p className="hero-copy">
          This app fetches restaurant data from the Just Eat API and shows only
          the four requested fields: name, cuisines, rating, and address.
        </p>

        <form className="search-form" onSubmit={handleSubmit}>
          <label className="search-label" htmlFor="postcode">
            UK postcode
          </label>

          <div className="search-controls">
            <input
              id="postcode"
              name="postcode"
              type="text"
              value={postcodeInput}
              onChange={(event) => setPostcodeInput(event.target.value)}
              placeholder="Enter a UK postcode"
              autoComplete="postal-code"
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </section>

      <section className="results-section">
        <div className="results-header">
          <h2>{resultTitle}</h2>
          <p>{restaurants.length} restaurant(s) shown</p>
        </div>

        {errorMessage ? <div className="message error">{errorMessage}</div> : null}
        {isLoading ? <div className="message">Loading restaurants...</div> : null}

        {!isLoading && !errorMessage && restaurants.length === 0 ? (
          <div className="message">
            No restaurants loaded yet. Search using a UK postcode to begin.
          </div>
        ) : null}
      </section>
    </main>
  )
}

export default App