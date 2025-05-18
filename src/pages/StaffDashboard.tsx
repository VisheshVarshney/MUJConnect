import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Receipt, Search, ArrowUpRight,
  TrendingUp, Timer, CheckCircle
} from 'lucide-react';
import { ReceiptGeneration } from './staff/ReceiptGeneration';
import { TransactionProcessing } from './staff/TransactionProcessing';
import { supabase } from '../lib/supabase';

const stats = [
  { 
    title: 'Today\'s Transactions', 
    value: '142', 
    change: '+8.1%',
    icon: TrendingUp 
  },
  { 
    title: 'Average Processing Time', 
    value: '45s', 
    change: '-12.3%',
    icon: Timer 
  },
  { 
    title: 'Success Rate', 
    value: '99.8%', 
    change: '+0.2%',
    icon: CheckCircle 
  }
];

const features = [
  { 
    name: 'Generate Receipt', 
    icon: Receipt, 
    path: '/staff/receipts/new',
    description: 'Create new transaction receipts'
  },
  { 
    name: 'Search Receipts', 
    icon: Search, 
    path: '/staff/receipts/search',
    description: 'Find and view past transactions'
  }
];

const StaffDashboardHome = () => {
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    loadRecentTransactions();
  }, []);

  async function loadRecentTransactions() {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          toll_passes (
            vehicle_number,
            vehicle_categories (name)
          )
        `)
        .order('processed_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (err) {
      console.error('Error loading recent transactions:', err);
    }
  }

  function formatTimeAgo(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage toll transactions and receipts</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center justify-between">
                <stat.icon className="h-8 w-8 text-blue-600" />
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-gray-600">{stat.title}</p>
            </div>
          ))}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <Receipt className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Receipt #{transaction.receipt_number}</p>
                  <p className="text-sm text-gray-600">
                    Vehicle: {transaction.toll_passes?.vehicle_number} ({transaction.toll_passes?.vehicle_categories?.name})
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${transaction.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{formatTimeAgo(transaction.processed_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.name}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm p-6 cursor-pointer group"
              onClick={() => navigate(feature.path)}
            >
              <div className="flex items-center justify-between">
                <feature.icon className="h-8 w-8 text-blue-600" />
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{feature.name}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export function StaffDashboard() {
  return (
    <Routes>
      <Route path="/" element={<StaffDashboardHome />} />
      <Route path="/receipts/new" element={<ReceiptGeneration />} />
      <Route path="/receipts/search" element={<TransactionProcessing />} />
    </Routes>
  );
}