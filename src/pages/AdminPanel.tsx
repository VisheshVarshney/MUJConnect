import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageCircle,
  Flag,
  Activity,
  Shield,
  UserX,
  Trash2,
  Eye,
  EyeOff,
  Ban,
  CheckCircle,
  AlertTriangle,
  Plus,
  Utensils,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Restaurant {
  id: string;
  name: string;
  opening_hours: string;
  location: string;
  banner_image: string;
  logo_image: string;
}

interface RestaurantFormData {
  name: string;
  opening_hours: string;
  location: string;
  banner_image: string;
  logo_image: string;
  contact_numbers: string[];
  menu_images: string[];
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    anonymousPosts: 0,
    reportedContent: 0,
    activeUsers: 0,
  });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: '',
    opening_hours: '',
    location: '',
    banner_image: '',
    logo_image: '',
    contact_numbers: [''],
    menu_images: [''],
  });

  useEffect(() => {
    checkAdmin();
    fetchStats();
    fetchRecentActivity();
    fetchRestaurants();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_superadmin) {
      navigate('/');
      toast.error('Unauthorized access');
    }
  };

  const fetchStats = async () => {
    try {
      const [
        { count: userCount },
        { count: postCount },
        { count: anonymousCount },
        { count: activeCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('posts').select('*', { count: 'exact' }),
        supabase.from('posts').select('*', { count: 'exact' }).eq('is_anonymous', true),
        supabase.from('profiles')
          .select('*', { count: 'exact' })
          .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      setStats({
        totalUsers: userCount || 0,
        totalPosts: postCount || 0,
        anonymousPosts: anonymousCount || 0,
        reportedContent: 0,
        activeUsers: activeCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (posts) setRecentPosts(posts);
      if (users) setRecentUsers(users);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select(`*,
                contact_numbers (phone_number),
                menu_images (url)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setRestaurants(data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Error fetching restaurants');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      setRecentPosts(prev => prev.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      toast.error('Error deleting post');
    }
  };

  const handleBanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', userId);

      if (error) throw error;
      
      setRecentUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, is_banned: true } : user
        )
      );
      toast.success('User banned successfully');
    } catch (error) {
      toast.error('Error banning user');
    }
  };

  const handleAddRestaurant = async () => {
    try {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          name: formData.name,
          opening_hours: formData.opening_hours,
          location: formData.location,
          banner_image: formData.banner_image || undefined,
          logo_image: formData.logo_image || undefined,
        })
        .select()
        .single();

      if (restaurantError) throw restaurantError;
  const menuImages = formData.menu_images.filter(url => url.trim());
  if (menuImages.length > 0) {
    const { error: menuImagesError } = await supabase
      .from('menu_images')
      .insert(
        menuImages.map(url => ({
          restaurant_id: restaurant.id,
          url: url,
        }))
      );

    if (menuImagesError) throw menuImagesError;
  }
      const contactNumbers = formData.contact_numbers.filter(num => num.trim());
      if (contactNumbers.length > 0) {
        const { error: contactError } = await supabase
          .from('contact_numbers')
          .insert(
            contactNumbers.map(number => ({
              restaurant_id: restaurant.id,
              phone_number: number,
            }))
          );

        if (contactError) throw contactError;
      }

      toast.success('Restaurant added successfully');
      setShowRestaurantForm(false);
      setFormStep(1);
      setFormData({
        name: '',
        opening_hours: '',
        location: '',
        banner_image: '',
        logo_image: '',
        contact_numbers: [''],
        menu_images: [''],
      });
      fetchRestaurants();
    } catch (error: any) {
      console.error('Error adding restaurant:', error);
      toast.error('Error adding restaurant');
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

  const renderRestaurantForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-amoled rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-semibold dark:text-white">Add Restaurant</h2>
            <p className="text-gray-500 dark:text-gray-400">Step {formStep} of 4</p>
          </div>

          <div className="p-6">
            {formStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Restaurant Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={formData.opening_hours}
                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.banner_image}
                    onChange={(e) => setFormData({ ...formData, banner_image: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Logo Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.logo_image}
                    onChange={(e) => setFormData({ ...formData, logo_image: e.target.value })}
                    className="mt-1 block w-full rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {formStep === 3 && (
              <div className="space-y-4">
                {formData.contact_numbers.map((number, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => {
                        const newNumbers = [...formData.contact_numbers];
                        newNumbers[index] = e.target.value;
                        setFormData({ ...formData, contact_numbers: newNumbers });
                      }}
                      className="flex-1 rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Phone number"
                    />
                    {index === formData.contact_numbers.length - 1 ? (
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          contact_numbers: [...formData.contact_numbers, '']
                        })}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const newNumbers = formData.contact_numbers.filter((_, i) => i !== index);
                          setFormData({ ...formData, contact_numbers: newNumbers });
                        }}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formStep === 4 && (
              <div className="space-y-4">
                {formData.menu_images.map((url, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.menu_images];
                        newUrls[index] = e.target.value;
                        setFormData({ ...formData, menu_images: newUrls });
                      }}
                      className="flex-1 rounded-md border dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Menu image URL"
                    />
                    {index === formData.menu_images.length - 1 ? (
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          menu_images: [...formData.menu_images, '']
                        })}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const newUrls = formData.menu_images.filter((_, i) => i !== index);
                          setFormData({ ...formData, menu_images: newUrls });
                        }}
                        className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t dark:border-gray-700 flex justify-between">
            <button
              onClick={() => {
                if (formStep === 1) {
                  setShowRestaurantForm(false);
                } else {
                  setFormStep(formStep - 1);
                }
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
            >
              {formStep === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={() => {
                if (formStep < 4) {
                  setFormStep(formStep + 1);
                } else {
                  handleAddRestaurant();
                }
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {formStep === 4 ? 'Add Restaurant' : 'Next'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white flex items-center">
          <Shield className="w-8 h-8 mr-2 text-red-500" />
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage users, content, and monitor platform activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
          { label: 'Total Posts', value: stats.totalPosts, icon: MessageCircle, color: 'green' },
          { label: 'Anonymous Posts', value: stats.anonymousPosts, icon: Eye, color: 'purple' },
          { label: 'Reported Content', value: stats.reportedContent, icon: Flag, color: 'red' },
          { label: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'yellow' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-amoled rounded-lg shadow-md p-6">
            <div className={`text-${color}-500 mb-2`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold dark:text-white">{value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-amoled rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold dark:text-white flex items-center">
            <Utensils className="w-5 h-5 mr-2" />
            Restaurants
          </h2>
          <button
            onClick={() => setShowRestaurantForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Restaurant</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Restaurant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {restaurants.map((restaurant) => (
                <tr key={restaurant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={restaurant.logo_image}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {restaurant.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {restaurant.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {restaurant.opening_hours}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDeleteRestaurant(restaurant.id)}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-amoled rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Posts</h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-amoled-light rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <img
                      src={post.profiles.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                      alt=""
                      className="w-8 h-8 rounded-full mr-2"
                    />
                    <div>
                      <div className="font-medium dark:text-white">{post.profiles.full_name}</div>
                      <div className="text-sm text-gray-500">{post.is_anonymous ? 'Anonymous Post' : '@' + post.profiles.username}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-2">{post.content}</p>
                </div>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-amoled rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Recent Users</h2>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-amoled-light rounded-lg">
                <div className="flex items-center">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                    alt=""
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="font-medium dark:text-white">{user.full_name}</div>
                    <div className="text-sm text-gray-500">@{user.username}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.is_banned ? (
                    <span className="px-3 py-1 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-full text-sm">
                      Banned
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Ban className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-amoled rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'View All Users', icon: Users, color: 'blue' },
            { label: 'Reported Content', icon: Flag, color: 'red' },
            { label: 'System Logs', icon: Activity, color: 'yellow' },
            { label: 'Security Settings', icon: Shield, color: 'green' },
          ].map(({ label, icon: Icon, color }) => (
            <button
              key={label}
              className={`p-4 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 rounded-lg hover:bg-${color}-100 dark:hover:bg-${color}-900/30 transition-colors flex items-center justify-center space-x-2`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {showRestaurantForm && renderRestaurantForm()}
    </motion.div>
  );
}