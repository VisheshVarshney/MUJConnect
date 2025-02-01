import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock } from 'lucide-react';
import TiltedCard from '../components/TiltedCard';

const restaurants = [
  {
    id: 1,
    name: 'Dialog Cafe',
    logo: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=200&auto=format&fit=crop&q=60',
    banner:
      'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Your cozy cafe serving delicious pizzas and beverages.',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789'],
  },
  {
    id: 2,
    name: 'Zaika',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Flavor-packed, budget-friendly veg and non-veg heaven.',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789'],
  },
  {
    id: 3,
    name: 'Chatkara',
    image:
      'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1738147093/twwlwvefeztiay4k5c0j.png',
    description: 'The ultimate stop for smoky, spicy, and satisfying eats.',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789'],
  },
];

export default function MUJMenus() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        MUJ Restaurants [BETA]
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/menu/${restaurant.id}`}
            className="block"
          >
            <div className="relative h-[400px]">
              <TiltedCard
                imageSrc={restaurant.banner || restaurant.image}
                altText={restaurant.name}
                captionText={restaurant.description}
                containerHeight="400px"
                containerWidth="100%"
                imageHeight="400px"
                imageWidth="100%"
                scaleOnHover={1.05}
                rotateAmplitude={7}
                showMobileWarning={false}
                displayOverlayContent={true}
                overlayContent={
                  <div className="absolute inset-0 p-6 flex flex-col justify-between rounded-[15px]">
                    {/* Blurred background only behind text */}
                    <div className="relative">
                      <div className="absolute inset-x-0 top-0 h-24 bg-black/30 backdrop-blur-md rounded-t-[15px]" />
                      <div className="flex items-center space-x-4 relative z-10 p-2">
                        <img
                          src={restaurant.logo || restaurant.image}
                          alt={`${restaurant.name} logo`}
                          className="w-20 h-20 rounded-full object-cover border-2 border-white"
                        />
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            {restaurant.name}
                          </h2>
                          <p className="text-sm text-gray-300"></p>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
