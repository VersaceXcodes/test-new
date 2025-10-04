import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/login`,
          { email, password },
          { headers: { 'Content-Type': 'application/json' } }
        );

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
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';

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
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/register`,
          { email, password, name },
          { headers: { 'Content-Type': 'application/json' } }
        );

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
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Registration failed';

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
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/verify`,
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
      } catch {
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
