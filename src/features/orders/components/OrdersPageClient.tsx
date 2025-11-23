'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { CreateOrderForm } from './CreateOrderForm';

export function OrdersPageClient() {
  const [showSuccess, setShowSuccess] = useState(false);

  const router = useRouter();

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
          router.push('/payment');
        }}
      />

      {showSuccess && (
        <Alert className='bg-emerald-50 text-emerald-900'>
          <AlertTitle>Compra concluida</AlertTitle>
          <AlertDescription>Seu pedido foi registrado com sucesso.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
