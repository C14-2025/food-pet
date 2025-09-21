/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1) Mocks rápidos de libs “chatas” (sem mexer no config)
jest.mock('lucide-react', () => ({ RefreshCcw: () => null }));
jest.mock('@/components/ui/button', () => ({
  Button: (props: React.ComponentProps<'button'>) => React.createElement('button', props, props.children),
}));

jest.mock('@/components/ui/card', () => ({
  Card: (props: React.ComponentProps<'div'>) => React.createElement('div', props, props.children),
  CardHeader: (props: React.ComponentProps<'div'>) => React.createElement('div', props, props.children),
  CardTitle: (props: React.ComponentProps<'div'>) => React.createElement('div', props, props.children),
  CardContent: (props: React.ComponentProps<'div'>) => React.createElement('div', props, props.children),
}));

// 2) Mocks dos filhos — sem JSX pra não depender de mais nada
jest.mock('@/features/orders/components/CreateOrderForm', () => ({
  CreateOrderForm: ({ onCreated }: { onCreated: () => void }) =>
    React.createElement('button', { 'data-testid': 'mock-create', onClick: onCreated }, 'form'),
}));
jest.mock('@/features/orders/components/OrdersTable', () => ({
  OrdersTable: ({ orders }: { orders: unknown[] }) =>
    React.createElement('div', { 'data-testid': 'mock-table' }, `rows:${orders.length}`),
}));

// 3) Mock da API usada pelo componente
jest.mock('@/lib/api/orders', () => ({
  listOrders: jest.fn(),
  getErrorMessage: jest.fn((e: unknown) => String(e)),
}));
import { listOrders } from '@/lib/api/orders';

// 4) Importa o componente por último (após mocks)
import { OrdersPageClient } from '@/features/orders/components/OrdersPageClient';

// 5) Teste único, simples e útil
it('carrega pedidos e mostra a tabela com 2 linhas', async () => {
  (listOrders as jest.Mock).mockResolvedValue([
    { id: '1', customer: 'Ana' },
    { id: '2', customer: 'Bruno' },
  ]);

  render(React.createElement(OrdersPageClient));

  // aparece "Carregando…" no mount
  expect(screen.getByText(/Carregando…/i)).toBeInTheDocument();

  // depois do fetch mockado: some loading e mostra a tabela mock
  await waitFor(() => {
    expect(screen.queryByText(/Carregando…/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-table')).toHaveTextContent('rows:2');
  });
});
