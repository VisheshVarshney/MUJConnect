import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

interface Restaurant {
  id: string;
  name: string;
  opening_hours: string;
  location: string;
  banner_image: string;
  logo_image: string;
  situated_in: string;
  contact_numbers: { phone_number: string }[];
  menu_images: { url: string }[];
}

interface RestaurantFormState {
  name: string;
  opening_hours: string;
  location: string;
  banner_image: string;
  logo_image: string;
  situated_in: string;
  contact_numbers: { phone_number: string }[];
  menu_images: { url: string }[];
}

const defaultFormState: RestaurantFormState = {
  name: '',
  opening_hours: '',
  location: '',
  banner_image: '',
  logo_image: '',
  situated_in: 'Inside Campus',
  contact_numbers: [{ phone_number: '' }],
  menu_images: [{ url: '' }]
};

export default function RestaurantManager() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [restaurantForm, setRestaurantForm] = useState<RestaurantFormState>(defaultFormState);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select(`
          *,
          contact_numbers (phone_number),
          menu_images (url)
        `)
        .order('name');

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Error loading restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRestaurant = async () => {
    try {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantForm.name,
          opening_hours: restaurantForm.opening_hours,
          location: restaurantForm.location,
          banner_image: restaurantForm.banner_image,
          logo_image: restaurantForm.logo_image,
          situated_in: restaurantForm.situated_in
        })
        .select()
        .single();

      if (restaurantError) throw restaurantError;

      // Add contact numbers
      if (restaurantForm.contact_numbers.length > 0) {
        const { error: contactError } = await supabase
          .from('contact_numbers')
          .insert(
            restaurantForm.contact_numbers.map(contact => ({
              restaurant_id: restaurant.id,
              phone_number: contact.phone_number
            }))
          );

        if (contactError) throw contactError;
      }

      // Add menu images
      if (restaurantForm.menu_images.length > 0) {
        const { error: imageError } = await supabase
          .from('menu_images')
          .insert(
            restaurantForm.menu_images.map(image => ({
              restaurant_id: restaurant.id,
              url: image.url
            }))
          );

        if (imageError) throw imageError;
      }

      toast.success('Restaurant added successfully');
      setShowRestaurantForm(false);
      setRestaurantForm(defaultFormState);
      fetchRestaurants();
    } catch (error) {
      console.error('Error adding restaurant:', error);
      toast.error('Error adding restaurant');
    }
  };

  const handleUpdateRestaurant = async () => {
    if (!editingRestaurant) return;

    try {
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .update({
          name: restaurantForm.name,
          opening_hours: restaurantForm.opening_hours,
          location: restaurantForm.location,
          banner_image: restaurantForm.banner_image,
          logo_image: restaurantForm.logo_image,
          situated_in: restaurantForm.situated_in
        })
        .eq('id', editingRestaurant.id);

      if (restaurantError) throw restaurantError;

      // Update contact numbers
      await supabase
        .from('contact_numbers')
        .delete()
        .eq('restaurant_id', editingRestaurant.id);

      if (restaurantForm.contact_numbers.length > 0) {
        const { error: contactError } = await supabase
          .from('contact_numbers')
          .insert(
            restaurantForm.contact_numbers.map(contact => ({
              restaurant_id: editingRestaurant.id,
              phone_number: contact.phone_number
            }))
          );

        if (contactError) throw contactError;
      }

      // Update menu images
      await supabase
        .from('menu_images')
        .delete()
        .eq('restaurant_id', editingRestaurant.id);

      if (restaurantForm.menu_images.length > 0) {
        const { error: imageError } = await supabase
          .from('menu_images')
          .insert(
            restaurantForm.menu_images.map(image => ({
              restaurant_id: editingRestaurant.id,
              url: image.url
            }))
          );

        if (imageError) throw imageError;
      }

      toast.success('Restaurant updated successfully');
      setShowRestaurantForm(false);
      setEditingRestaurant(null);
      setRestaurantForm(defaultFormState);
      fetchRestaurants();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      toast.error('Error updating restaurant');
    }
  };

  const handleDeleteRestaurant = async (id: string) => {
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Restaurant deleted successfully');
      fetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Error deleting restaurant');
    }
  };

  const startEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setRestaurantForm({
      name: restaurant.name,
      opening_hours: restaurant.opening_hours,
      location: restaurant.location,
      banner_image: restaurant.banner_image,
      logo_image: restaurant.logo_image,
      situated_in: restaurant.situated_in,
      contact_numbers: restaurant.contact_numbers || [{ phone_number: '' }],
      menu_images: restaurant.menu_images || [{ url: '' }]
    });
    setShowRestaurantForm(true);
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search restaurants..."
            className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-amoled-light rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        <button
          onClick={() => {
            setEditingRestaurant(null);
            setRestaurantForm(defaultFormState);
            setShowRestaurantForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Restaurant
        </button>
      </div>

      {/* Restaurants List */}
      <div className="bg-white dark:bg-amoled-light rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6 dark:text-white">Restaurants</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRestaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-amoled-light rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={restaurant.logo_image}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold dark:text-white">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{restaurant.location}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(restaurant)}
                    className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRestaurant(restaurant.id)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {filteredRestaurants.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No restaurants found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Restaurant Form Modal */}
      <AnimatePresence>
        {showRestaurantForm && (
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
              className="bg-white dark:bg-amoled rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold dark:text-white">
                    {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRestaurantForm(false);
                      setEditingRestaurant(null);
                      setRestaurantForm(defaultFormState);
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={restaurantForm.name}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Opening Hours</label>
                  <input
                    type="text"
                    value={restaurantForm.opening_hours}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, opening_hours: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <input
                    type="text"
                    value={restaurantForm.location}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Banner Image URL</label>
                  <input
                    type="text"
                    value={restaurantForm.banner_image}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, banner_image: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo Image URL</label>
                  <input
                    type="text"
                    value={restaurantForm.logo_image}
                    onChange={(e) => setRestaurantForm({ ...restaurantForm, logo_image: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Situated In
                  </label>
                  <select
                    value={restaurantForm.situated_in}
                    onChange={(e) =>
                      setRestaurantForm((prev) => ({
                        ...prev,
                        situated_in: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-amoled border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inside Campus">Inside Campus</option>
                    <option value="Outside Campus">Outside Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Numbers</label>
                  {restaurantForm.contact_numbers.map((contact, index) => (
                    <div key={index} className="flex space-x-2 mt-2">
                      <input
                        type="text"
                        value={contact.phone_number}
                        onChange={(e) => {
                          const newNumbers = [...restaurantForm.contact_numbers];
                          newNumbers[index] = { phone_number: e.target.value };
                          setRestaurantForm({ ...restaurantForm, contact_numbers: newNumbers });
                        }}
                        placeholder="Enter phone number"
                        className="flex-1 rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newNumbers = restaurantForm.contact_numbers.filter((_, i) => i !== index);
                          setRestaurantForm({ ...restaurantForm, contact_numbers: newNumbers });
                        }}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRestaurantForm({
                        ...restaurantForm,
                        contact_numbers: [...restaurantForm.contact_numbers, { phone_number: '' }]
                      });
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Phone Number
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Menu Images</label>
                  {restaurantForm.menu_images.map((image, index) => (
                    <div key={index} className="flex space-x-2 mt-2">
                      <input
                        type="text"
                        value={image.url}
                        onChange={(e) => {
                          const newImages = [...restaurantForm.menu_images];
                          newImages[index] = { url: e.target.value };
                          setRestaurantForm({ ...restaurantForm, menu_images: newImages });
                        }}
                        placeholder="Enter image URL"
                        className="flex-1 rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = restaurantForm.menu_images.filter((_, i) => i !== index);
                          setRestaurantForm({ ...restaurantForm, menu_images: newImages });
                        }}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setRestaurantForm({
                        ...restaurantForm,
                        menu_images: [...restaurantForm.menu_images, { url: '' }]
                      });
                    }}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Add Menu Image
                  </button>
                </div>
              </div>

              <div className="p-6 border-t dark:border-gray-700">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRestaurantForm(false);
                      setEditingRestaurant(null);
                      setRestaurantForm(defaultFormState);
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={editingRestaurant ? handleUpdateRestaurant : handleAddRestaurant}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {editingRestaurant ? 'Update' : 'Add'} Restaurant
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}