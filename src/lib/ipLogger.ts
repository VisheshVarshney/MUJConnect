import { supabase } from './supabase';

export const logPageVisit = async (page: string) => {
  try {
    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    // Get IP information with multiple fallbacks
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
      // Try ipify first
      const ipifyResponse = await fetch('https://api.ipify.org?format=json');
      if (ipifyResponse.ok) {
        const data = await ipifyResponse.json();
        // Get location data from ipapi.co for the IP
        const locationResponse = await fetch(`https://ipapi.co/${data.ip}/json/`);
        if (locationResponse.ok) {
          const locationData = await locationResponse.json();
          ipData = {
            ip: data.ip,
            country_name: locationData.country_name,
            city: locationData.city,
            region: locationData.region
          };
        }
      }
      
      // If ipify fails or location data is missing, try ipapi.co directly
      if (ipData.country_name === 'Unknown') {
        const ipapiResponse = await fetch('https://ipapi.co/json/');
        if (ipapiResponse.ok) {
          const data = await ipapiResponse.json();
          ipData = {
            ip: data.ip,
            country_name: data.country_name,
            city: data.city,
            region: data.region
          };
        }
      }

      // If both fail, try ipinfo.io
      if (ipData.country_name === 'Unknown') {
        const ipinfoResponse = await fetch('https://ipinfo.io/json');
        if (ipinfoResponse.ok) {
          const data = await ipinfoResponse.json();
          ipData = { 
            ip: data.ip,
            country_name: data.country,
            city: data.city,
            region: data.region
          };
        }
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