import type { Locale } from '@/types';
import { normalizeMerchant } from './merchants';

export interface ReceiptForInsight {
  vendor: string | null;
  totalAmount: number | null;
  currency: string;
  category: { slug: string; nameEn: string; nameKo: string } | null;
  items: unknown[];
}

function tr(locale: Locale, en: string, ko: string, de: string): string {
  if (locale === 'ko') return ko;
  if (locale === 'de') return de;
  return en;
}

export function generateReceiptInsight(
  receipt: ReceiptForInsight,
  locale: Locale,
): string | null {
  const { vendor, totalAmount, currency, category, items } = receipt;

  // 1. Recognized merchant — mention auto-categorization
  const merchant = normalizeMerchant(vendor);
  if (merchant && category) {
    const catName = locale === 'ko' ? category.nameKo : category.nameEn;
    return tr(
      locale,
      `${merchant.canonical} was automatically recognized and categorized under ${catName}.`,
      `${merchant.canonical}이(가) 자동으로 인식되어 ${category.nameKo} 카테고리에 분류되었습니다.`,
      `${merchant.canonical} wurde automatisch erkannt und als ${catName} kategorisiert.`,
    );
  }

  // 2. Detailed receipt — many line items
  if (items.length >= 5) {
    return tr(
      locale,
      `${items.length} line items were extracted — a detailed view of this purchase.`,
      `${items.length}개 품목이 추출되었습니다. 이 구매의 상세 내역을 확인하세요.`,
      `${items.length} Positionen wurden extrahiert — eine detaillierte Aufschlüsselung.`,
    );
  }

  // 3. Large purchase — budget awareness
  if (totalAmount != null) {
    const isLarge =
      (currency === 'KRW' && totalAmount > 50000) ||
      (currency === 'NGN' && totalAmount > 10000) ||
      (!['KRW', 'NGN'].includes(currency) && totalAmount > 50);
    if (isLarge) {
      return tr(
        locale,
        'This is a larger purchase — worth tracking against your monthly budget.',
        '이번 결제는 큰 금액입니다. 월간 예산과 비교해 보세요.',
        'Das ist ein größerer Einkauf — vergleichen Sie ihn mit Ihrem Monatsbudget.',
      );
    }
  }

  // 4. Category-based default insight
  if (category) {
    const catName = locale === 'ko' ? category.nameKo : category.nameEn;
    return tr(
      locale,
      `This purchase falls under ${catName} — a commonly tracked spending category.`,
      `이 영수증은 ${category.nameKo} 항목으로 분류됩니다.`,
      `Dieser Kauf wird unter ${catName} erfasst.`,
    );
  }

  return null;
}
