'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { ArrowRight, GraduationCap, Leaf, LoaderCircle, RefreshCw, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { QrScanner } from '@/app/components/qr-scanner';
import {
  CLAIMED_COUPON_STORAGE_KEY,
  type ClaimCouponResponse,
  type Coupon,
} from '@/lib/coupon';
import { couponCodeFromPageUrl } from '@/lib/voucher-code';
import {
  cacheVoucherOutcome,
  getCachedVoucherOutcome,
  type VoucherOutcomeKind,
} from '@/lib/voucher-outcome-cache';

const subscribeToPageUrl = () => () => {};
const getPageUrl = () => window.location.href;
const getServerPageUrl = () => undefined;

type LookupState =
  | { status: 'loading' }
  | { status: 'ready'; coupon: Coupon }
  | { status: 'error'; message: string };

type LookupApiResult =
  | { success: true; coupon: Coupon }
  | { success: false; error?: string; message?: string };

type LookupRequestResult = {
  ok: boolean;
  status: number;
  retryAfter: string | null;
  result: LookupApiResult;
};

const pendingLookups = new Map<string, Promise<LookupRequestResult>>();

function rateLimitMessage(retryAfter: string | null) {
  if (!retryAfter) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  const seconds = Number(retryAfter);

  return Number.isFinite(seconds)
    ? `Too many attempts. Try again in ${seconds} seconds.`
    : `Too many attempts. Try again after ${retryAfter}.`;
}

function requestVoucherLookup(voucherCode: string) {
  const existingRequest = pendingLookups.get(voucherCode);

  if (existingRequest) {
    return existingRequest;
  }

  const request = fetch(
    `/api/coupons/lookup?code=${encodeURIComponent(voucherCode)}`,
  ).then(async (response): Promise<LookupRequestResult> => ({
    ok: response.ok,
    status: response.status,
    retryAfter: response.headers.get('Retry-After'),
    result: await response.json() as LookupApiResult,
  }));

  pendingLookups.set(voucherCode, request);
  void request.then(
    () => pendingLookups.delete(voucherCode),
    () => pendingLookups.delete(voucherCode),
  );
  return request;
}

function cacheApiError(
  couponCode: string,
  result: Extract<LookupApiResult, { success: false }>,
) {
  const outcomeByError: Record<string, VoucherOutcomeKind> = {
    COUPON_ALREADY_CLAIMED: 'CLAIMED',
    COUPON_NOT_FOUND: 'NOT_FOUND',
    COUPON_NOT_CLAIMABLE: 'NOT_CLAIMABLE',
  };
  const outcome = result.error ? outcomeByError[result.error] : undefined;

  if (outcome) {
    cacheVoucherOutcome(
      couponCode,
      outcome,
      result.message ?? 'This voucher cannot be claimed.',
    );
  }
}

function cacheCouponAliases(
  scannedCode: string,
  coupon: Coupon,
  kind: VoucherOutcomeKind,
  message: string,
) {
  const identifiers = new Set([
    scannedCode,
    coupon.couponCode,
    coupon.voucherQr,
    coupon.transactionId,
  ]);

  for (const identifier of identifiers) {
    if (identifier) {
      cacheVoucherOutcome(identifier.toUpperCase(), kind, message);
    }
  }
}

