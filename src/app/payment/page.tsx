import { AuthenticatedResource } from '@/components/AuthenticatedResource/AuthenticatedResource';
import { PaymentPageClient } from '@/features/payment/components/PaymentPageClient';

export default function Page() {
  return (
    <AuthenticatedResource>
      <PaymentPageClient />
    </AuthenticatedResource>
  );
}
