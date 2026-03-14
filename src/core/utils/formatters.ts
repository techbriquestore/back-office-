import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY');
}

export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('DD/MM/YYYY HH:mm');
}

export function formatRelative(date: string | Date): string {
  const d = dayjs(date);
  const now = dayjs();
  const diffMinutes = now.diff(d, 'minute');
  if (diffMinutes < 1) return "À l'instant";
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  const diffHours = now.diff(d, 'hour');
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = now.diff(d, 'day');
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return formatDate(date);
}

export function formatPercentChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
