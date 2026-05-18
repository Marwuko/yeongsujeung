/**
 * Merchant intelligence — canonical name normalization and default category
 * assignment for well-known chains.
 *
 * Patterns are tested against the raw vendor string from the AI extraction.
 * Matching is intentionally loose to handle OCR noise ("GS 25" → GS25, etc.).
 */

export interface MerchantInfo {
  canonical: string;
  categorySlug: string;
}

interface MerchantEntry extends MerchantInfo {
  patterns: RegExp[];
}

const MERCHANT_DB: MerchantEntry[] = [
  // ── Korean convenience stores ────────────────────────────────────────
  { canonical: 'GS25',            categorySlug: 'convenience', patterns: [/gs\s*25/i, /지에스\s*25/i] },
  { canonical: 'CU',              categorySlug: 'convenience', patterns: [/\bcu\b/i, /씨\s*유/i, /비지에프\s*리테일/i] },
  { canonical: '7-Eleven',        categorySlug: 'convenience', patterns: [/7[\s-]?eleven/i, /세븐\s*일레븐/i] },
  { canonical: 'Ministop',        categorySlug: 'convenience', patterns: [/ministop/i, /미니스톱/i] },
  { canonical: 'Emart24',         categorySlug: 'convenience', patterns: [/e-?mart\s*24/i, /이마트\s*24/i] },

  // ── Korean grocery / hypermarket ────────────────────────────────────
  { canonical: 'Emart',           categorySlug: 'grocery', patterns: [/\be-?mart\b/i, /\b이마트\b/] },
  { canonical: 'Homeplus',        categorySlug: 'grocery', patterns: [/homeplus/i, /홈플러스/i] },
  { canonical: 'Lotte Mart',      categorySlug: 'grocery', patterns: [/lotte\s*mart/i, /롯데마트/i] },
  { canonical: 'Costco',          categorySlug: 'grocery', patterns: [/costco/i, /코스트코/i] },
  { canonical: 'No Brand',        categorySlug: 'grocery', patterns: [/no\s*brand/i, /노브랜드/i] },
  { canonical: 'Traders',         categorySlug: 'grocery', patterns: [/\btraders\b/i, /트레이더스/i] },

  // ── Coffee & cafés ─────────────────────────────────────────────────
  { canonical: 'Starbucks',       categorySlug: 'cafe', patterns: [/star\s*bucks/i, /스타벅스/i, /스타박스/i] },
  { canonical: 'Paris Baguette',  categorySlug: 'cafe', patterns: [/paris\s*baguette/i, /파리바게뜨/i] },
  { canonical: 'Tous les Jours',  categorySlug: 'cafe', patterns: [/tous\s*les\s*jours/i, /뚜레쥬르/i] },
  { canonical: 'Ediya Coffee',    categorySlug: 'cafe', patterns: [/ediya/i, /이디야/i] },
  { canonical: 'Mega Coffee',     categorySlug: 'cafe', patterns: [/mega\s*(?:mgc\s*)?coffee/i, /메가커피/i, /메가엠지씨/i] },
  { canonical: 'Compose Coffee',  categorySlug: 'cafe', patterns: [/compose/i, /컴포즈/i] },
  { canonical: 'Paik\'s Coffee',  categorySlug: 'cafe', patterns: [/paik/i, /빽다방/i] },
  { canonical: 'Hollys Coffee',   categorySlug: 'cafe', patterns: [/holly'?s/i, /할리스/i] },
  { canonical: 'Angel-in-us',     categorySlug: 'cafe', patterns: [/angel[\s-]?in[\s-]?us/i, /엔젤리너스/i] },

  // ── Restaurants ────────────────────────────────────────────────────
  { canonical: "McDonald's",      categorySlug: 'restaurant', patterns: [/mc\s*donald/i, /맥도날드/i] },
  { canonical: 'Burger King',     categorySlug: 'restaurant', patterns: [/burger\s*king/i, /버거킹/i] },
  { canonical: 'Lotteria',        categorySlug: 'restaurant', patterns: [/lotteria/i, /롯데리아/i] },
  { canonical: 'KFC',             categorySlug: 'restaurant', patterns: [/\bkfc\b/i, /케이에프씨/i] },
  { canonical: 'Subway',          categorySlug: 'restaurant', patterns: [/\bsubway\b/i, /써브웨이/i] },
  { canonical: "Domino's Pizza",  categorySlug: 'restaurant', patterns: [/domino/i, /도미노/i] },
  { canonical: 'Pizza Hut',       categorySlug: 'restaurant', patterns: [/pizza\s*hut/i, /피자헛/i] },
  { canonical: 'Mom\'s Touch',    categorySlug: 'restaurant', patterns: [/mom'?s?\s*touch/i, /맘스터치/i] },
  { canonical: 'Popeyes',         categorySlug: 'restaurant', patterns: [/popeye/i, /파파이스/i] },
  { canonical: 'Nene Chicken',    categorySlug: 'restaurant', patterns: [/nene/i, /네네치킨/i] },
  { canonical: 'BBQ Chicken',     categorySlug: 'restaurant', patterns: [/\bbbq\b/i, /비비큐/i] },

  // ── Transport ─────────────────────────────────────────────────────
  { canonical: 'KakaoT',          categorySlug: 'transport', patterns: [/kakao\s*t\b/i, /카카오\s*(?:택시|t)/i] },
  { canonical: 'Uber',            categorySlug: 'transport', patterns: [/\buber\b/i] },
  { canonical: 'T-money',         categorySlug: 'transport', patterns: [/t-?money/i, /티머니/i] },
  { canonical: 'Korail',          categorySlug: 'transport', patterns: [/korail/i, /코레일/i, /ktx/i] },
  { canonical: 'Seoul Metro',     categorySlug: 'transport', patterns: [/seoul\s*metro/i, /서울교통공사/i] },
  { canonical: 'Deutsche Bahn',   categorySlug: 'transport', patterns: [/deutsche\s*bahn/i, /\bdb\s*bahn\b/i] },

  // ── Health & beauty ────────────────────────────────────────────────
  { canonical: 'Olive Young',     categorySlug: 'health', patterns: [/olive\s*young/i, /올리브영/i] },
  { canonical: 'Rossmann',        categorySlug: 'health', patterns: [/rossmann/i] },
  { canonical: 'dm',              categorySlug: 'health', patterns: [/\bdm[\s-]drogerie/i, /\bdm\s+markt/i] },

  // ── Shopping & delivery ────────────────────────────────────────────
  { canonical: 'Daiso',           categorySlug: 'shopping', patterns: [/daiso/i, /다이소/i] },
  { canonical: 'Coupang',         categorySlug: 'shopping', patterns: [/coupang/i, /쿠팡(?!이츠)/i] },
  { canonical: 'Amazon',          categorySlug: 'shopping', patterns: [/\bamazon\b/i] },

  // ── German grocery ────────────────────────────────────────────────
  { canonical: 'Rewe',            categorySlug: 'grocery', patterns: [/\brewe\b/i] },
  { canonical: 'Edeka',           categorySlug: 'grocery', patterns: [/\bedeka\b/i] },
  { canonical: 'Lidl',            categorySlug: 'grocery', patterns: [/\blidl\b/i] },
  { canonical: 'Aldi',            categorySlug: 'grocery', patterns: [/\baldi\b(?:\s*(?:nord|süd))?/i] },
  { canonical: 'Penny',           categorySlug: 'grocery', patterns: [/\bpenny\b/i] },
  { canonical: 'Netto',           categorySlug: 'grocery', patterns: [/\bnetto\b/i] },
  { canonical: 'Kaufland',        categorySlug: 'grocery', patterns: [/kaufland/i] },

  // ── Subscriptions ─────────────────────────────────────────────────
  { canonical: 'Netflix',         categorySlug: 'subscription', patterns: [/netflix/i] },
  { canonical: 'Spotify',         categorySlug: 'subscription', patterns: [/spotify/i] },
  { canonical: 'Apple',           categorySlug: 'subscription', patterns: [/\bapple(?:\s+(?:store|inc|tv|music))?/i] },
  { canonical: 'Google',          categorySlug: 'subscription', patterns: [/\bgoogle(?:\s+(?:play|one))?/i] },
];

/**
 * Match a raw vendor string against the merchant database.
 * Returns canonical name + category if recognized, null otherwise.
 */
export function normalizeMerchant(raw: string | null | undefined): MerchantInfo | null {
  if (!raw?.trim()) return null;
  const trimmed = raw.trim();
  for (const entry of MERCHANT_DB) {
    if (entry.patterns.some((p) => p.test(trimmed))) {
      return { canonical: entry.canonical, categorySlug: entry.categorySlug };
    }
  }
  return null;
}
