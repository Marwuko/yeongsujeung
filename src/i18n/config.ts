export const locales = ['en', 'ko', 'de'] as const;
export const defaultLocale = 'en' as const;

export type AppLocale = (typeof locales)[number];

export function isLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
