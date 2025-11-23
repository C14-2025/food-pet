'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import type { Order } from '@/features/orders/types';
import { getErrorMessage, listOrders } from '@/lib/api/orders';
import { OrdersTable } from './OrdersTable';

export function OrdersListPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
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
    <Card>
      <CardHeader className='flex flex-row items-center justify-between'>
        <CardTitle className='text-xl'>Lista de pedidos</CardTitle>
        <Button variant='outline' size='sm' onClick={() => refresh()} disabled={loading}>
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
          <p className='text-sm text-muted-foreground'>Carregando...</p>
        ) : orders.length === 0 ? (
          <p className='text-sm text-muted-foreground'>Nenhum pedido encontrado.</p>
        ) : (
          <OrdersTable orders={orders} onDeleted={refresh} />
        )}
      </CardContent>
    </Card>
  );
}
