import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import FancyFollowButton from './FancyFollowButton';

interface MUJMenuProps {
  currentUser: any;
}

export default function MUJMenu({ currentUser }: MUJMenuProps) {
  const [mujUsers, setMujUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadMujUsers();
  }, []);

  const loadMujUsers = async () => {
    try {
      setIsLoading(true);
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_superadmin', true)
        .order('full_name');

      if (error) throw error;

      setMujUsers(users || []);
      
      // Load follow status for each user
      if (currentUser) {
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', currentUser.id);

        const followMap = (follows || []).reduce((acc: { [key: string]: boolean }, follow) => {
          acc[follow.following_id] = true;
          return acc;
        }, {});

        setFollowing(followMap);
      }
    } catch (error) {
      console.error('Error loading MUJ users:', error);
      toast.error('Error loading MUJ users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      if (!currentUser) {
        toast.error('Please log in to follow users');
        return;
      }

      if (following[userId]) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .match({ follower_id: currentUser.id, following_id: userId });

        if (error) throw error;
        setFollowing(prev => ({ ...prev, [userId]: false }));
        toast.success('User unfollowed successfully');
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({ follower_id: currentUser.id, following_id: userId });

        if (error) throw error;
        setFollowing(prev => ({ ...prev, [userId]: true }));
        toast.success('User followed successfully');
      }
    } catch (error: any) {
      toast.error('Error updating follow status');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <img
            src="https://manipal.edu/content/dam/manipal/mu/images/logo.png"
            alt="MUJ Logo"
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">MUJ Team</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Official MUJ accounts</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mujUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <img
                src={user.avatar_url || `https://api.dicebear.com/9.x/adventurer-neutral/svg?backgroundColor=b6e3f4,c0aede,d1d4f9`}
                alt={user.full_name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{user.full_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">@{user.username}</p>
              </div>
            </div>
            <FancyFollowButton
              isFollowing={following[user.id] || false}
              onToggleFollow={() => handleFollow(user.id)}
              disabled={!currentUser}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
} 