'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarRange } from '@/components/ui/calendar/CalendarRange';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils';
import { parseLocalDate, formatDateLocal, formatDisplayDate } from '@/utils/date';
import { ChartContainer } from '@/components/ui/chart';

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

  const mapPeriodToLabel = (p: string) => {
    switch (p) {
      case 'all':
        return 'Todos os períodos';
      case 'day':
        return 'Hoje';
      case 'week':
        return 'Última semana';
      case 'month':
        return 'Últimos 30 dias';
      default:
        return '';
    }
  };

  const fetchSummary = async () => {
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
      const json = await res.json();

      if (!res.ok) throw new Error(json?.error || json?.message || `Error ${res.status}`);

      setData(json);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Erro ao buscar resumo');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSummary();
  }, []);

  if (!mounted) return null;

  const chartData = [
    { name: 'Pedidos', value: data?.totalOrders ?? 0, color: '#4ade80' },
    { name: 'Produtos', value: data?.totalProducts ?? 0, color: '#60a5fa' },
    { name: 'Receita', value: data?.totalProfit ?? 0, color: '#facc15' },
  ];

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='flex items-center justify-between'>
          <CardTitle>Resumo de Vendas</CardTitle>
          <div className='flex items-center gap-3'>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger size='sm'>
                <SelectValue>{mapPeriodToLabel(period)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos os períodos</SelectItem>
                <SelectItem value='day'>Hoje</SelectItem>
                <SelectItem value='week'>Última semana</SelectItem>
                <SelectItem value='month'>Últimos 30 dias</SelectItem>
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
                {tempFrom && tempTo
                  ? `${formatDisplayDate(tempFrom)} à ${formatDisplayDate(tempTo)}`
                  : 'Selecionar intervalo'}
              </button>

              {showCalendar && (
                <div className='absolute z-50 mt-2'>
                  <div className='bg-white shadow rounded-md'>
                    <CalendarRange
                      from={parseLocalDate(tempFrom)}
                      to={parseLocalDate(tempTo)}
                      onChange={(r) => {
                        setTempFrom(r.from ? formatDateLocal(r.from) : '');
                        setTempTo(r.to ? formatDateLocal(r.to) : '');
                      }}
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
                          fetchSummary();
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
            <Card className='p-4'>
              <CardTitle className='text-sm'>Pedidos</CardTitle>
              <div className='mt-2 text-2xl font-semibold'>{data?.totalOrders ?? '—'}</div>
              <div className='text-sm text-muted-foreground mt-1'>Número total de pedidos</div>
            </Card>

            <Card className='p-4'>
              <CardTitle className='text-sm'>Produtos vendidos</CardTitle>
              <div className='mt-2 text-2xl font-semibold'>{data?.totalProducts ?? '—'}</div>
              <div className='text-sm text-muted-foreground mt-1'>Quantidade total de produtos</div>
            </Card>

            <Card className='p-4'>
              <CardTitle className='text-sm'>Receita</CardTitle>
              <div className='mt-2 text-2xl font-semibold'>{data ? formatCurrency(data.totalProfit) : '—'}</div>
              <div className='text-sm text-muted-foreground mt-1'>Receita total no período</div>
            </Card>
          </div>

          {/* Gráfico */}
          <Card className='mt-6'>
            <CardHeader>
              <CardTitle>Resumo Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                className='h-[300px] w-full'
                config={
                  {
                    type: 'bar',
                    data: {
                      labels: chartData.map((c) => c.name),
                      datasets: [
                        {
                          label: 'Total',
                          data: chartData.map((c) => c.value),
                          backgroundColor: chartData.map((c) => c.color),
                        },
                      ],
                    },
                    options: {
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                      },
                    },
                  } as any
                }
              >
                <div />
              </ChartContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisPageClient;
