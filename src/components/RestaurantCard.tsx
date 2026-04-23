import type { Restaurant } from '../types/restaurant'

interface RestaurantCardProps {
  restaurant: Restaurant
}

export const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <article className="restaurant-card">
      <div className="restaurant-card__header">
        <h3>{restaurant.name}</h3>
        <span className="rating-badge">
          Rating: {restaurant.rating !== null ? restaurant.rating : 'N/A'}
        </span>
      </div>

      <dl className="restaurant-details">
        <div>
          <dt>Cuisines</dt>
          <dd>
            {restaurant.cuisines.length > 0
              ? restaurant.cuisines.join(', ')
              : 'Not available'}
          </dd>
        </div>

        <div>
          <dt>Address</dt>
          <dd>{restaurant.address}</dd>
        </div>
      </dl>
    </article>
  )
}