import { getLocale } from 'next-intl/server';

import { SettingsForm } from '@/components/settings/SettingsForm';
import type { Locale } from '@/types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const locale = (await getLocale()) as Locale;

  const title =
    locale === 'ko' ? '설정' : locale === 'de' ? 'Einstellungen' : 'Settings';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <SettingsForm />
    </div>
  );
}
