'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ConsumptionMethod, Product } from '@/features/orders/types';
import { createOrder, getErrorMessage, currency } from '@/lib/api/orders';
import { listProducts } from '@/lib/api/product';
import { Plus } from 'lucide-react';
import Image from 'next/image';

export function CreateOrderForm({ onCreated }: { onCreated: () => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [method, setMethod] = useState<ConsumptionMethod>('DINE_IN');
  const [items, setItems] = useState<Array<{ productId: number | ''; quantity: number }>>([
    { productId: '', quantity: 1 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setProducts(await listProducts());
      } catch (e: unknown) {
        setErr(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalPreview = useMemo(
    () =>
      items.reduce((acc, it) => {
        const prod = products.find((p) => p.id === it.productId);
        return prod ? acc + prod.price * (it.quantity || 0) : acc;
      }, 0),
    [items, products],
  );

  const updateItem = (idx: number, patch: Partial<{ productId: number | ''; quantity: number }>) =>
    setItems((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const addRow = () => setItems((prev) => [...prev, { productId: '', quantity: 1 }]);
  const removeRow = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const canSubmit = items.length > 0 && items.every((it) => typeof it.productId === 'number' && it.quantity > 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setSubmitting(true);
      await createOrder({
        consumptionMethod: method,
        products: items
          .filter((it) => typeof it.productId === 'number')
          .map((it) => ({ productId: Number(it.productId), quantity: Number(it.quantity) })),
      });
      setItems([{ productId: '', quantity: 1 }]);
      onCreated();
    } catch (e: unknown) {
      alert(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className='mx-auto max-w-5xl'>
      <CardHeader>
        <CardTitle>Novo pedido</CardTitle>
      </CardHeader>
      <CardContent>
        {err && (
          <div className='mb-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive'>
            {err}
          </div>
        )}

        {loading ? (
          <p className='text-sm text-muted-foreground'>Carregando produtos…</p>
        ) : products.length === 0 ? (
          <p className='text-sm text-muted-foreground'>Cadastre produtos antes de criar pedidos.</p>
        ) : (
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='flex flex-wrap items-center gap-4'>
              <div className='space-y-2'>
                <Label className='text-sm'>Consumo</Label>
                <div className='flex gap-2'>
                  <Button
                    type='button'
                    variant={method === 'DINE_IN' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setMethod('DINE_IN')}
                  >
                    Comer aqui
                  </Button>
                  <Button
                    type='button'
                    variant={method === 'TAKE_AWAY' ? 'default' : 'outline'}
                    size='sm'
                    onClick={() => setMethod('TAKE_AWAY')}
                  >
                    Para viagem
                  </Button>
                </div>
              </div>

              <div className='ml-auto text-right'>
                <div className='text-xs uppercase tracking-wide text-muted-foreground'>Total</div>
                <div className='text-lg font-semibold'>{currency(totalPreview)}</div>
              </div>
            </div>

            <div className='overflow-hidden rounded-xl border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className='w-[110px] text-center'>Imagem</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row, idx) => {
                    const prod = products.find((p) => p.id === row.productId);
                    const subtotal = prod ? prod.price * (row.quantity || 0) : 0;

                    return (
                      <TableRow key={idx}>
                        <TableCell className='min-w-[220px]'>
                          <Select
                            value={row.productId === '' ? '' : String(row.productId)}
                            onValueChange={(v) => updateItem(idx, { productId: Number(v) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Selecione…' />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className='w-[110px]'>
                          <div className='flex min-h-14 items-center justify-center'>
                            {prod?.image ? (
                              <Image
                                key={prod.id}
                                src={prod.image}
                                alt={prod.name}
                                width={48}
                                height={48}
                                className='h-12 w-12 rounded object-cover border'
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRUVFRUVFIi8+CjxwYXRoIGQ9Ik0xNSA0MkwzNSA4IiBzdHJva2U9IiNBN0E3QTciIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CjxwYXRoIGQ9Ik0xOCAyMEgyMiIgc3Ryb2tlPSIjOTk5OTk5IiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMjggMjBIMzIiIHN0cm9rZT0iIzk5OTk5OSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTI1IDI4QzI3Ljc2MTQgMjggMzAgMjUuNzYxNCAzMCAyMUMzMCAxNi4yMzg2IDI3Ljc2MTQgMTQgMjUgMTRDMjIuMjM4NiAxNCAyMCAxNi4yMzg2IDIwIDIxQzIwIDI1Ljc2MTQgMjIuMjM4NiAyOCAyNSAyOFoiIGZpbGw9IiNCQkJEQkQiLz4KPC9zdmc+';
                                }}
                              />
                            ) : (
                              <span className='text-xs text-muted-foreground'>—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{prod ? currency(prod.price) : '—'}</TableCell>
                        <TableCell className='w-[120px]'>
                          <Input
                            type='number'
                            min={1}
                            value={row.quantity}
                            onChange={(e) => updateItem(idx, { quantity: Math.max(1, Number(e.target.value)) })}
                          />
                        </TableCell>
                        <TableCell className='font-medium'>{currency(subtotal)}</TableCell>
                        <TableCell className='w-[120px]'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => removeRow(idx)}
                            disabled={items.length === 1}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className='flex items-center justify-between'>
              <Button type='button' variant='outline' onClick={addRow}>
                <Plus className='mr-2 h-4 w-4' /> Adicionar item
              </Button>
              <Button type='submit' disabled={!canSubmit || submitting}>
                {submitting ? 'Salvando…' : 'Criar pedido'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