export default function CashcrowRewardPage() {
  const router = useRouter();

  const pageUrl = useSyncExternalStore(
    subscribeToPageUrl,
    getPageUrl,
    getServerPageUrl,
  );
  const couponCode = useMemo(() => couponCodeFromPageUrl(pageUrl), [pageUrl]);
  const cachedOutcome = useMemo(
    () => couponCode ? getCachedVoucherOutcome(couponCode) : null,
    [couponCode],
  );
  const [lookup, setLookup] = useState<LookupState>({ status: 'loading' });
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!couponCode || cachedOutcome) {
      return;
    }

    const voucherCode = couponCode;
    let cancelled = false;

    async function lookupVoucher() {
      try {
        const response = await requestVoucherLookup(voucherCode);

        if (cancelled) {
          return;
        }

        const { result } = response;

        if (response.status === 401) {
          setLookup({
            status: 'error',
            message: 'The configured Cashcrow claim credentials were rejected.',
          });
          return;
        }

        if (response.status === 429) {
          setLookup({
            status: 'error',
            message: rateLimitMessage(response.retryAfter),
          });
          return;
        }

        if (!result.success) {
          cacheApiError(voucherCode, result);
          setLookup({
            status: 'error',
            message: result.message ?? 'This voucher could not be verified.',
          });
          return;
        }

        if (!response.ok) {
          setLookup({
            status: 'error',
            message: 'This voucher could not be verified.',
          });
          return;
        }

        if (result.coupon.status === 'CLAIMED') {
          cacheCouponAliases(
            voucherCode,
            result.coupon,
            'CLAIMED',
            'This voucher has already been claimed. Scan another voucher.',
          );
          setLookup({
            status: 'error',
            message: 'This voucher has already been claimed. Scan another voucher.',
          });
          return;
        }

        if (result.coupon.status === 'EXPIRED') {
          cacheCouponAliases(
            voucherCode,
            result.coupon,
            'EXPIRED',
            'This voucher has expired. Scan another voucher.',
          );
          setLookup({
            status: 'error',
            message: 'This voucher has expired. Scan another voucher.',
          });
          return;
        }

        if (result.coupon.status === 'VOID') {
          cacheCouponAliases(
            voucherCode,
            result.coupon,
            'VOID',
            'This voucher has been voided and cannot be claimed. Scan another voucher.',
          );
          setLookup({
            status: 'error',
            message: 'This voucher has been voided and cannot be claimed. Scan another voucher.',
          });
          return;
        }

        setLookup({ status: 'ready', coupon: result.coupon });
      } catch {
        if (cancelled) {
          return;
        }

        setLookup({
          status: 'error',
          message: 'Unable to reach Cashcrow. Check your connection and scan again.',
        });
      }
    }

    void lookupVoucher();
    return () => {
      cancelled = true;
    };
  }, [couponCode, cachedOutcome]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const admission = admissionNumber.trim().toUpperCase();

    if (!/^AJC\d{2}[A-Z]{2}\d{3}$/.test(admission)) {
      setError('Invalid admission number. Example: AJC23CS054');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/coupons/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode }),
      });
      const result = await response.json() as
        | ClaimCouponResponse
        | { success: false; error?: string; message?: string };

      if (response.status === 401) {
        setError('The configured Cashcrow claim credentials were rejected.');
        return;
      }

      if (response.status === 429) {
        setError(rateLimitMessage(response.headers.get('Retry-After')));
        return;
      }

      if (!result.success) {
        if (couponCode) {
          cacheApiError(couponCode, result);
        }
        setError(result.message ?? 'The voucher could not be claimed. Please try again.');
        return;
      }

      if (!response.ok) {
        setError('The voucher could not be claimed. Please try again.');
        return;
      }

      if (couponCode) {
        cacheCouponAliases(
          couponCode,
          result.coupon,
          'CLAIMED',
          'This voucher has already been claimed. Scan another voucher.',
        );
      }

      sessionStorage.setItem(
        CLAIMED_COUPON_STORAGE_KEY,
        JSON.stringify({ ...result.coupon, admissionNumber: admission }),
      );
      router.push('/reward-success');
    } catch {
      setError('Unable to reach Cashcrow. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (pageUrl === undefined) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f8fbf6] text-[#007a52]">
        <LoaderCircle className="h-8 w-8 animate-spin" aria-label="Loading voucher" />
      </main>
    );
  }

  if (!couponCode) {
    return <QrScanner />;
  }

  if (cachedOutcome) {
    return <QrScanner message={cachedOutcome.message} />;
  }

  if (lookup.status === 'loading') {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f8fbf6] px-6 text-center text-[#0f2e24]">
        <Image
          src="/assets/Cashcrow_logo1.png"
          alt="Cashcrow"
          width={152}
          height={72}
          priority
          className="h-auto w-38"
        />
        <LoaderCircle className="h-8 w-8 animate-spin text-[#007a52]" aria-hidden="true" />
        <p className="font-bold">Checking your voucher…</p>
      </main>
    );
  }

  if (lookup.status === 'error') {
    return <QrScanner message={lookup.message} />;
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f3f7f0] px-4 py-6 font-sans text-[#0f2e24] sm:px-6">
      {/* Brush / paper texture */}
      {/* Light base background wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[#f8fbf6]"
      />

      {/* Left top oval (light green) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-15 top-20 z-0 h-44 w-18 -rotate-45 rounded-full bg-[#bdf354]/50 opacity-50"
      />

      {/* Left middle oval (faint pastel) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 top-1/3 z-0 h-36 w-20 -rotate-32 rounded-full bg-[#d8c7ff]/30 opacity-70"
      />

      {/* Right middle oval (lime green) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-[25%] z-0 h-48 w-18 rotate-35 rounded-full bg-[#bdf354]/60 opacity-50"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col">

        {/* Brand */}
        <header className="flex justify-center py-2">
          <Image
            src="/assets/Cashcrow_logo1.png"
            alt="Cashcrow"
            width={100}
            height={100}
            priority
            className="h-auto w-38 sm:w-42"
          />
        </header>

        {/* Hero */}
        <section
          aria-labelledby="page-title"
          className="mt-2 text-center sm:mt-4"
        >
          <h1
            id="page-title"
            className="text-[clamp(2.25rem,10vw,3.25rem)] font-black leading-[1.05] tracking-tight text-[#0f2e24]"
          >
            Good moves.
            <br />

            <span>Great </span>

            <span className="relative inline-block">
              {/* Hand-painted highlight */}
              <svg
                aria-hidden="true"
                className="absolute left-[-4%] top-[28%] z-0 h-[85%] w-[105%] -rotate-1"
                viewBox="0 0 300 70"
                preserveAspectRatio="none"
              >
                <path
                  d="M5 20 C25 13, 42 19, 62 16 C85 12, 105 19, 128 15 C150 12, 173 18, 195 14 C220 10, 245 17, 270 13 C282 11, 292 15, 298 18 L294 50 C270 55, 248 49, 225 53 C200 57, 178 50, 153 54 C128 58, 105 51, 82 55 C58 59, 35 52, 8 55 Z"
                  fill="#bdf354"
                />
              </svg>

              <span className="relative z-10">rewards.</span>

              {/* Exact 3-Burst Accent matching the image */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute -right-9 top-0 z-20 h-8 w-8 overflow-visible"
                viewBox="0 0 32 32"
                fill="none"
              >
                {/* Top Ray (slanted ~50 deg up-right) */}
                <path
                  d="M 6 12 L 20 3"
                  stroke="#bdf354"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Middle Ray (almost horizontal) */}
                <path
                  d="M 12 21 L 30 18"
                  stroke="#bdf354"
                  strokeWidth="4"
                  strokeLinecap="round"
                />

                {/* Bottom Ray (slanted down-right) */}
                <path
                  d="M 11 29 L 24 38"
                  stroke="#bdf354"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-1 max-w-xs text-base font-medium leading-relaxed text-[#2d4d42] sm:text-[17px]">
            You recycled. Now make it rewarding.
          </p>
        </section>

        {/* Illustration */}
        <div className="relative w-full max-w-xl mx-auto h-72 rounded-2xl p-6 overflow-hidden flex items-center justify-center font-sans select-none">

          {/* Background Soft Blobs */}
          <div className="absolute top-2 left-4 w-28 h-20 bg-[#e3f4d7] rounded-full filter blur-xl opacity-70" />
          <div className="absolute top-1/2 right-12 w-32 h-32 bg-[#e3f4d7] rounded-full filter blur-xl opacity-60" />
          <div className="absolute bottom-2 left-8 w-24 h-24 bg-[#eae1f8] rounded-full filter blur-xl opacity-60" />

          {/* Decorative Sparkles */}
          <div className="absolute top-6 left-36 text-[#a3e635]">
            <Sparkles className="w-7 h-7 fill-[#a3e635] stroke-none animate-pulse" />
          </div>
          <div className="absolute bottom-6 right-28 text-[#a3e635]">
            <Sparkles className="w-8 h-8 fill-[#a3e635] stroke-none animate-pulse" />
          </div>
          <div className="absolute bottom-20 right-16 text-[#065f46]">
            <Sparkles className="w-6 h-6 fill-[#065f46] stroke-none" />
          </div>

          {/* "NICE MOVE!" Sticker Badge (Fixed Top-Right) */}
          <div className="absolute top-4 right-4 z-30 rotate-6 transform">
            <div className="bg-[#ddd6fe] text-[#2e1065] px-4 py-2.5 rounded-2xl shadow-md border-2 border-[#c4b5fd] text-center font-black tracking-wider leading-none">
              <span className="block text-sm transform -rotate-1">NICE</span>
              <span className="block text-base tracking-widest mt-0.5">MOVE!</span>
              <div className="w-full h-1 bg-[#2e1065] rounded-full mt-1" />
            </div>
          </div>

          {/* Main Container */}
          <div className="relative w-full flex items-center justify-center">

            {/* Plastic Bottle (Left) */}
            <div className="relative -mr-10 z-0 flex items-center">
              {/* Action Marks around Bottle */}
              <div className="absolute left-0 top-6 flex flex-col space-y-1 rotate-180">
                <div className="w-3 h-1 bg-[#065f46] rounded-full -rotate-12" />
                <div className="w-4 h-1 bg-[#065f46] rounded-full" />
                <div className="w-3 h-1 bg-[#065f46] rounded-full rotate-12" />
              </div>

              {/* SVG Plastic Bottle Design */}
              <svg className="w-24 h-48 drop-shadow-sm opacity-90" viewBox="0 0 100 200">
                {/* Cap */}
                <rect x="35" y="10" width="30" height="18" rx="3" fill="#047857" />
                <rect x="32" y="28" width="36" height="4" fill="#065f46" />
                {/* Bottle Body */}
                <path
                  d="M38 32 C38 40 25 50 25 70 L25 160 C25 175 35 185 50 185 C65 185 75 175 75 160 L75 70 C75 50 62 40 62 32 Z"
                  fill="#a7f3d0"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
                {/* Highlights & Grooves */}
                <path d="M30 85 C45 92 55 92 70 85" stroke="#059669" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M28 115 C45 122 55 122 72 115" stroke="#059669" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M30 145 C45 152 55 152 70 145" stroke="#059669" strokeWidth="2" fill="none" opacity="0.6" />
                <path d="M32 55 Q30 100 35 165" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.7" fill="none" />
              </svg>
            </div>

            {/* Green Recycling Ticket (Center) */}
            <div className="relative z-10 -rotate-6 transform">
              {/* Ticket Body with True Mask Cutouts */}
              <div
                className="relative w-60 h-38 bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] rounded-2xl p-4 flex items-center justify-between"
                style={{
                  maskImage:
                    'radial-gradient(circle 14px at 0% 50%, transparent 99%, black 100%), radial-gradient(circle 14px at 100% 50%, transparent 99%, black 100%)',
                  WebkitMaskImage:
                    'radial-gradient(circle 14px at 0% 50%, transparent 99%, black 100%), radial-gradient(circle 14px at 100% 50%, transparent 99%, black 100%)',
                  maskComposite: 'intersect',
                  WebkitMaskComposite: 'source-in',
                }}
              >
                {/* Dotted Perforated Line */}
                <div className="absolute right-12 top-2 bottom-2 border-r-2 border-dashed border-[#065f46]/40" />

                {/* Recycle Symbol (Left Side of Ticket) */}
                <div className="flex-1 flex justify-center items-center">
                  <div className="p-3 bg-[#a3e635] rounded-full shadow-inner">
                    <RefreshCw className="w-8 h-8 text-[#047857] stroke-[2.5]" />
                  </div>
                </div>

                {/* Cute Character Face (Center of Ticket) */}
                <div className="flex-1 flex flex-col items-center justify-center pr-8 space-y-1">
                  <div className="flex space-x-4 items-center">
                    {/* Left Cheek */}
                    <div className="w-3 h-1.5 bg-[#bef264] rounded-full" />
                    {/* Eyes */}
                    <div className="flex space-x-3">
                      <div className="w-3 h-3 border-t-3 border-r-3 border-[#022c22] rounded-tr-full transform -rotate-45" />
                      <div className="w-3 h-3 border-t-3 border-r-3 border-[#022c22] rounded-tr-full transform -rotate-45" />
                    </div>
                    {/* Right Cheek */}
                    <div className="w-3 h-1.5 bg-[#bef264] rounded-full" />
                  </div>
                  {/* Smile */}
                  <div className="w-4 h-2 border-b-3 border-[#022c22] rounded-b-full" />
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Reward form */}
        <section
          aria-labelledby="reward-heading"
          className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6"
        >
          <p className="text-xs font-black uppercase tracking-wider text-[#007a52]">
            One last step
          </p>

          <h2
            id="reward-heading"
            className="mt-0.5 text-2xl font-black text-[#0f2e24] sm:text-3xl"
          >
            Make it yours
          </h2>

          <p className="mb-5 mt-1 text-sm font-medium leading-relaxed text-[#527063]">
            Voucher <span className="font-bold text-[#0f2e24]">{lookup.coupon.couponCode}</span> is ready. Enter your admission number to continue.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="admission"
                className="text-sm font-extrabold text-[#0f2e24]"
              >
                Admission number
              </label>

              {/* Input + Error */}
              <div className="flex flex-col">
                <div className="relative flex items-center">
                  {/* Admission icon */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 text-[#0f2e24]"
                  >
                    <GraduationCap className="h-5 w-5" />
                  </div>

                  {/* Divider */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-10 text-gray-300"
                  >
                    |
                  </div>

                  {/* Input */}
                  <input
                    id="admission"
                    name="admissionNumber"
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCapitalize="characters"
                    placeholder="e.g. AJC23CS054"
                    value={admissionNumber}
                    onChange={(event) => {
                      setAdmissionNumber(event.target.value.toUpperCase());

                      // Remove error while typing
                      if (error) {
                        setError('');
                      }
                    }}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'admission-error' : undefined}
                    className={`w-full rounded-xl border bg-[#f8faf6] py-3.5 pl-14 pr-4 text-base font-semibold uppercase tracking-wide text-[#0f2e24] outline-none transition-colors placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-400 ${error
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#0b4d36] focus:ring-[#0b4d36]'
                      } focus:ring-1`}
                    required
                    minLength={10}
                    maxLength={10}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Error message BELOW input */}
                {error && (
                  <p
                    id="admission-error"
                    role="alert"
                    className="mt-1.5 text-sm font-semibold text-red-600"
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#003f2b] bg-[#007a52] px-4 py-3.5 text-lg font-black text-white shadow-[0_4px_0_0_#063324] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:translate-y-1 active:shadow-none disabled:cursor-wait disabled:opacity-70 disabled:shadow-none"
            >
              <span>{isSubmitting ? 'Claiming reward…' : 'Claim my reward'}</span>

              {isSubmitting ? (
                <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5"
                  strokeWidth={3}
                />
              )}
            </button>
          </form>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-8 flex items-center justify-center gap-2 pb-1 text-sm font-semibold text-[#3b5e50]">
        <Leaf
          aria-hidden="true"
          className="text-[#0b4d36]"
        />

        <span>Small actions. Real impact.</span>
      </footer>
    </main>
  );
}
