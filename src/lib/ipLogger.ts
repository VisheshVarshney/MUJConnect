import { supabase } from './supabase';

export const logPageVisit = async (page: string) => {
  try {
    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Get IP information
    const response = await fetch('https://ipapi.co/json/');
    const ipData = await response.json();

    // Get device information
    const userAgent = window.navigator.userAgent;
    const deviceInfo = {
      browser: getBrowser(userAgent),
      os: getOS(userAgent),
      device: getDevice(userAgent)
    };

    // Log the visit
    await supabase.rpc('log_ip_visit', {
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
  } catch (error) {
    console.error('Error logging visit:', error);
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