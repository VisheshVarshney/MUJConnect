import React from 'react';
import { motion } from 'framer-motion';
import { Car, Construction } from 'lucide-react';

export default function CarRental() {
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
            MUJ Car Rentals
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90"
          >
            Find the perfect ride for your journey
          </motion.p>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-amoled-light rounded-xl shadow-lg p-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Car className="w-16 h-16 text-blue-500" />
              <Construction className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            Upcoming Feature ;)
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're working hard to bring you an amazing car rental experience. Soon you'll be able to:
          </p>
          <ul className="mt-6 space-y-2 text-gray-600 dark:text-gray-400">
            <li>• Compare prices across different rental shops</li>
            <li>• Find the best deals for your preferred car model</li>
            <li>• Book rentals directly through the platform</li>
            <li>• View detailed car specifications and availability</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}