/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthenticatedResource } from '@/components/AuthenticatedResource/AuthenticatedResource';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock the Header component to simplify testing
jest.mock('@/components/Header/Header', () => ({
  Header: () => <div data-testid='header'>Header</div>,
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('AuthenticatedResource to protect content if user is not logged in', () => {
  const pushMock = jest.fn();
  const backMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      back: backMock,
    });
    pushMock.mockClear();
    backMock.mockClear();
  });

  it('shows loading state while authentication is loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(
      <AuthenticatedResource>
        <div data-testid='protected'>Secret Content</div>
      </AuthenticatedResource>,
    );

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'ADMIN',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    render(
      <AuthenticatedResource>
        <div data-testid='protected'>Secret Content</div>
      </AuthenticatedResource>,
    );

    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects to /login when not authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <AuthenticatedResource>
        <div data-testid='protected'>Secret Content</div>
      </AuthenticatedResource>,
    );

    // Should not render children
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();

    // Should redirect
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('allows access when user has required role', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'admin@example.com',
          role: 'ADMIN',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    render(
      <AuthenticatedResource allowedRoles={['ADMIN']}>
        <div data-testid='protected'>Admin Content</div>
      </AuthenticatedResource>,
    );

    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(backMock).not.toHaveBeenCalled();
  });

  it('redirects back when user does not have required role', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'client@example.com',
          role: 'CLIENT',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    render(
      <AuthenticatedResource allowedRoles={['ADMIN']}>
        <div data-testid='protected'>Admin Only Content</div>
      </AuthenticatedResource>,
    );

    // Should not render children
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();

    // Should redirect back
    await waitFor(() => {
      expect(backMock).toHaveBeenCalled();
    });
  });

  it('allows access when user has one of multiple allowed roles', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'client@example.com',
          role: 'CLIENT',
        },
        expires: '2024-12-31',
      },
      status: 'authenticated',
    });

    render(
      <AuthenticatedResource allowedRoles={['ADMIN', 'CLIENT']}>
        <div data-testid='protected'>Shared Content</div>
      </AuthenticatedResource>,
    );

    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(backMock).not.toHaveBeenCalled();
  });
});
