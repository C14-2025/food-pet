'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { OrdersTable } from './OrdersTable';
import { CreateOrderForm } from './CreateOrderForm';
import type { Order } from '@/features/orders/types';
import { listOrders, getErrorMessage } from '@/lib/api/orders';
import { AuthenticatedResource } from '@/components/AuthenticatedResource/AuthenticatedResource';

export function OrdersPageClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await listOrders();
      setOrders(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-6'>
      <h1 className='text-2xl font-bold' id='orders-title'>
        Pedidos
      </h1>

      <CreateOrderForm onCreated={() => refresh()} />

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-xl'>Lista de pedidos</CardTitle>
          <Button variant='outline' size='sm' onClick={() => refresh()}>
            <RefreshCcw className='mr-2 h-4 w-4' /> Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className='mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
              {error}
            </div>
          )}

          {loading ? (
            <p className='text-sm text-muted-foreground'>Carregando…</p>
          ) : orders.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Nenhum pedido encontrado.</p>
          ) : (
            <OrdersTable orders={orders} onDeleted={refresh} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
