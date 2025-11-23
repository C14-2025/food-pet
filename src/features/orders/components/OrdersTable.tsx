'use client';

import { Fragment, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Trash2 } from 'lucide-react';
import type { Order } from '@/features/orders/types';
import { currency, deleteOrder, getErrorMessage, getOrderById } from '@/lib/api/orders';

type DetailCache = Record<number, Order>;

export function OrdersTable({ orders, onDeleted }: { orders: Order[]; onDeleted: () => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<DetailCache>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (expandedId === null) return;
    if (!orders.some((o) => o.id === expandedId)) {
      setExpandedId(null);
    }
  }, [orders, expandedId]);

  const toggleDetails = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setErr(null);
      return;
    }

    setExpandedId(id);
    setErr(null);

    if (details[id]) return;

    try {
      setLoadingId(id);
      const full = await getOrderById(id);
      setDetails((prev) => ({ ...prev, [id]: full }));
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setLoadingId(null);
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
            <TableHead>Metodo</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className='w-[180px]'>Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => {
            const isOpen = expandedId === o.id;
            const detail = details[o.id] ?? o;
            const isLoadingDetail = loadingId === o.id && !details[o.id];

            return (
              <Fragment key={o.id}>
                <TableRow>
                  <TableCell>#{o.id}</TableCell>
                  <TableCell>{o.consumptionMethod === 'DINE_IN' ? 'Salao' : 'Para viagem'}</TableCell>
                  <TableCell>{o.products?.length ?? 0}</TableCell>
                  <TableCell className='font-medium'>{currency(o.total)}</TableCell>
                  <TableCell>
                    <div className='flex gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => void toggleDetails(o.id)}
                        aria-expanded={isOpen}
                        disabled={loadingId === o.id}
                      >
                        <Eye className='mr-2 h-4 w-4' /> {isOpen ? 'Fechar' : 'Ver'}
                      </Button>
                      <Button variant='destructive' size='sm' onClick={() => void handleDelete(o.id)}>
                        <Trash2 className='mr-2 h-4 w-4' /> Apagar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                <TableRow className='bg-muted/40'>
                  <TableCell colSpan={5} className='p-0'>
                    <div
                      className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                        isOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className='border-t px-6 py-4 space-y-3'>
                        {isLoadingDetail ? (
                          <p className='text-sm text-muted-foreground'>Carregando detalhe...</p>
                        ) : err && isOpen ? (
                          <p className='text-sm text-destructive'>{err}</p>
                        ) : detail?.products?.length ? (
                          <>
                            <div className='flex items-center justify-between text-sm text-muted-foreground'>
                              <span>{detail.consumptionMethod === 'DINE_IN' ? 'Salao' : 'Para viagem'}</span>
                              <span className='font-medium text-foreground'>{currency(detail.total)}</span>
                            </div>
                            <div className='overflow-hidden rounded-lg border bg-background'>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Preco</TableHead>
                                    <TableHead>Qtd</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {detail.products.map((p) => (
                                    <TableRow key={`${p.productId}-${p.id ?? 'item'}`}>
                                      <TableCell>{p.product?.name ?? `#${p.productId}`}</TableCell>
                                      <TableCell>{currency(p.price ?? 0)}</TableCell>
                                      <TableCell>{p.quantity}</TableCell>
                                      <TableCell className='font-medium'>{currency(p.subtotal ?? 0)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </>
                        ) : (
                          <p className='text-sm text-muted-foreground'>Nenhum item encontrado para este pedido.</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
