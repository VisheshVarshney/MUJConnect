import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import {
  Server,
  Cpu,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface SystemMetric {
  id: string;
  metric_type: string;
  value: number;
  timestamp: string;
}

interface ErrorLog {
  id: string;
  created_at: string;
  user_email: string | null;
  error_type: string;
  error_message: string;
  page_url: string;
  ip_address: string | null;
  stack_trace: string | null;
}

const METRIC_TYPES = {
  CPU_USAGE: 'cpu_usage',
  MEMORY_USAGE: 'memory_usage',
  DISK_USAGE: 'disk_usage',
  API_RESPONSE_TIME: 'api_response_time',
  DATABASE_CONNECTIONS: 'database_connections',
  ERROR_RATE: 'error_rate'
};

const METRIC_THRESHOLDS = {
  [METRIC_TYPES.CPU_USAGE]: { warning: 70, critical: 90 },
  [METRIC_TYPES.MEMORY_USAGE]: { warning: 75, critical: 90 },
  [METRIC_TYPES.DISK_USAGE]: { warning: 80, critical: 95 },
  [METRIC_TYPES.API_RESPONSE_TIME]: { warning: 500, critical: 1000 },
  [METRIC_TYPES.DATABASE_CONNECTIONS]: { warning: 80, critical: 90 },
  [METRIC_TYPES.ERROR_RATE]: { warning: 5, critical: 10 }
};

export default function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    fetchSystemHealth();
    let interval: NodeJS.Timeout;

    if (autoRefresh) {
      interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchSystemHealth = async () => {
    try {
      const { data: metricsData, error: metricsError } = await supabase
        .from('system_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      const { data: errorData, error: errorError } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (metricsError) throw metricsError;
      if (errorError) throw errorError;

      setMetrics(metricsData || []);
      setErrorLogs(errorData || []);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to load system health data');
    } finally {
      setLoading(false);
    }
  };

  const getMetricStatus = (type: string, value: number) => {
    const thresholds = METRIC_THRESHOLDS[type as keyof typeof METRIC_THRESHOLDS];
    if (!thresholds) return 'normal';

    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'normal';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case METRIC_TYPES.CPU_USAGE:
        return <Cpu className="w-5 h-5" />;
      case METRIC_TYPES.MEMORY_USAGE:
        return <Server className="w-5 h-5" />;
      case METRIC_TYPES.DISK_USAGE:
        return <Database className="w-5 h-5" />;
      case METRIC_TYPES.API_RESPONSE_TIME:
        return <Activity className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const latestMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric_type]) {
      acc[metric.metric_type] = metric;
    }
    return acc;
  }, {} as Record<string, SystemMetric>);

  const fetchErrorLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setErrorLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast.error('Error fetching error logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchErrorLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Auto-refresh Toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            autoRefresh
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Auto-refresh {autoRefresh ? 'On' : 'Off'}
        </button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(latestMetrics).map(([type, metric]) => {
          const status = getMetricStatus(type, metric.value);
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getMetricIcon(type)}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                    <p className="text-2xl font-semibold dark:text-white">
                      {type.includes('USAGE') || type.includes('RATE')
                        ? `${metric.value}%`
                        : type.includes('TIME')
                        ? `${metric.value}ms`
                        : metric.value}
                    </p>
                  </div>
                </div>
                {getStatusIcon(status)}
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'critical'
                        ? 'bg-red-500'
                        : status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Server className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">API Status</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Operational</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Server className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Database Status</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Operational</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <Server className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Status</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error Logs</h2>
          <button
            onClick={fetchErrorLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        {isLoadingLogs ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Error Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Page</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {errorLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.user_email || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.error_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs truncate" title={log.error_message}>
                        {log.error_message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs truncate" title={log.page_url}>
                        {log.page_url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {log.ip_address || 'N/A'}
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