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
  XCircle
} from 'lucide-react';

interface SystemMetric {
  id: string;
  metric_type: string;
  value: number;
  timestamp: string;
}

interface ErrorLog {
  id: string;
  error_type: string;
  message: string;
  stack_trace: string;
  created_at: string;
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

  return (
    <div className="space-y-6">
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

      {/* Error Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
      >
        <h3 className="text-lg font-medium dark:text-white mb-4">Recent Error Logs</h3>
        <div className="space-y-4">
          {errorLogs.map((error) => (
            <div
              key={error.id}
              className="border-l-4 border-red-500 pl-4 py-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium dark:text-white">{error.error_type}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{error.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(error.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => toast.error(error.stack_trace)}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  View Stack Trace
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
} 