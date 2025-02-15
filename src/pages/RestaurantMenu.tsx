import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
  menu_items: MenuItem[];
  menu_images: { url: string }[];
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  availability: boolean;
}

export default function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select(`
          *,
          contact_numbers (phone_number),
          menu_items (*),
          menu_images (url)
        `)
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;
      if (!restaurant) throw new Error('Restaurant not found');

      setRestaurant(restaurant);
    } catch (error: any) {
      console.error('Error fetching restaurant:', error);
      setError(error.message);
      toast.error('Error loading restaurant data');
    } finally {
      setIsLoading(false);
    }
  };

  const nextSlide = () => {
    if (!restaurant?.menu_images) return;
    setCurrentSlide((prev) => 
      prev === restaurant.menu_images.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!restaurant?.menu_images) return;
    setCurrentSlide((prev) => 
      prev === 0 ? restaurant.menu_images.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amoled flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amoled">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-amoled-light rounded-xl shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold dark:text-white mb-4">
              {error || 'Restaurant not found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please try again later or contact support if the problem persists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amoled">
      {/* Hero Section */}
      <div className="relative h-[400px]">
        <img
          src={restaurant.banner_image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={restaurant.logo_image}
                  alt=""
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {restaurant.name}
                  </h1>
                  <p className="text-white/90">{restaurant.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg"
          >
            <MapPin className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold dark:text-white">Location</h3>
            <p className="text-gray-600 dark:text-gray-400">{restaurant.location}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg"
          >
            <Clock className="w-6 h-6 text-green-500 mb-2" />
            <h3 className="font-semibold dark:text-white">Hours</h3>
            <p className="text-gray-600 dark:text-gray-400">{restaurant.opening_hours}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg"
          >
            <Phone className="w-6 h-6 text-red-500 mb-2" />
            <h3 className="font-semibold dark:text-white">Contact</h3>
            {restaurant.contact_numbers.map((contact, index) => (
              <a
                key={index}
                href={`tel:${contact.phone_number}`}
                className="block text-blue-500 hover:text-blue-600"
              >
                {contact.phone_number}
              </a>
            ))}
          </motion.div>
        </div>

        {/* Menu Image Carousel */}
        {restaurant.menu_images && restaurant.menu_images.length > 0 && (
          <div className="mb-8">
            <div className="bg-white dark:bg-amoled-light rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 dark:text-white">Menu Images</h2>
              
              <div className="relative">
                <div className="aspect-[16/9] overflow-hidden rounded-lg">
                  <img
                    src={restaurant.menu_images[currentSlide].url}
                    alt={`Menu ${currentSlide + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowFullMenu(true)}
                  />
                </div>

                {restaurant.menu_images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Thumbnail Navigation */}
                <div className="flex justify-center mt-4 space-x-2">
                  {restaurant.menu_images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        currentSlide === index
                          ? 'bg-blue-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items Section */}
        
      </div>

      {/* Full-screen Menu Image Viewer */}
      <AnimatePresence>
        {showFullMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <button
              onClick={() => setShowFullMenu(false)}
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="relative max-w-6xl w-full">
              <img
                src={restaurant.menu_images[currentSlide].url}
                alt={`Menu ${currentSlide + 1}`}
                className="w-full h-full object-contain"
              />

              {restaurant.menu_images.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}

              {/* Thumbnail Navigation */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
                {restaurant.menu_images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentSlide === index
                        ? 'bg-white'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}