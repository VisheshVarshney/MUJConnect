import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, TrendingUp, Users, Download } from 'lucide-react';
import { getAnalytics } from '../../lib/api';
import Chart from 'chart.js/auto';
import { Bar, Pie } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function Analytics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const data = await getAnalytics(dateRange.startDate, dateRange.endDate);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    const element = document.getElementById('analytics-content');
    if (!element) return;

    const canvas = await html2canvas(element);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`analytics-report-${dateRange.startDate}-to-${dateRange.endDate}.pdf`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categoryData = {
    labels: Object.keys(analytics?.categoryStats || {}),
    datasets: [
      {
        label: 'Revenue by Category',
        data: Object.values(analytics?.categoryStats || {}).map((stat: any) => stat.revenue),
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
      },
    ],
  };

  const staffData = {
    labels: Object.values(analytics?.staffStats || {}).map((staff: any) => staff.name),
    datasets: [
      {
        label: 'Transactions Processed',
        data: Object.values(analytics?.staffStats || {}).map((staff: any) => staff.transactions),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-4">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={generateReport}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      <div id="analytics-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">
                +{((analytics?.totalRevenue || 0) / 1000).toFixed(1)}k
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              ${analytics?.totalRevenue?.toFixed(2)}
            </p>
            <p className="text-gray-600">Total Revenue</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {Object.keys(analytics?.categoryStats || {}).length} Categories
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              {Object.values(analytics?.categoryStats || {}).reduce((acc: number, cat: any) => acc + cat.count, 0)}
            </p>
            <p className="text-gray-600">Total Transactions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-sm font-medium text-purple-600">
                {Object.keys(analytics?.staffStats || {}).length} Active
              </span>
            </div>
            <p className="mt-4 text-2xl font-semibold text-gray-900">
              {analytics?.activePasses || 0}
            </p>
            <p className="text-gray-600">Active Passes</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">Revenue by Category</h2>
            <div className="h-64">
              <Pie data={categoryData} options={{ maintainAspectRatio: false }} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-lg shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-4">Staff Performance</h2>
            <div className="h-64">
              <Bar data={staffData} options={{ maintainAspectRatio: false }} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}