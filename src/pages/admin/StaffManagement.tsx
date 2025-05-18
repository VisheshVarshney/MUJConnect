import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Edit2, Trash2, UserCheck, UserX, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

export function StaffManagement() {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setStaff(data || []);
    } catch (err) {
      setError('Failed to load staff members');
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
      if (!selectedStaff) throw new Error('No staff member selected');

      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: formData.get('email') as string,
          full_name: formData.get('fullName') as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedStaff.id);

      if (updateError) throw updateError;

      await loadStaff();
      setIsModalOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      setError('Failed to update staff member');
      console.error(err);
    }
  }

  async function handleRegistration(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: registrationData.email,
        password: registrationData.password,
        options: {
          data: {
            full_name: registrationData.fullName
          }
        }
      });

      if (signUpError) throw signUpError;

      await loadStaff();
      setIsRegistrationModalOpen(false);
      setRegistrationData({
        email: '',
        password: '',
        fullName: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to register user');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!staffToDelete) return;

    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', staffToDelete.id);

      if (deleteError) throw deleteError;

      await loadStaff();
      setIsDeleteModalOpen(false);
      setStaffToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <button
            onClick={() => setIsRegistrationModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Register New User
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <UserX className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.map((member) => (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.active ? 'Active' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStaff(member);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setStaffToDelete(member);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Registration Modal */}
        {isRegistrationModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Register New User</h2>
                <button
                  onClick={() => setIsRegistrationModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <UserX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={registrationData.fullName}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={registrationData.email}
                    onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type="password"
                      value={registrationData.password}
                      onChange={(e) => setRegistrationData(prev => ({ ...prev, password: e.target.value }))}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                      minLength={6}
                    />
                    <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsRegistrationModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Registering...' : 'Register User'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-semibold mb-4">Edit Staff Member</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      defaultValue={selectedStaff?.full_name}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={selectedStaff?.email}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
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
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-semibold mb-4">Delete Staff Member</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {staffToDelete?.full_name}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}