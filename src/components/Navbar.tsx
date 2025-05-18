import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Car } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 flex items-center"
          >
            <Link to="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TTMS</span>
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center space-x-4">
            {location.pathname.startsWith('/admin') && (
              <NavLink to="/staff" active={false}>Switch to Staff</NavLink>
            )}
            {location.pathname.startsWith('/staff') && (
              <NavLink to="/admin" active={false}>Switch to Admin</NavLink>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0 }}
        className={`md:hidden overflow-hidden`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {location.pathname.startsWith('/admin') && (
            <MobileNavLink 
              to="/staff" 
              onClick={() => setIsOpen(false)}
              active={false}
            >
              Switch to Staff
            </MobileNavLink>
          )}
          {location.pathname.startsWith('/staff') && (
            <MobileNavLink 
              to="/admin" 
              onClick={() => setIsOpen(false)}
              active={false}
            >
              Switch to Admin
            </MobileNavLink>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

const NavLink = ({ to, children, active = false }: { to: string; children: React.ReactNode; active?: boolean }) => (
  <Link
    to={to}
    className={`${
      active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
    } px-3 py-2 rounded-md text-sm font-medium transition-colors`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ 
  to, 
  children, 
  onClick,
  active = false 
}: { 
  to: string; 
  children: React.ReactNode; 
  onClick: () => void;
  active?: boolean;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`${
      active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'
    } block px-3 py-2 rounded-md text-base font-medium transition-colors`}
  >
    {children}
  </Link>
);