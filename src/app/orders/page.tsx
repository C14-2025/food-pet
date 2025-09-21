// server component (sem "use client")
import { AuthenticatedResource } from '@/components/AuthenticatedResource/AuthenticatedResource';
import { OrdersPageClient } from '@/features/orders/components/OrdersPageClient';

export default function Page() {
  return (
    <AuthenticatedResource>
      <OrdersPageClient />
    </AuthenticatedResource>
  );
}
