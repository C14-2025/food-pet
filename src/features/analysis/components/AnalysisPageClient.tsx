'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarRange } from '@/components/ui/calendar/CalendarRange';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDisplayDate } from '@/utils';

type SummaryResponse = {
  period: string;
  startDate: string | null;
  endDate: string | null;
  totalOrders: number;
  totalProducts: number;
  totalProfit: number;
};

export const AnalysisPageClient: React.FC = () => {
  const [period, setPeriod] = useState<string>('month');
  const [mounted, setMounted] = useState(false);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempFrom, setTempFrom] = useState<string>('');
  const [tempTo, setTempTo] = useState<string>('');

  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapPeriodToLabel = (period: string) => {
    if (period === 'all') return 'Todos os períodos';
    if (period === 'day') return 'Hoje';
    if (period === 'week') return 'Última semana';
    if (period == 'month') return 'Último mês';
  };

  async function fetchSummary() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (from && to) {
        params.set('from', from);
        params.set('to', to);
      } else if (period && period !== 'all') {
        params.set('period', period);
      }

      const url = `/api/sales-summary${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      const text = await res.text();
      let json: unknown;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = { message: text } as unknown;
      }

      const getJsonMessage = (j: unknown): string | undefined => {
        if (!j || typeof j !== 'object') return undefined;
        const obj = j as Record<string, unknown>;
        const maybe = obj.error ?? obj.message;
        return typeof maybe === 'string' ? maybe : undefined;
      };

      if (!res.ok) {
        const msg = getJsonMessage(json) ?? `Error ${res.status}`;
        throw new Error(msg);
      }

      if (json && typeof json === 'object') {
        setData(json as SummaryResponse);
      } else {
        setData(null);
      }
    } catch (err: unknown) {
      const getErrorMessage = (e: unknown) => {
        if (!e) return 'Erro ao buscar resumo';
        if (e instanceof Error) return e.message;
        if (typeof e === 'string') return e;
        try {
          return JSON.stringify(e);
        } catch {
          return 'Erro ao buscar resumo';
        }
      };
      setError(getErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) return null;

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex items-center justify-between'>
          <div>
            <CardTitle>Resumo de Vendas</CardTitle>
          </div>
          <div className='flex items-center gap-3'>
            <Select value={period} onValueChange={(newValue) => setPeriod(newValue)}>
              <SelectTrigger size='sm'>
                <SelectValue>{mapPeriodToLabel(period)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos os períodos</SelectItem>
                <SelectItem value='day'>Hoje</SelectItem>
                <SelectItem value='week'>Última semana</SelectItem>
                <SelectItem value='month'>Útimos 30 dias</SelectItem>
              </SelectContent>
            </Select>

            <div className='relative'>
              <button
                type='button'
                className='inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm'
                onClick={() => {
                  setTempFrom(from);
                  setTempTo(to);
                  setShowCalendar((s) => !s);
                }}
              >
                {showCalendar
                  ? tempFrom && tempTo
                    ? `${formatDisplayDate(tempFrom)} à ${formatDisplayDate(tempTo)}`
                    : 'Selecionar intervalo'
                  : from && to
                    ? `${formatDisplayDate(from)} à ${formatDisplayDate(to)}`
                    : 'Selecionar intervalo'}
              </button>
              {showCalendar && (
                <div className='absolute z-50 mt-2'>
                  <div className='bg-white shadow rounded-md'>
                    <CalendarRange
                      {...({
                        from: tempFrom ? new Date(tempFrom) : undefined,
                        to: tempTo ? new Date(tempTo) : undefined,
                        onChange: (r: { from: any; to: any }) => {
                          const fmt = (d?: Date | null) => (d ? d.toISOString().slice(0, 10) : '');
                          setTempFrom(fmt(r.from ?? null));
                          setTempTo(fmt(r.to ?? null));
                        },
                      } as any)}
                    />
                    <div className='flex gap-2 justify-end p-2'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          setTempFrom('');
                          setTempTo('');
                          setShowCalendar(false);
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size='sm'
                        onClick={() => {
                          setFrom(tempFrom);
                          setTo(tempTo);
                          setShowCalendar(false);
                        }}
                        disabled={loading}
                      >
                        Aplicar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant='secondary'
              size='sm'
              onClick={() => {
                setFrom('');
                setTo('');
                setPeriod('month');
                fetchSummary();
              }}
            >
              Limpar
            </Button>

            <Button onClick={fetchSummary} size='sm' disabled={loading}>
              {loading ? 'Carregando...' : 'Filtrar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className='text-destructive'>{error}</div>}

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
            <div>
              <Card className='p-4'>
                <CardTitle className='text-sm'>Pedidos</CardTitle>
                <div className='mt-2 text-2xl font-semibold'>{data ? data.totalOrders : '—'}</div>
                <div className='text-sm text-muted-foreground mt-1'>Número total de pedidos</div>
              </Card>
            </div>

            <div>
              <Card className='p-4'>
                <CardTitle className='text-sm'>Produtos vendidos</CardTitle>
                <div className='mt-2 text-2xl font-semibold'>{data ? data.totalProducts : '—'}</div>
                <div className='text-sm text-muted-foreground mt-1'>Quantidade total de produtos</div>
              </Card>
            </div>

            <div>
              <Card className='p-4'>
                <CardTitle className='text-sm'>Receita</CardTitle>
                <div className='mt-2 text-2xl font-semibold'>{data ? formatCurrency(data.totalProfit) : '—'}</div>
                <div className='text-sm text-muted-foreground mt-1'>Receita total no período</div>
              </Card>
            </div>
          </div>

          <div className='mt-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-sm'>Detalhes</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className='overflow-auto text-xs'>{data ? JSON.stringify(data, null, 2) : 'Sem dados'}</pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisPageClient;
