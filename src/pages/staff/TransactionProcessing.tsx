import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Receipt, AlertCircle, Calendar } from 'lucide-react';
import { getTransactions } from '../../lib/api';

export function TransactionProcessing() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vehicleNumber: '',
    categoryId: ''
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  async function loadTransactions() {
    try {
      setLoading(true);
      const data = await getTransactions(filters);
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h1>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vehicle Number
              </label>
              <div className="mt-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={filters.vehicleNumber}
                  onChange={(e) => setFilters(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Search by vehicle number..."
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.receipt_number}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {transaction.toll_passes?.vehicle_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.toll_passes?.vehicle_categories?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {new Date(transaction.processed_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {!loading && transactions.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No transactions found
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}