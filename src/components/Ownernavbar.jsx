import React from 'react';
import { Home, PlusSquare, Calendar, UserCircle, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const OwnerNavbar = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/owner/dashboard' },
    { icon: PlusSquare, label: 'Add Station', path: '/owner/add-station' },
    { icon: Calendar, label: 'Bookings', path: '/owner/bookings' },
    { icon: UserCircle, label: 'Profile', path: '/owner/profile' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/owner/dashboard" 
              className="flex items-center space-x-2 group"
            >
              <Zap 
                size={24} 
                className="text-blue-600 transform group-hover:scale-110 transition-transform duration-200" 
              />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                ChargingStation
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                    ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 shadow-sm transform scale-105'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                    }
                  `}
                >
                  <Icon 
                    size={18} 
                    className={`transform transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
            <div className="flex justify-around items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200
                      ${
                        isActive
                          ? 'text-blue-600 bg-blue-50 transform scale-110'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                      }
                    `}
                  >
                    <Icon 
                      size={24} 
                      className={`mb-1 transition-transform duration-200 ${
                        isActive ? 'transform scale-110' : ''
                      }`}
                    />
                    <span className="text-xs font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OwnerNavbar;