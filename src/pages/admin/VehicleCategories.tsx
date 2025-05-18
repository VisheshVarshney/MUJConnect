import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, AlertCircle, Car, DollarSign, Info } from 'lucide-react';
import { getVehicleCategories, createVehicleCategory, updateVehicleCategory } from '../../lib/api';
import type { Database } from '../../lib/database.types';

type VehicleCategory = Database['public']['Tables']['vehicle_categories']['Row'];

export function VehicleCategories() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await getVehicleCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load vehicle categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const categoryData = {
        name: formData.get('name') as string,
        base_rate: parseFloat(formData.get('baseRate') as string),
        description: formData.get('description') as string
      };

      if (selectedCategory) {
        await updateVehicleCategory(selectedCategory.id, categoryData);
      } else {
        await createVehicleCategory(categoryData);
      }

      await loadCategories();
      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      setError('Failed to save vehicle category');
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicle Categories</h1>
            <p className="mt-1 text-sm text-gray-500">Manage vehicle types and their base rates</p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory(null);
              setIsModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Car className="h-6 w-6 text-blue-600" />
                    <h3 className="ml-2 text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-4 flex items-baseline">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{category.base_rate.toFixed(2)}</span>
                  <span className="ml-1 text-sm text-gray-500">base rate</span>
                </div>

                {category.description && (
                  <div className="mt-4 flex items-start">
                    <Info className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <p className="ml-2 text-sm text-gray-600">{category.description}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-6 py-3">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(category.updated_at).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-semibold mb-4">
                {selectedCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Category Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      defaultValue={selectedCategory?.name}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="baseRate" className="block text-sm font-medium text-gray-700">
                      Base Rate
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="baseRate"
                        id="baseRate"
                        defaultValue={selectedCategory?.base_rate}
                        required
                        min="0"
                        step="0.01"
                        className="pl-7 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      defaultValue={selectedCategory?.description || ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    ></textarea>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {selectedCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}