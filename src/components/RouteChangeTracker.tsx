import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logPageVisit } from '../lib/ipLogger';

export default function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    // Log the page visit whenever the route changes
    logPageVisit(location.pathname);
  }, [location]);

  return null; // This component doesn't render anything
} 