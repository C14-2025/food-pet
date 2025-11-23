'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import { OrdersTable } from './OrdersTable';
import type { Order } from '@/features/orders/types';
import { CreateOrderForm } from './CreateOrderForm';
import { listOrders, getErrorMessage } from '@/lib/api/orders';

export function OrdersPageClient() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 5000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  return (
    <div className='mx-auto max-w-6xl space-y-6 p-6'>
      <h1 className='text-2xl font-bold' id='orders-title'>
        Pedidos
      </h1>

      <CreateOrderForm
        onCreated={async () => {
          setShowSuccess(true);
          await refresh();
          router.push('/payment');
        }}
      />

      {showSuccess && (
        <Alert className='bg-emerald-50 text-emerald-900'>
          <AlertTitle>Compra concluida</AlertTitle>
          <AlertDescription>Seu pedido foi registrado com sucesso.</AlertDescription>
        </Alert>
      )}

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
