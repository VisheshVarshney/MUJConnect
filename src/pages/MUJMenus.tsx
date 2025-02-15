import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface Restaurant {
  id: string;
  name: string;
  opening_hours: string;
  location: string;
  banner_image: string;
  logo_image: string;
  contact_numbers: { phone_number: string }[];
}

export default function MUJMenus() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('restaurants')
        .select(`
          *,
          contact_numbers (phone_number)
        `)
        .order('name');

      if (fetchError) throw fetchError;
      
      setRestaurants(data || []);
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      setError(error.message);
      toast.error('Error loading restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amoled flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amoled">
      {/* Hero Section */}
      <div className="relative h-[300px] bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            MUJ Food Court
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-8"
          >
            Discover all your favorite campus eateries in one place
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search restaurants..."
              className="w-full px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </motion.div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
            {error}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No restaurants found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/menu/${restaurant.id}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-amoled-light rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={restaurant.banner_image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <img
                            src={restaurant.logo_image}
                            alt=""
                            className="w-12 h-12 rounded-full border-2 border-white"
                          />
                          <div>
                            <h2 className="text-xl font-bold text-white">
                              {restaurant.name}
                            </h2>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{restaurant.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{restaurant.opening_hours}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{restaurant.contact_numbers[0]?.phone_number}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}