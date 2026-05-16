'use client';

import { Camera, Upload, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { compressImage } from '@/lib/utils/compress-image';
import { cn } from '@/lib/utils/cn';

type Status = 'idle' | 'preview' | 'extracting' | 'success' | 'error';

export function ReceiptUploader() {
  const t = useTranslations('upload');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const selectFile = useCallback((file: File) => {
    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setStatus('preview');
  }, []);

  const extract = useCallback(
    async (file: File) => {
      setStatus('extracting');
      const compressed = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressed);
      try {
        const res = await fetch('/api/receipts/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? t('errorGeneric'));
        }
        const result = (await res.json()) as { receiptId: string };
        setStatus('success');
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        router.push(`/receipts/${result.receiptId}`);
        router.refresh();
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : t('errorGeneric'));
      }
    },
    [router, t, previewUrl],
  );

  const confirmExtract = () => {
    if (pendingFile) void extract(pendingFile);
  };

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setStatus('idle');
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) selectFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) selectFile(file);
  };

  if (status === 'preview' && previewUrl && pendingFile) {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Receipt preview"
            className="max-h-96 w-full object-contain"
          />
        </div>
        <p className="text-center text-sm text-ink-500">{pendingFile.name}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={reset}>
            <X className="mr-2 h-4 w-4" />
            {t('previewChange')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={confirmExtract}>
            {t('previewConfirm')}
          </Button>
        </div>
      </div>
    );
  }

  if (status === 'extracting') {
    return (
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-100 bg-white p-12 text-center shadow-sm">
          <div className="mb-4 flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="font-medium text-ink-700">{t('extracting')}</p>
          <p className="mt-1 text-sm text-ink-400">{t('extractingDetail')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-colors',
          isDragging ? 'border-brand-500 bg-brand-50' : 'border-ink-200 hover:border-brand-300 hover:bg-brand-50/30',
          status === 'error' && 'border-red-200',
        )}
      >
        <Upload className="mb-3 h-10 w-10 text-ink-400" />
        <p className="font-medium">{t('dropzone')}</p>
        <p className="mt-1 text-sm text-ink-500">{t('supportedFormats')}</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Camera capture — shows on mobile */}
      <button
        onClick={() => cameraRef.current?.click()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white py-3 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 md:hidden"
      >
        <Camera className="h-4 w-4" />
        {t('takePhoto')}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onFileChange}
        />
      </button>

      {status === 'error' && error && (
        <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {status === 'error' && (
        <Button variant="secondary" className="mt-3 w-full" onClick={reset}>
          {t('tryAgain')}
        </Button>
      )}
    </div>
  );
}
