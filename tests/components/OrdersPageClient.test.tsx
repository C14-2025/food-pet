/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simplified UI mocks
jest.mock('@/components/ui/alert', () => ({
  Alert: (props: React.ComponentProps<'div'>) => <div {...props} />,
  AlertTitle: (props: React.ComponentProps<'div'>) => <div {...props} />,
  AlertDescription: (props: React.ComponentProps<'div'>) => <div {...props} />,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// 1) Mocks rápidos de libs “chatas” (sem mexer no config)
jest.mock('lucide-react', () => ({ RefreshCcw: () => null }));
jest.mock('@/components/ui/button', () => ({
  Button: (props: React.ComponentProps<'button'>) => React.createElement('button', props, props.children),
}));

// Mock the form to expose onCreated
jest.mock('@/features/orders/components/CreateOrderForm', () => ({
  CreateOrderForm: ({ onCreated }: { onCreated: () => void }) => (
    <button data-testid='mock-create' onClick={onCreated}>
      criar
    </button>
  ),
}));

import { OrdersPageClient } from '@/features/orders/components/OrdersPageClient';

describe('OrdersPageClient', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('mostra alerta de sucesso ao criar pedido e some depois do timeout', () => {
    render(<OrdersPageClient />);

    // alerta não deve aparecer inicialmente
    expect(screen.queryByText(/Compra concluida/i)).not.toBeInTheDocument();

    // dispara onCreated do formulário
    fireEvent.click(screen.getByTestId('mock-create'));

    expect(screen.getByText(/Compra concluida/i)).toBeInTheDocument();

    // avança o timer de 5s para esconder alerta
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText(/Compra concluida/i)).not.toBeInTheDocument();
  });
});
