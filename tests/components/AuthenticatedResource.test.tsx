/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { AuthenticatedResource } from '@/components/AuthenticatedResource/AuthenticatedResource';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useLocalStorage
jest.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: jest.fn(),
}));

describe('AuthenticatedResource to protect content if user is not logged in', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    pushMock.mockClear();
  });

  it('renders children when logged in', () => {
    const { useLocalStorage } = jest.requireMock('@/hooks/useLocalStorage');
    useLocalStorage.mockReturnValue([true, jest.fn()]);

    render(
      <AuthenticatedResource>
        <div data-testid='protected'>Secret Content</div>
      </AuthenticatedResource>,
    );

    expect(screen.getByTestId('protected')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects to /login when not logged in', () => {
    const { useLocalStorage } = jest.requireMock('@/hooks/useLocalStorage');
    useLocalStorage.mockReturnValue([false, jest.fn()]);

    render(
      <AuthenticatedResource>
        <div data-testid='protected'>Secret Content</div>
      </AuthenticatedResource>,
    );

    // Should not render children
    expect(screen.queryByTestId('protected')).toBeNull();
    // Should redirect
    expect(pushMock).toHaveBeenCalledWith('/login');
  });
});
