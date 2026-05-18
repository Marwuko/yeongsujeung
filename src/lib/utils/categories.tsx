import {
  BookOpen,
  Bus,
  Coffee,
  Heart,
  type LucideIcon,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Store,
  Tag,
  Utensils,
} from 'lucide-react';

import type { Locale } from '@/types';

export interface CategoryConfig {
  Icon: LucideIcon;
  color: string;
  bg: string;
  labelEn: string;
  labelKo: string;
  labelDe: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  restaurant:   { Icon: Utensils,     color: '#ed6f1f', bg: '#fef7ee', labelEn: 'Restaurant',   labelKo: '식당',   labelDe: 'Restaurant' },
  cafe:         { Icon: Coffee,       color: '#b84014', bg: '#fdecd6', labelEn: 'Cafe',          labelKo: '카페',   labelDe: 'Café' },
  convenience:  { Icon: Store,        color: '#d97706', bg: '#fffbeb', labelEn: 'Convenience',   labelKo: '편의점', labelDe: 'Kiosk' },
  grocery:      { Icon: ShoppingCart, color: '#16a34a', bg: '#f0fdf4', labelEn: 'Grocery',       labelKo: '마트',   labelDe: 'Supermarkt' },
  transport:    { Icon: Bus,          color: '#2563eb', bg: '#eff6ff', labelEn: 'Transport',     labelKo: '교통',   labelDe: 'Transport' },
  subscription: { Icon: Smartphone,   color: '#7c3aed', bg: '#f5f3ff', labelEn: 'Subscription',  labelKo: '구독',   labelDe: 'Abonnement' },
  school:       { Icon: BookOpen,     color: '#0891b2', bg: '#ecfeff', labelEn: 'Education',     labelKo: '학용품', labelDe: 'Bildung' },
  health:       { Icon: Heart,        color: '#db2777', bg: '#fdf2f8', labelEn: 'Health',        labelKo: '건강',   labelDe: 'Gesundheit' },
  shopping:     { Icon: ShoppingBag,  color: '#0891b2', bg: '#ecfeff', labelEn: 'Shopping',      labelKo: '쇼핑',   labelDe: 'Einkaufen' },
  other:        { Icon: Tag,          color: '#6b7280', bg: '#f9fafb', labelEn: 'Other',         labelKo: '기타',   labelDe: 'Sonstiges' },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_CONFIG) as (keyof typeof CATEGORY_CONFIG)[];

export function getCategoryConfig(slug: string | null | undefined): CategoryConfig {
  if (slug && slug in CATEGORY_CONFIG) return CATEGORY_CONFIG[slug]!;
  return CATEGORY_CONFIG.other!;
}

export function getCategoryLabel(
  category: { slug?: string; nameEn?: string; nameKo?: string } | null | undefined,
  locale: Locale,
): string {
  if (!category) return '—';
  const cfg = CATEGORY_CONFIG[category.slug ?? ''];
  if (locale === 'ko') return cfg?.labelKo ?? category.nameKo ?? '—';
  if (locale === 'de') return cfg?.labelDe ?? category.nameEn ?? '—';
  return cfg?.labelEn ?? category.nameEn ?? '—';
}

interface CategoryIconProps {
  slug?: string | null;
  size?: number;
  className?: string;
}

export function CategoryIcon({ slug, size = 18, className }: CategoryIconProps) {
  const { Icon, color, bg } = getCategoryConfig(slug);
  const boxSize = Math.round(size * 2.2);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl ${className ?? ''}`}
      style={{ width: boxSize, height: boxSize, backgroundColor: bg }}
    >
      <Icon style={{ width: size, height: size, color }} strokeWidth={1.75} />
    </div>
  );
}
