import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import UV_Authentication from '@/components/views/UV_Authentication';
import { useAppStore } from '@/store/main';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Auth E2E (Vitest, real API)', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState((state) => ({
      authentication_state: {
        ...state.authentication_state,
        current_user: null,
        auth_token: null,
        authentication_status: {
          is_authenticated: false,
          is_loading: false,
        },
        error_message: null,
      },
    }));
  });

  it('completes full auth flow: register -> logout -> sign in', async () => {
    const user = userEvent.setup();
    const uniqueEmail = `user${Date.now()}@example.com`;
    const password = 'testpassword123';
    const name = 'Test User';

    const { unmount } = render(<UV_Authentication />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    });

    const toggleButton = screen.getByRole('button', { name: /don't have an account\? sign up/i });
    await user.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/full name/i);
    const emailInput = screen.getByPlaceholderText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const registerButton = screen.getByRole('button', { name: /create account/i });

    await user.type(nameInput, name);
    await user.type(emailInput, uniqueEmail);
    await user.type(passwordInput, password);

    await waitFor(() => expect(registerButton).not.toBeDisabled());
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
        expect(state.authentication_state.current_user?.name).toBe(name);
      },
      { timeout: 20000 }
    );

    const logoutUser = useAppStore.getState().logout_user;
    logoutUser();

    await waitFor(() => {
      const state = useAppStore.getState();
      expect(state.authentication_state.authentication_status.is_authenticated).toBe(false);
      expect(state.authentication_state.auth_token).toBeNull();
      expect(state.authentication_state.current_user).toBeNull();
    });

    unmount();
    cleanup();

    await new Promise(resolve => setTimeout(resolve, 1500));

    render(<UV_Authentication />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
    });

    const loginEmailInput = screen.getByPlaceholderText(/email address/i);
    const loginPasswordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /^sign in$/i });

    await user.type(loginEmailInput, uniqueEmail);
    await user.type(loginPasswordInput, password);

    await waitFor(() => expect(loginButton).not.toBeDisabled());
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        const state = useAppStore.getState();
        expect(state.authentication_state.authentication_status.is_authenticated).toBe(true);
        expect(state.authentication_state.auth_token).toBeTruthy();
        expect(state.authentication_state.current_user?.email).toBe(uniqueEmail);
      },
      { timeout: 20000 }
    );
  }, 60000);
});
