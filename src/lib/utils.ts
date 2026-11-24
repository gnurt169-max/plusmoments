import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number | string | bigint | any): string {
  const numeric = typeof amount === 'number' ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format a Date or date string to YYYY-MM-DDTHH:mm in Asia/Ho_Chi_Minh timezone
 * for <input type="datetime-local"> so it never shifts due to UTC.
 */
export function formatVietnamDateTimeLocal(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Parse an incoming date string (such as from <input type="datetime-local">)
 * into a Date object guaranteed to be in Asia/Ho_Chi_Minh (+07:00).
 */
export function parseVietnamWeddingDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const clean = dateStr.trim();
  // If it's in YYYY-MM-DDTHH:mm or YYYY-MM-DD format without timezone, attach +07:00
  if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/.test(clean)) {
    const withTime = clean.includes('T') ? clean : `${clean}T00:00:00`;
    return new Date(`${withTime}+07:00`);
  }
  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Automatically format Vietnamese Phone Number with spaces:
 * e.g. 0903768871 -> 0903 768 871
 */
export function formatVietnamesePhone(val: string): string {
  if (!val) return '';
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

/**
 * Format currency input with thousand separators (dots):
 * e.g. 15000000 -> 15.000.000
 */
export function formatCurrencyInput(val: string | number): string {
  if (val === undefined || val === null || val === '') return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
}

/**
 * Ensure image or asset URL is fully qualified with domain (for OpenGraph / Twitter / CAPI)
 */
export function toAbsoluteUrl(path: string | null | undefined, baseUrl = 'https://plusmoments.vn'): string {
  if (!path) return `${baseUrl.replace(/\/$/, '')}/images/og-image.jpg`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

