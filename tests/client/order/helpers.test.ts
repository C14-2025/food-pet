import { currency, getErrorMessage } from '@/lib/api/orders';

const norm = (s: string) => s.replace(/\u00a0/g, ' '); // NBSP -> espaço normal

describe('helpers', () => {
  test('currency formata em BRL', () => {
    expect(norm(currency(0))).toBe('R$ 0,00');
    expect(norm(currency(12.5))).toBe('R$ 12,50');
    expect(norm(currency(1999.99))).toBe('R$ 1.999,99');
  });

  test('getErrorMessage com Error', () => {
    expect(getErrorMessage(new Error('falhou'))).toBe('falhou');
  });

  test('getErrorMessage com string', () => {
    expect(getErrorMessage('ops')).toBe('ops');
  });

  test('getErrorMessage com objeto', () => {
    expect(getErrorMessage({ a: 1 })).toBe(JSON.stringify({ a: 1 }));
  });
});
