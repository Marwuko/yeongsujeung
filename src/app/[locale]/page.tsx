import {
  BarChart3,
  Camera,
  ChevronRight,
  Globe,
  PenLine,
  Receipt,
  Target,
  TrendingDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function HomePage() {
  const t = useTranslations();
  const isKo = t('app.name') === '영수증';

  return (
    <div className="min-h-screen bg-white text-ink-900">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Receipt className="h-5 w-5 text-brand-500" strokeWidth={2} />
            <span className="text-sm font-semibold tracking-tight">
              {isKo ? '영수증' : 'Yeongsujeung'}
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100"
            >
              {t('auth.login')}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-700"
            >
              {isKo ? '시작하기' : 'Get started'}
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 pb-20 pt-24">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-medium text-brand-600">
            {isKo ? '한국 생활을 위한 AI 가계부' : 'AI-powered expense tracking for Korea'}
          </p>
          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-ink-900 md:text-6xl">
            {isKo ? (
              <>
                모든 지출,
                <br />
                <span className="text-ink-400">한 곳에서.</span>
              </>
            ) : (
              <>
                Every receipt.
                <br />
                <span className="text-ink-400">Understood.</span>
              </>
            )}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-500">
            {isKo
              ? '한국어 영수증을 사진으로 찍으면 AI가 즉시 분석합니다. 외국인·유학생도 쉽게 지출을 관리하세요.'
              : 'Photograph any Korean or English receipt and get structured data instantly. Built for expats and students who need to navigate unfamiliar receipts.'}
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              {isKo ? '무료로 시작하기' : 'Start for free'}
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
            >
              {isKo ? '로그인 →' : 'Log in →'}
            </Link>
          </div>
        </div>

        {/* ── Dashboard preview ────────────────────────────── */}
        <div className="mt-16 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lg shadow-ink-900/5">
          {/* Fake browser chrome */}
          <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="ml-3 rounded-md bg-ink-100 px-10 py-1 text-xs text-ink-400">
              {isKo ? '대시보드' : 'dashboard'}
            </span>
          </div>

          {/* Dashboard content mockup */}
          <div className="p-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-ink-400">
                  {isKo ? '이번 달' : 'This month'}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight">
                  {isKo ? '₩ 1,240,000' : '₩ 1,240,000'}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
                <TrendingDown className="h-3 w-3" />
                {isKo ? '전월 대비 -8%' : '-8% vs last month'}
              </div>
            </div>

            {/* Simulated chart bars */}
            <div className="mb-5 flex items-end gap-1.5 overflow-hidden rounded-xl bg-ink-50 px-4 pb-3 pt-4">
              {[30, 55, 40, 70, 45, 80, 60, 35, 65, 50, 90, 45, 72, 38].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-brand-500 opacity-70"
                  style={{ height: `${h * 0.6}px` }}
                />
              ))}
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: isKo ? '음식점 42%' : 'Restaurant 42%', w: 42 },
                { label: isKo ? '카페 21%' : 'Cafe 21%', w: 21 },
                { label: isKo ? '교통 18%' : 'Transport 18%', w: 18 },
                { label: isKo ? '기타 19%' : 'Other 19%', w: 19 },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2">
                  <div
                    className="h-2 rounded-full bg-brand-500 opacity-70"
                    style={{ width: `${c.w * 0.6}px` }}
                  />
                  <span className="text-xs font-medium text-ink-600">{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="border-t border-ink-100 bg-ink-50">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">

            <Feature
              icon={<Camera className="h-5 w-5" />}
              title={isKo ? '찍으면 끝' : 'Snap to extract'}
              body={isKo
                ? 'Claude AI가 한국어·영어 영수증을 인식해 상호, 금액, 부가세, 품목을 자동 추출합니다. 수동 입력 없음.'
                : 'Claude AI reads Korean and English receipts — vendor, total, tax, line items — without you typing a single character.'}
            />

            <Feature
              icon={<BarChart3 className="h-5 w-5" />}
              title={isKo ? '지출 패턴 파악' : 'Understand your spending'}
              body={isKo
                ? '카테고리별 도넛 차트와 날짜별 추이 그래프로 돈이 어디에 가는지 한눈에 확인하세요.'
                : 'Category donut charts and a 30-day trend line show exactly where your money is going, updated the moment you scan a receipt.'}
            />

            <Feature
              icon={<Target className="h-5 w-5" />}
              title={isKo ? '예산 목표 설정' : 'Budget before you overspend'}
              body={isKo
                ? '월 예산을 정해두면 실시간 진행 바가 남은 금액을 보여줍니다. 초과하기 전에 미리 알 수 있어요.'
                : 'Set a monthly limit and a live progress bar tracks it against every new receipt — you see the ceiling before you hit it.'}
            />

            <Feature
              icon={<PenLine className="h-5 w-5" />}
              title={isKo ? 'AI가 틀렸다면 수정' : 'Fix what AI gets wrong'}
              body={isKo
                ? 'AI 추출 결과가 틀렸어도 괜찮습니다. 상호, 금액, 카테고리를 두 번의 탭으로 수정할 수 있어요.'
                : "AI isn't perfect. If it misreads a vendor or category, editing takes two taps — no re-scanning needed."}
            />

            <Feature
              icon={<Globe className="h-5 w-5" />}
              title={isKo ? '한국어·영어 완전 지원' : 'Korean and English, natively'}
              body={isKo
                ? '앱 전체가 한국어·영어 두 언어로 제공됩니다. 영수증도 두 언어 모두 지원해요.'
                : 'Every screen, every label, every error message — available in Korean and English. Switch any time.'}
            />

            <Feature
              icon={<Receipt className="h-5 w-5" />}
              title={isKo ? '전월 대비 비교' : 'Month-over-month tracking'}
              body={isKo
                ? '이번 달 지출이 지난달보다 얼마나 늘었거나 줄었는지 퍼센트로 바로 확인합니다.'
                : 'Each stat card shows a % change badge so you know instantly if you\'re spending more or less than last month.'}
            />

          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section className="border-t border-ink-100">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            {isKo ? '지금 바로 시작하세요' : 'Start tracking today'}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-500">
            {isKo
              ? '영수증 한 장으로 한국 생활 가계부를 시작할 수 있습니다.'
              : 'One photo is all it takes to bring order to your Korea spending.'}
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-600"
          >
            {isKo ? '무료로 시작하기' : 'Get started free'}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-100 px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-xs text-ink-400">
          <div className="flex items-center gap-2">
            <Receipt className="h-3.5 w-3.5" />
            <span>Yeongsujeung</span>
          </div>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-ink-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{body}</p>
      </div>
    </div>
  );
}
