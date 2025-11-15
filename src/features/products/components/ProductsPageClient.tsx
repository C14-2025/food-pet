'use client';

import { useState } from 'react';
import { ProductsUploadForm } from './ProductsUploadForm';
import { ProductsTable } from './ProductsTable';
import { AuthenticatedResource } from '@/components/AuthenticatedResource/AuthenticatedResource';

export function ProductsPageClient() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <AuthenticatedResource allowedRoles={["CLIENT"]}>
      <div className='container mx-auto py-8 space-y-8 px-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Produtos</h1>
          <p className='text-muted-foreground'>Gerencie os produtos do seu estabelecimento</p>
        </div>

        <div className='grid gap-8 lg:grid-cols-2'>
          <div>
            <ProductsUploadForm onSuccess={handleUploadSuccess} />
          </div>
          <div className='lg:col-span-2'>
            <ProductsTable refreshTrigger={refreshTrigger} />
          </div>
        </div>
      </div>
    </AuthenticatedResource>
  );
}
