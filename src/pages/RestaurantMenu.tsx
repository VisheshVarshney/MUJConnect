import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Clock, ArrowLeft, X, ChevronLeft, ChevronRight } from 'lucide-react';
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
  menu_images: { url: string }[];
}

interface ContactDialogProps {
  numbers: { phone_number: string }[];
  onClose: () => void;
}

interface ImageCarouselProps {
  images: { url: string }[];
  currentIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const ImageCarousel = ({ images, currentIndex, onClose, onPrevious, onNext }: ImageCarouselProps) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={onPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-300 z-10"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-white hover:text-gray-300 z-10"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        <img
          src={images[currentIndex].url}
          alt=""
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

const ContactDialog = ({ numbers, onClose }: ContactDialogProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-amoled rounded-xl shadow-lg max-w-md w-full"
      >
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold dark:text-white">Contact Numbers</h2>
            <button
              onClick={onClose}
              className="text-gray-500  hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {numbers.map((contact, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">{contact.phone_number}</span>
              <a
                href={`tel:${contact.phone_number}`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function RestaurantMenu() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showImageCarousel, setShowImageCarousel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          contact_numbers (phone_number),
          menu_images (url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Error loading restaurant details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? (restaurant?.menu_images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === (restaurant?.menu_images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amoled flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-amoled flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Restaurant not found
          </h1>
          <Link
            to="/muj-menus"
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-amoled">
      {/* Banner */}
      <div className="relative h-[300px]">
        <img
          src={restaurant.banner_image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center space-x-4">
              <img
                src={restaurant.logo_image}
                alt=""
                className="w-20 h-20 rounded-full border-4 border-white"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">{restaurant.name}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info Cards */}
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg"
          >
            <MapPin className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold dark:text-white">Location</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{restaurant.location}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg"
          >
            <Clock className="w-6 h-6 text-green-500 mb-2" />
            <h3 className="font-semibold dark:text-white">Opening Hours</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{restaurant.opening_hours}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg"
          >
            <Phone className="w-6 h-6 text-red-500 mb-2" />
            <h3 className="font-semibold dark:text-white">Contact</h3>
            {restaurant.contact_numbers.length === 1 ? (
              <a
                href={`tel:${restaurant.contact_numbers[0].phone_number}`}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-2"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </a>
            ) : (
              <button
                onClick={() => setShowContactDialog(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors mt-2"
              >
                <Phone className="w-4 h-4 mr-2" />
                View Numbers
              </button>
            )}
          </motion.div>
        </div>

        {/* Menu Images */}
        {restaurant.menu_images && restaurant.menu_images.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Menu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurant.menu_images.map((image, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setShowImageCarousel(true);
                  }}
                >
                  <img
                    src={image.url}
                    alt={`Menu ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-lg font-medium">View Menu</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Dialog */}
      <AnimatePresence>
        {showContactDialog && (
          <ContactDialog
            numbers={restaurant.contact_numbers}
            onClose={() => setShowContactDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Image Carousel */}
      <AnimatePresence>
        {showImageCarousel && (
          <ImageCarousel
            images={restaurant.menu_images}
            currentIndex={currentImageIndex}
            onClose={() => setShowImageCarousel(false)}
            onPrevious={handlePreviousImage}
            onNext={handleNextImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}