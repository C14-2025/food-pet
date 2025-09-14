'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Eye, Trash2 } from 'lucide-react';
import type { Order } from '@/features/orders/types';
import { currency, deleteOrder, getErrorMessage, getOrderById } from '@/lib/api/orders';

export function OrdersTable({ orders, onDeleted }: { orders: Order[]; onDeleted: () => void }) {
  const [detail, setDetail] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const openDetails = async (id: number) => {
    try {
      setErr(null);
      setDetailLoading(true);
      setDetail(await getOrderById(id));
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Deseja apagar o pedido #${id}?`)) return;
    try {
      await deleteOrder(id);
      onDeleted();
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    }
  };

  return (
    <div className='overflow-hidden rounded-xl border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Método</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className='w-[180px]'>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell>#{o.id}</TableCell>
              <TableCell>{o.consumptionMethod === 'DINE_IN' ? 'Salão' : 'Para viagem'}</TableCell>
              <TableCell>{o.products?.length ?? 0}</TableCell>
              <TableCell className='font-medium'>{currency(o.total)}</TableCell>
              <TableCell>
                <div className='flex gap-2'>
                  <Button variant='outline' size='sm' onClick={() => void openDetails(o.id)}>
                    <Eye className='mr-2 h-4 w-4' /> Ver
                  </Button>
                  <Button variant='destructive' size='sm' onClick={() => void handleDelete(o.id)}>
                    <Trash2 className='mr-2 h-4 w-4' /> Apagar
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className='w-full max-w-xl overflow-y-auto'>
          <SheetHeader>
            <SheetTitle>{detail ? `Pedido #${detail.id}` : ''}</SheetTitle>
            <SheetDescription>
              {detail && (detail.consumptionMethod === 'DINE_IN' ? 'Consumo no salão' : 'Para viagem')}
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <p className='mt-4 text-sm text-muted-foreground'>Carregando…</p>
          ) : err ? (
            <p className='mt-4 text-sm text-destructive'>{err}</p>
          ) : detail ? (
            <div className='mt-4 space-y-4'>
              <div className='text-sm'>
                <span className='font-medium'>Total:</span> {currency(detail.total)}
              </div>
              <div className='overflow-hidden rounded-xl border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Qtd</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.products?.map((p) => (
                      <TableRow key={`${p.productId}-${p.id ?? Math.random()}`}>
                        <TableCell>{p.product?.name ?? `#${p.productId}`}</TableCell>
                        <TableCell>{currency(p.price ?? 0)}</TableCell>
                        <TableCell>{p.quantity}</TableCell>
                        <TableCell className='font-medium'>{currency(p.subtotal ?? 0)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className='flex justify-end'>
                <SheetClose asChild>
                  <Button variant='outline'>Fechar</Button>
                </SheetClose>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
