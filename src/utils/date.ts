import { dayjs } from './dayjs';

export function parseLocalDate(str?: string | null): Date | undefined {
  if (!str) return undefined;
  return dayjs(str, 'YYYY-MM-DD').toDate();
}

export function formatDateLocal(date?: Date | null): string {
  if (!date) return '';
  return dayjs(date).format('YYYY-MM-DD');
}

export function formatDisplayDate(str?: string | null): string {
  if (!str) return '';
  return dayjs(str).format('DD/MM/YYYY');
}
