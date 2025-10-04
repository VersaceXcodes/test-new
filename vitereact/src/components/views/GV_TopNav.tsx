import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios from 'axios';

const GV_TopNav: React.FC = () => {
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const logoutUser = useAppStore(state => state.logout_user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const authToken = useAppStore(state => state.authentication_state.auth_token);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      logoutUser();
      navigate('/');
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600">TodoGenie</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {!isAuthenticated ? (
                <Link
                  to="/auth"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login / Sign Up
                </Link>
              ) : (
                <div className="relative">
                  <button className="text-sm font-medium text-gray-700 focus:outline-none">
                    {currentUser?.name}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default GV_TopNav;