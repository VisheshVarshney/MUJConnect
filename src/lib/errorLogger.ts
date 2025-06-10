import { supabase } from './supabase';

interface ErrorLog {
  error_message: string;
  error_stack?: string;
  user_id?: string;
  user_email?: string;
  page_url: string;
  browser_info: string;
  created_at: string;
  error_type: string;
  additional_info?: any;
  ip_address?: string;
}

export const logError = async (error: Error | string, additionalInfo?: any) => {
  try {
    // Get current user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get browser and system info
    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    // Get IP address with multiple fallbacks
    let ipAddress = '';
    try {
      // Try ipify first
      const ipifyResponse = await fetch('https://api.ipify.org?format=json');
      if (ipifyResponse.ok) {
        const data = await ipifyResponse.json();
        ipAddress = data.ip;
      } else {
        // Fallback to ipapi.co
        const ipapiResponse = await fetch('https://ipapi.co/json/');
        if (ipapiResponse.ok) {
          const data = await ipapiResponse.json();
          ipAddress = data.ip;
        } else {
          // Final fallback to ipinfo.io
          const ipinfoResponse = await fetch('https://ipinfo.io/json');
          if (ipinfoResponse.ok) {
            const data = await ipinfoResponse.json();
            ipAddress = data.ip;
          }
        }
      }
    } catch (ipError) {
      console.error('Error fetching IP:', ipError);
    }

    const errorLog: ErrorLog = {
      error_message: typeof error === 'string' ? error : error.message,
      error_stack: error instanceof Error ? error.stack : undefined,
      user_id: user?.id,
      user_email: user?.email,
      page_url: window.location.href,
      browser_info: JSON.stringify(browserInfo),
      created_at: new Date().toISOString(),
      error_type: error instanceof Error ? error.name : 'Unknown',
      additional_info: additionalInfo ? JSON.stringify(additionalInfo) : undefined,
      ip_address: ipAddress
    };

    // Log to Supabase
    const { error: dbError } = await supabase
      .from('error_logs')
      .insert([errorLog]);

    if (dbError) {
      console.error('Error saving to error_logs:', dbError);
    }

    // Also log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }
  } catch (loggingError) {
    console.error('Error in error logger:', loggingError);
  }
};

// Global error handler
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, { type: 'unhandledrejection' });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logError(event.error || event.message, { type: 'uncaught' });
  });
}; 