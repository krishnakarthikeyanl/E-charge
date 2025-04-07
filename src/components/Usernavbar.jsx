import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Zap, History, User } from 'lucide-react';

const Usernavbar = () => {
    const location = useLocation();
  
    const navItems = [
      { path: '/user/home', name: 'Home', icon: Home },
      { path: '/user/station-details', name: 'Station details', icon: Zap },
      { path: '/user/booking-history', name: 'bookings', icon: History },
      { path: '/user/profile', name: 'Profile', icon: User },
    ];
  
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold text-gray-800">EV Charge Hub</span>
            </div>
            <div className="flex space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
  
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Usernavbar;