import { supabase } from './supabase';

const IPDATA_API_KEY = import.meta.env.VITE_IPDATA_API_KEY;

export const logPageVisit = async (page: string) => {
  try {
    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Get IP information
    let ipData: {
      ip: string;
      country_name: string;
      city: string;
      region: string;
    } = {
      ip: '127.0.0.1',
      country_name: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };

    try {
      const response = await fetch(`https://api.ipdata.co/api/v1?api-key=${IPDATA_API_KEY}`);
      if (response.ok) {
        const data = await response.json();
        ipData = {
          ip: data.ip,
          country_name: data.country_name,
          city: data.city,
          region: data.region
        };
      }
    } catch (ipError) {
      console.error('Error fetching IP:', ipError);
    }

    // Get device information
    const userAgent = window.navigator.userAgent;
    const deviceInfo = {
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      device: getDevice(userAgent)
    };

    // Log the visit
    const { error: logError } = await supabase.rpc('log_ip_visit', {
      p_ip_address: ipData.ip,
      p_user_id: user?.id || null,
      p_location: {
        country: ipData.country_name,
        city: ipData.city,
        region: ipData.region
      },
      p_device_info: deviceInfo,
      p_page_visited: page
    });

    if (logError) {
      console.error('Error logging visit:', logError);
    }
  } catch (error) {
    console.error('Error in logPageVisit:', error);
  }
};

function getBrowser(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
}

function getOS(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'MacOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
}

function getDevice(userAgent: string): string {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}