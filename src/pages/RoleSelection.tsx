import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function RoleSelection() {
  const navigate = useNavigate();
  const { role, loading } = useAuth();

  const handleRoleSelect = (selectedRole: 'admin' | 'staff') => {
    navigate(selectedRole === 'admin' ? '/admin' : '/staff');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">Please log in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Select Your Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose which dashboard you'd like to access
          </p>
        </motion.div>

        <div className="mt-8 space-y-4">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleRoleSelect('staff')}
            className="relative w-full flex items-center justify-center px-8 py-6 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 group-hover:text-blue-700" />
              <span className="ml-4 text-xl font-medium text-gray-900">Staff Dashboard</span>
            </div>
          </motion.button>

          {role === 'admin' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => handleRoleSelect('admin')}
              className="relative w-full flex items-center justify-center px-8 py-6 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-purple-600 group-hover:text-purple-700" />
                <span className="ml-4 text-xl font-medium text-gray-900">Admin Dashboard</span>
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}