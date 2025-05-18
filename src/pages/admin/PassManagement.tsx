import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, AlertCircle, Calendar, Car, Search,
  CheckCircle, XCircle, Clock, FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Pre-defined vehicle categories with proper UUIDs
const vehicleCategories = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Car', base_rate: 10 },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Motorcycle', base_rate: 5 },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Bus', base_rate: 20 },
  { id: '44444444-4444-4444-4444-444444444444', name: 'Truck', base_rate: 25 },
  { id: '55555555-5555-5555-5555-555555555555', name: 'Heavy Vehicle', base_rate: 30 }
];

export function PassManagement() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Form validation state
  const [formErrors, setFormErrors] = useState<{
    vehicleNumber?: string;
    categoryId?: string;
    validFrom?: string;
    validUntil?: string;
  }>({});

  React.useEffect(() => {
    loadPasses();
  }, []);

  async function loadPasses() {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('toll_passes')
        .select(`
          *,
          vehicle_categories (
            name,
            base_rate
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPasses(data || []);
    } catch (err) {
      console.error('Error loading passes:', err);
      setError('Failed to load passes');
    } finally {
      setLoading(false);
    }
  }

  const filteredPasses = passes.filter(pass => {
    const matchesSearch = pass.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || pass.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  function validateForm(formData: FormData): boolean {
    const errors: typeof formErrors = {};
    const vehicleNumber = formData.get('vehicleNumber') as string;
    const categoryId = formData.get('categoryId') as string;
    const validFrom = formData.get('validFrom') as string;
    const validUntil = formData.get('validUntil') as string;

    if (!vehicleNumber || vehicleNumber.length < 3) {
      errors.vehicleNumber = 'Vehicle number must be at least 3 characters';
    }

    if (!categoryId) {
      errors.categoryId = 'Please select a vehicle category';
    }

    if (!validFrom) {
      errors.validFrom = 'Please select a start date';
    }

    if (!validUntil) {
      errors.validUntil = 'Please select an end date';
    } else if (new Date(validUntil) <= new Date(validFrom)) {
      errors.validUntil = 'End date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    if (!validateForm(formData)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const passData = {
        vehicle_number: formData.get('vehicleNumber') as string,
        category_id: formData.get('categoryId') as string,
        valid_from: new Date(formData.get('validFrom') as string).toISOString(),
        valid_until: new Date(formData.get('validUntil') as string).toISOString(),
        status: formData.get('status') as 'active' | 'expired' | 'cancelled',
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (selectedPass) {
        const { error: updateError } = await supabase
          .from('toll_passes')
          .update(passData)
          .eq('id', selectedPass.id);

        if (updateError) throw updateError;
        setSuccess('Pass updated successfully');
      } else {
        const { error: insertError } = await supabase
          .from('toll_passes')
          .insert([passData]);

        if (insertError) throw insertError;
        setSuccess('Pass created successfully');
      }

      await loadPasses();
      setIsModalOpen(false);
      setSelectedPass(null);

      // Show success message for 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving pass:', err);
      setError('Failed to save toll pass');
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading && !passes.length) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pass Management</h1>
            <p className="mt-1 text-sm text-gray-500">Manage vehicle toll passes and their status</p>
          </div>
          <button
            onClick={() => {
              setSelectedPass(null);
              setIsModalOpen(true);
              setFormErrors({});
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Issue New Pass
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
            >
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-red-700">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-50 border-l-4 border-green-400 p-4 mb-6"
            >
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-green-700">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="md:w-64">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {vehicleCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPasses.map((pass) => (
                  <motion.tr
                    key={pass.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    layout
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {pass.vehicle_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicleCategories.find(cat => cat.id === pass.category_id)?.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${vehicleCategories.find(cat => cat.id === pass.category_id)?.base_rate}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(pass.valid_from).toLocaleDateString()} - {new Date(pass.valid_until).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(pass.status)}`}>
                        {pass.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPass(pass);
                          setIsModalOpen(true);
                          setFormErrors({});
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedPass ? 'Edit Pass' : 'Issue New Pass'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedPass ? 'Update the pass details below' : 'Fill in the pass details below'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                      Vehicle Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="vehicleNumber"
                        id="vehicleNumber"
                        defaultValue={selectedPass?.vehicle_number}
                        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          formErrors.vehicleNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.vehicleNumber && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.vehicleNumber}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                      Vehicle Category
                    </label>
                    <div className="mt-1">
                      <select
                        name="categoryId"
                        id="categoryId"
                        defaultValue={selectedPass?.category_id}
                        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          formErrors.categoryId ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select a category</option>
                        {vehicleCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name} - ${category.base_rate}
                          </option>
                        ))}
                      </select>
                      {formErrors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.categoryId}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">
                        Valid From
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="validFrom"
                          id="validFrom"
                          defaultValue={selectedPass?.valid_from.split('T')[0] || new Date().toISOString().split('T')[0]}
                          className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            formErrors.validFrom ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.validFrom && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.validFrom}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
                        Valid Until
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          name="validUntil"
                          id="validUntil"
                          defaultValue={selectedPass?.valid_until.split('T')[0]}
                          min={new Date().toISOString().split('T')[0]}
                          className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            formErrors.validUntil ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.validUntil && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.validUntil}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <select
                        name="status"
                        id="status"
                        defaultValue={selectedPass?.status || 'active'}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Clock className="animate-spin h-4 w-4 mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          {selectedPass ? 'Update Pass' : 'Create Pass'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}