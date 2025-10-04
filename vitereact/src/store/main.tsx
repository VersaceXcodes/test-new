import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API_TIMEOUT = 30000;

const axiosInstance = axios.create({
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface AuthenticationStatus {
  is_authenticated: boolean;
  is_loading: boolean;
}

interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: AuthenticationStatus;
  error_message: string | null;
}

interface AppState {
  authentication_state: AuthenticationState;
  login_user: (email: string, password: string) => Promise<void>;
  logout_user: () => void;
  register_user: (email: string, password: string, name: string) => Promise<void>;
  initialize_auth: () => Promise<void>;
  clear_auth_error: () => void;
}

export const useAppStore = create<AppState>()(
  persist((set, get) => ({
    authentication_state: {
      current_user: null,
      auth_token: null,
      authentication_status: {
        is_authenticated: false,
        is_loading: true,
      },
      error_message: null,
    },
    
    login_user: async (email: string, password: string) => {
      set((state) => ({
        authentication_state: {
          ...state.authentication_state,
          authentication_status: {
            ...state.authentication_state.authentication_status,
            is_loading: true,
          },
          error_message: null,
        },
      }));

      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        console.log('=== LOGIN REQUEST START ===');
        console.log('API URL:', apiUrl);
        console.log('Login endpoint:', `${apiUrl}/api/auth/login`);
        console.log('Request data:', { email, hasPassword: !!password });
        
        const response = await axiosInstance.post(
          `${apiUrl}/api/auth/login`,
          { email, password }
        );
        
        console.log('Login response status:', response.status);
        console.log('Login response data:', response.data);

        const { user, token } = response.data;

        set(() => ({
          authentication_state: {
            current_user: user,
            auth_token: token,
            authentication_status: {
              is_authenticated: true,
              is_loading: false,
            },
            error_message: null,
          },
        }));
        console.log('=== LOGIN REQUEST SUCCESS ===');
      } catch (error: any) {
        console.error('=== LOGIN REQUEST ERROR ===');
        console.error('Error object:', error);
        console.error('Error response:', error.response);
        console.error('Error request:', error.request);
        
        let errorMessage = 'Login failed';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your connection and try again.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.response) {
          const responseData = error.response.data;
          if (responseData?.message) {
            errorMessage = responseData.message;
          } else if (responseData?.field_errors?.length > 0) {
            errorMessage = responseData.field_errors[0].message;
          } else {
            errorMessage = `Server error: ${error.response.status}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        set(() => ({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: {
              is_authenticated: false,
              is_loading: false,
            },
            error_message: errorMessage,
          },
        }));
        throw new Error(errorMessage);
      }
    },

    register_user: async (email: string, password: string, name: string) => {
      set((state) => ({
        authentication_state: {
          ...state.authentication_state,
          authentication_status: {
            ...state.authentication_state.authentication_status,
            is_loading: true,
          },
          error_message: null,
        },
      }));

      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        console.log('=== REGISTER REQUEST START ===');
        console.log('API URL:', apiUrl);
        console.log('Register endpoint:', `${apiUrl}/api/auth/register`);
        console.log('Request data:', { email, name, hasPassword: !!password });
        
        const response = await axiosInstance.post(
          `${apiUrl}/api/auth/register`,
          { email, password, name }
        );
        
        console.log('Register response status:', response.status);
        console.log('Register response data:', response.data);

        const { user, token } = response.data;

        set(() => ({
          authentication_state: {
            current_user: user,
            auth_token: token,
            authentication_status: {
              is_authenticated: true,
              is_loading: false,
            },
            error_message: null,
          },
        }));
        console.log('=== REGISTER REQUEST SUCCESS ===');
      } catch (error: any) {
        console.error('=== REGISTER REQUEST ERROR ===');
        console.error('Error object:', error);
        console.error('Error response:', error.response);
        console.error('Error request:', error.request);
        
        let errorMessage = 'Registration failed';
        
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please check your connection and try again.';
        } else if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.response) {
          const responseData = error.response.data;
          if (responseData?.message) {
            errorMessage = responseData.message;
          } else if (responseData?.field_errors?.length > 0) {
            errorMessage = responseData.field_errors[0].message;
          } else {
            errorMessage = `Server error: ${error.response.status}`;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        set(() => ({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: {
              is_authenticated: false,
              is_loading: false,
            },
            error_message: errorMessage,
          },
        }));
        throw new Error(errorMessage);
      }
    },

    initialize_auth: async () => {
      const { authentication_state } = get();
      const token = authentication_state.auth_token;

      if (!token) {
        set((state) => ({
          authentication_state: {
            ...state.authentication_state,
            authentication_status: {
              ...state.authentication_state.authentication_status,
              is_loading: false,
            },
          },
        }));
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        
        const response = await axiosInstance.get(
          `${apiUrl}/api/auth/verify`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { user } = response.data;

        set(() => ({
          authentication_state: {
            current_user: user,
            auth_token: token,
            authentication_status: {
              is_authenticated: true,
              is_loading: false,
            },
            error_message: null,
          },
        }));
      } catch (error) {
        console.error('Auth verification failed:', error);
        set(() => ({
          authentication_state: {
            current_user: null,
            auth_token: null,
            authentication_status: {
              is_authenticated: false,
              is_loading: false,
            },
            error_message: null,
          },
        }));
      }
    },

    logout_user: () => {
      set(() => ({
        authentication_state: {
          current_user: null,
          auth_token: null,
          authentication_status: {
            is_authenticated: false,
            is_loading: false,
          },
          error_message: null,
        },
      }));
    },

    clear_auth_error: () => {
      set((state) => ({
        authentication_state: {
          ...state.authentication_state,
          error_message: null,
        },
      }));
    },
  }), {
    name: 'app-auth-storage',
    partialize: (state) => ({
      authentication_state: {
        current_user: state.authentication_state.current_user,
        auth_token: state.authentication_state.auth_token,
        authentication_status: {
          is_authenticated: state.authentication_state.authentication_status.is_authenticated,
          is_loading: false,
        },
        error_message: null,
      },
    }),
  })
);
