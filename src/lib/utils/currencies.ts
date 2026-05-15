import type { Locale } from '@/types';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  nameEn: string;
  nameKo: string;
  nameDe: string;
  decimals: number;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'KRW', symbol: '₩',  nameEn: 'South Korean Won',  nameKo: '원',          nameDe: 'Südkoreanischer Won',  decimals: 0 },
  { code: 'USD', symbol: '$',  nameEn: 'US Dollar',          nameKo: '미국 달러',   nameDe: 'US-Dollar',            decimals: 2 },
  { code: 'EUR', symbol: '€',  nameEn: 'Euro',               nameKo: '유로',        nameDe: 'Euro',                 decimals: 2 },
  { code: 'GBP', symbol: '£',  nameEn: 'British Pound',      nameKo: '영국 파운드', nameDe: 'Britisches Pfund',     decimals: 2 },
  { code: 'CAD', symbol: 'C$', nameEn: 'Canadian Dollar',    nameKo: '캐나다 달러', nameDe: 'Kanadischer Dollar',   decimals: 2 },
  { code: 'GHS', symbol: '₵',  nameEn: 'Ghanaian Cedi',      nameKo: '가나 세디',   nameDe: 'Ghanaischer Cedi',     decimals: 2 },
  { code: 'NGN', symbol: '₦',  nameEn: 'Nigerian Naira',     nameKo: '나이지리아 나이라', nameDe: 'Nigerianische Naira', decimals: 0 },
];

export const CURRENCY_CODES = SUPPORTED_CURRENCIES.map((c) => c.code);

export function getCurrencyInfo(code: string): CurrencyInfo {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? SUPPORTED_CURRENCIES[0]!;
}

export function getCurrencyName(code: string, locale: Locale): string {
  const info = getCurrencyInfo(code);
  if (locale === 'ko') return info.nameKo;
  if (locale === 'de') return info.nameDe;
  return info.nameEn;
}
