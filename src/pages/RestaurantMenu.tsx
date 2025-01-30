import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import TiltedCard from '../components/TiltedCard';

const restaurants = {
  1: {
    name: 'Dialog Cafe',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Your favorite pizza cafe!',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789', '9876543210'],
    menus: [
      { id: 1, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/Dialog1.jpg' },
      { id: 2, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/Dialog2.jpg' },
      { id: 3, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/Dialog3.jpg' },
    ],
  },
  2: {
    name: 'Zaika',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Flavor-packed, budget-friendly veg and non-veg heaven.',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789', '9876543210'],
    menus: [
      { id: 1, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/zaika1.jpg' },
      { id: 2, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/zaika2.jpg' },
      { id: 3, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/zaika3.jpg' },
      { id: 4, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/zaika4.jpg' },
    ],
  },
  3: {
    name: 'Chatkara',
    image: 'https://images.unsplash.com/photo-1589734435753-747b0aa53b78?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'The ultimate stop for smoky, spicy, and satisfying eats.',
    location: 'B1 - GHS',
    timings: '10:00 AM - 4:00 AM',
    contact: ['0123456789', '9876543210'],
    menus: [
      { id: 1, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/chatkara1.jpg' },
      { id: 2, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/chatkara2.jpg' },
      { id: 3, image: 'https://res.cloudinary.com/dcvmvxbyf/image/upload/v1737738362/chatkara3.jpg' },
    ],
  },
};

export default function RestaurantMenu() {
  const { id } = useParams();
  const [showContacts, setShowContacts] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const nextSlide = () => {
    setCurrentSlide((prev) => 
      prev === restaurant.menus.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
      prev === 0 ? restaurant.menus.length - 1 : prev - 1
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-amoled rounded-xl shadow-lg overflow-hidden">
        <div className="relative h-96">
          <TiltedCard
            imageSrc={restaurant.image}
            altText={restaurant.name}
            containerHeight="384px"
            containerWidth="100%"
            imageHeight="384px"
            imageWidth="100%"
            scaleOnHover={1.05}
            rotateAmplitude={8}
            showMobileWarning={false}
            showTooltip={false}
            displayOverlayContent={true}
            overlayContent={
              <div className="absolute inset-0 flex items-end p-8 bg-gradient-to-t from-black/60 to-transparent">
                <h1 className="text-4xl font-bold text-white">
                  {restaurant.name}
                </h1>
              </div>
            }
          />
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
            <div className="relative">
              <div className="overflow-hidden rounded-lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="aspect-[4/3] relative"
                  >
                    <img
                      src={restaurant.menus[currentSlide].image}
                      alt={`Menu ${currentSlide + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

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

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {restaurant.menus.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? 'bg-white w-4'
                        : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button
              onClick={() => setShowContacts(!showContacts)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={showContacts ? { backgroundColor: '#EF4444' } : {}}
            >
              <Phone className="w-5 h-5" />
              <span>Contact</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {showContacts && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 overflow-hidden"
              >
                <div className="p-4 bg-gray-50 dark:bg-amoled-light rounded-lg">
                  <h3 className="font-semibold mb-2 dark:text-white">
                    Contact Numbers:
                  </h3>
                  <div className="space-y-2">
                    {restaurant.contact.map((number, index) => (
                      <motion.a
                        key={index}
                        href={`tel:${number}`}
                        className="block text-blue-500 hover:text-blue-600"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {number}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}