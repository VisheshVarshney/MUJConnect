import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock } from 'lucide-react';
import TiltedCard from '../components/TiltedCard';

const restaurants = [
  {
    id: 1,
    name: 'Dialog Cafe',
    logo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&auto=format&fit=crop&q=60',
    banner: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Your cozy cafe serving delicious pizzas and beverages.',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789'],
  },
  // ... (keep other restaurants data)
];

export default function MUJMenus() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        MUJ Restaurants
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/menu/${restaurant.id}`}
            className="block"
          >
            <TiltedCard
              imageSrc={restaurant.banner}
              altText={restaurant.name}
              containerHeight="400px"
              containerWidth="100%"
              showMobileWarning={false}
              displayOverlayContent={true}
              overlayContent={
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-[15px]">
                  <div className="flex justify-center">
                    <img
                      src={restaurant.logo}
                      alt={`${restaurant.name} logo`}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  </div>

                  <div className="mt-auto">
                    <h2 className="text-2xl font-bold text-white mb-2 line-clamp-1">
                      {restaurant.name}
                    </h2>
                    <p className="text-blue-100 mb-4 line-clamp-2 text-sm">
                      {restaurant.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center text-blue-100 text-sm truncate">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{restaurant.location}</span>
                      </div>
                      <div className="flex items-center text-blue-100 text-sm truncate">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{restaurant.timings}</span>
                      </div>
                      <div className="flex items-center text-blue-100 text-sm truncate">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{restaurant.contact[0]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </Link>
        ))}
      </div>
    </div>
  );
}