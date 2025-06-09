import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Mail } from 'lucide-react';

export default function EmailChange() {
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have access to the recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('Invalid or expired link');
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newEmail !== confirmEmail) {
      toast.error('Email addresses do not match');
      return;
    }

    setIsLoading(true);
    try {
      // First update the email
      const { error: updateError } = await supabase.auth.updateUser({ 
        email: newEmail 
      });
      
      if (updateError) throw updateError;

      toast.success('Confirmation email sent to your new email address');
      
      // Sign out after email change
      await supabase.auth.signOut();
      
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Error updating email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Mail className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Change Email</h1>
          <p className="text-gray-600 mt-2">Enter your new email address below</p>
        </div>

        <form onSubmit={handleEmailChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Enter your new email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Email</label>
            <input
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Confirm your new email"
            />
          </div>

          {newEmail && confirmEmail && newEmail !== confirmEmail && (
            <p className="text-sm text-red-600">Email addresses do not match</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !newEmail || !confirmEmail || newEmail !== confirmEmail}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Email'}
          </button>
        </form>
      </div>
    </motion.div>
  );
} 