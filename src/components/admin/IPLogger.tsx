import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, Search, Calendar, Monitor, Smartphone, Tablet } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface IPLog {
  id: string;
  ip_address: string;
  user_id: string | null;
  location: {
    country: string;
    city: string;
    region: string;
  };
  device_info: {
    browser: string;
    os: string;
    device: string;
  };
  page_visited: string;
  created_at: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

export default function IPLogger() {
  const [logs, setLogs] = useState<IPLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState<'all' | 'authenticated' | 'anonymous'>('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('ip_logs')
        .select(`
          *,
          profiles (username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Error loading logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile')) return <Smartphone className="w-4 h-4" />;
    if (device.toLowerCase().includes('tablet')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.ip_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (currentFilter === 'authenticated') return matchesSearch && log.user_id;
    if (currentFilter === 'anonymous') return matchesSearch && !log.user_id;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-amoled-light rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>

          <select
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value as any)}
            className="px-4 py-2 border dark:border-gray-600 dark:bg-amoled-light rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="all">All Users</option>
            <option value="authenticated">Authenticated</option>
            <option value="anonymous">Anonymous</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-amoled-light rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-amoled-lighter">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm dark:text-white">{log.ip_address}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Map className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm dark:text-white">
                          {log.location.city}, {log.location.region}, {log.location.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.profiles ? (
                        <div>
                          <div className="text-sm dark:text-white">{log.profiles.full_name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">@{log.profiles.username}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Anonymous</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(log.device_info.device)}
                        <div className="text-sm dark:text-white">
                          <div>{log.device_info.browser}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{log.device_info.os}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm dark:text-white">{log.page_visited}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm dark:text-white">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}