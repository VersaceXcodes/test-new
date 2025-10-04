import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

const GV_Footer: React.FC = () => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const currentUserName = useAppStore(state => state.authentication_state.current_user?.name);

  return (
    <>
      <footer className="bg-white shadow-md border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
                onClick={() => {
                  // Placeholder for any actions on click, if required
                }}
              >
                About Us
              </Link>
              <Link 
                to="/support" 
                className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
                onClick={() => {
                  // Placeholder for any actions on click, if required
                }}
              >
                Contact Support
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors"
                onClick={() => {
                  // Placeholder for any actions on click, if required
                }}
              >
                Terms and Conditions
              </Link>
            </div>
            {isAuthenticated ? (
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-semibold">{currentUserName}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <Link 
                  to="/auth" 
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  Login/Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;