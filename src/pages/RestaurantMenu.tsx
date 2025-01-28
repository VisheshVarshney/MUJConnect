import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Clock, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ShinyButton from '../components/ShinyButton';

const restaurants = {
  1: {
    name: 'Dialog Cafe',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Your favorite pizza cafe!',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789', '9876543210'],
    menus: [
      { id: 1, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/Dialog1.jpg', height: 400 },
      { id: 2, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/Dialog2.jpg', height: 300 },
      { id: 3, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/Dialog3.jpg', height: 350 },
    ],
  },
  // ... (keep other restaurant data)
};

export default function RestaurantMenu() {
  const { id } = useParams();
  const [showContacts, setShowContacts] = useState(false);
  const [currentMenuIndex, setCurrentMenuIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const restaurant = restaurants[Number(id)];

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold dark:text-white">
          Restaurant not found
        </h1>
      </div>
    );
  }

  const handlePrevMenu = () => {
    setCurrentMenuIndex((prev) => (prev > 0 ? prev - 1 : restaurant.menus.length - 1));
  };

  const handleNextMenu = () => {
    setCurrentMenuIndex((prev) => (prev < restaurant.menus.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-amoled rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-64 md:h-96">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <h1 className="absolute bottom-6 left-6 text-4xl font-bold text-white">
            {restaurant.name}
          </h1>
        </div>

        <div className="p-6">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {restaurant.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <MapPin className="w-5 h-5 mr-2" />
              {restaurant.location}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <Clock className="w-5 h-5 mr-2" />
              {restaurant.timings}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Menu</h2>
            
            <div className="relative aspect-[4/3] max-w-3xl mx-auto">
              <div 
                className="relative w-full h-full cursor-pointer"
                onClick={() => setSelectedImage(restaurant.menus[currentMenuIndex].image)}
              >
                <img
                  src={restaurant.menus[currentMenuIndex].image}
                  alt={`${restaurant.name} menu ${currentMenuIndex + 1}`}
                  className="w-full h-full object-contain rounded-lg hover:opacity-95 transition-opacity"
                />
                
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4">
                  <button
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevMenu();
                    }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextMenu();
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4 gap-2">
              {restaurant.menus.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentMenuIndex ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  onClick={() => setCurrentMenuIndex(index)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <ShinyButton
              onClick={() => setShowContacts(!showContacts)}
              className="flex items-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>Contact Restaurant</span>
            </ShinyButton>
          </div>

          <AnimatePresence>
            {showContacts && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-4 bg-gray-50 dark:bg-amoled-light rounded-lg"
              >
                <h3 className="font-semibold mb-2 dark:text-white">
                  Contact Numbers:
                </h3>
                <div className="space-y-2">
                  {restaurant.contact.map((number, index) => (
                    <a
                      key={index}
                      href={`tel:${number}`}
                      className="block text-blue-500 hover:text-blue-600"
                    >
                      {number}
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage}
              alt="Menu preview"
              className="max-w-full max-h-full object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}