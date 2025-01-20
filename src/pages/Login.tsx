import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { LogIn, ArrowLeft, Chrome } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Try direct login first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });

      // If login fails and the identifier doesn't look like an email,
      // it might be a username
      if (signInError && !identifier.includes('@')) {
        // Look up the user by username
        const { data: users } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier);

        if (!users || users.length === 0) {
          throw new Error('Username not found');
        }

        // Get the user's auth details
        const { data: authUser } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', users[0].id)
          .single();

        if (!authUser?.email) {
          throw new Error('No email found for this username');
        }

        // Try login with the found email
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: authUser.email,
          password,
        });

        if (secondSignInError) {
          if (secondSignInError.message.includes('Invalid login credentials')) {
            throw new Error('Incorrect password');
          }
          throw secondSignInError;
        }
      } else if (signInError) {
        throw signInError;
      }

      navigate('/feed');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/feed`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Google login error:', error);
      toast.error('Error signing in with Google');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter your email or username');
      return;
    }

    setIsLoading(true);
    try {
      let email = identifier;
      if (!identifier.includes('@')) {
        // Look up the user by username
        const { data: users } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier);

        if (!users || users.length === 0) {
          throw new Error('Username not found');
        }

        // Get the user's auth details
        const { data: authUser } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', users[0].id)
          .single();

        if (!authUser?.email) {
          throw new Error('No email found for this username');
        }

        email = authUser.email;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      toast.success('Password reset instructions sent to your email');
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <button
            onClick={() => setShowForgotPassword(false)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </button>

          <div className="text-center mb-8">
            <LogIn className="w-12 h-12 mx-auto text-blue-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email or username and we'll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email or Username</label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <LogIn className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to continue to MUJ Connect</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email or Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Chrome className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}