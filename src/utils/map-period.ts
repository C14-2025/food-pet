export const mapPeriodToLabel = (p: string) => {
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
