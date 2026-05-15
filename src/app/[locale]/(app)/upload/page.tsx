import { useTranslations } from 'next-intl';

import { ReceiptUploader } from '@/components/receipt/ReceiptUploader';

export default function UploadPage() {
  const t = useTranslations('upload');

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-ink-500">{t('subtitle')}</p>
      </div>
      <ReceiptUploader />
    </main>
  );
}
