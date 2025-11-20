import { PixQRCode } from './PixQRCode';

export function PaymentPageClient() {
  return (
    <div className='flex items-center justify-center h-screen w-full'>
      <PixQRCode />
    </div>
  );
}
