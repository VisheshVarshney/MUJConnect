import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Sun, 
  Moon,
  Car,
  Info,
  Hash,
  Shield
} from 'lucide-react';
import { useThemeStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Navigation() {
  const { isDark, toggleDark: toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-amoled border-b dark:border-gray-800">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-blue-500">
            MUJ Connect
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => toggleTheme()}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        <div className="flex-1 max-w-screen-xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-blue-500">
                MUJ Connect
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => toggleTheme()}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Left Sidebar */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 md:pt-16 md:border-r dark:border-gray-800 bg-white dark:bg-amoled">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-4 py-4 space-y-2">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-3" />
              Home
            </Link>
            <Link
              to="/muj-menus"
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
            >
              <Hash className="w-5 h-5 mr-3" />
              MUJ Menus
            </Link>
            <Link
              to="/car-rental"
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
            >
              <Car className="w-5 h-5 mr-3" />
              Car Rental
            </Link>
            <Link
              to="/about"
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
            >
              <Info className="w-5 h-5 mr-3" />
              About Us
            </Link>
            <Link
              to="/admin"
              className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
            >
              <Shield className="w-5 h-5 mr-3" />
              Admin
            </Link>

            <div className="mt-8">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quick Actions
              </p>
              <div className="mt-4 space-y-2">
                <Link
                  to="/search"
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5 mr-3" />
                  Search
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 mr-3" />
                  Notifications
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Trending Topics
              </p>
              <div className="mt-4 space-y-2">
                <Link
                  to="/tag/MUJLife"
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
                >
                  <Hash className="w-5 h-5 mr-3" />
                  #MUJLife
                </Link>
                <Link
                  to="/tag/CampusEvents"
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
                >
                  <Hash className="w-5 h-5 mr-3" />
                  #CampusEvents
                </Link>
                <Link
                  to="/tag/StudentLife"
                  className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-amoled-light rounded-lg transition-colors"
                >
                  <Hash className="w-5 h-5 mr-3" />
                  #StudentLife
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </nav>
  );
} 