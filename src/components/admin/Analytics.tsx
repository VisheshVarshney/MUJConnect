import React from 'react';
import { Users, BarChart2, Shield } from 'lucide-react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalPosts: number;
  dailyPosts: number;
  monthlyPosts: number;
  totalLikes: number;
  totalComments: number;
}

interface AnalyticsProps {
  stats: Stats | null;
}

export default function Analytics({ stats }: AnalyticsProps) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-500" />
            User Statistics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="font-semibold dark:text-white">{stats.totalUsers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-semibold dark:text-white">{stats.activeUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
            <BarChart2 className="w-5 h-5 mr-2 text-green-500" />
            Post Statistics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Posts</span>
              <span className="font-semibold dark:text-white">{stats.totalPosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Daily Posts</span>
              <span className="font-semibold dark:text-white">{stats.dailyPosts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Monthly Posts</span>
              <span className="font-semibold dark:text-white">{stats.monthlyPosts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-amoled-light p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-purple-500" />
            Engagement Statistics
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
              <span className="font-semibold dark:text-white">{stats.totalLikes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Comments</span>
              <span className="font-semibold dark:text-white">{stats.totalComments}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}