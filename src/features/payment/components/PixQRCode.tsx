'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function PixQRCode() {
  const [isPaid, setIsPaid] = useState(false);
  const router = useRouter();

  const handleConfirmPayment = () => {
    setIsPaid(true);
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <Card className='min-w-80 max-w-sm w-full mx-auto shadow-md border border-border'>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-lg'>Pagamento via Pix</CardTitle>
        <CardDescription>Escaneie o QR Code abaixo com o app do seu banco para concluir o pagamento.</CardDescription>
      </CardHeader>
      <CardContent className='w-full flex flex-col items-center gap-4'>
        <div className='relative flex items-center justify-center rounded-lg p-4'>
          <Image
            src='/features/payment/pix-qr.png'
            alt='QR Code Pix'
            width={260}
            height={260}
            className='rounded-md shadow-md'
          />
        </div>
        {isPaid && (
          <div className='w-full rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800 text-center'>
            Pagamento completo! Redirecionando…
          </div>
        )}
      </CardContent>
      <CardFooter className='flex justify-center'>
        <Button className='bg-primary text-primary-foreground px-6' disabled={isPaid} onClick={handleConfirmPayment}>
          {isPaid ? 'Pagamento confirmado' : 'Já paguei, confirmar'}
        </Button>
      </CardFooter>
    </Card>
  );
}
