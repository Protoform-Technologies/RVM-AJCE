'use client';

import React, { useState } from 'react';
import { ArrowRight, Leaf, RefreshCw, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Academic cap icon
const GraduationCapIcon = ({
  className = 'h-5 w-5',
}: {
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
  </svg>
);

// Recycling icon
const RecycleIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.91 1.81 1.81 0 0 1-.05-1.81l.1-.17c.23-.42.5-.82.8-1.2l2.36-2.91" />
    <path d="M11 19h8.2a1.8 1.8 0 0 0 1.58-.9 1.83 1.83 0 0 0 .04-1.82l-.1-.18a12.63 12.63 0 0 0-.82-1.21l-2.35-2.89" />
    <path d="M20 9V6.8a1.8 1.8 0 0 0-.9-1.58 1.83 1.83 0 0 0-1.82-.04l-.18.1a12.63 12.63 0 0 0-1.21.82l-2.89 2.35" />
    <path d="M16 19l2 3 2-3" />
    <path d="M4 11l-3 2 3 2" />
    <path d="M11 4L9 1l2-1" />
  </svg>
);

export default function CashcrowRewardPage() {
  const router = useRouter();

  const [admissionNumber, setAdmissionNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const admission = admissionNumber.trim().toUpperCase();

    // Format: AJC23CS054
    // AJC + 2 digits + 2 letters + 3 digits
    const admissionRegex = /^AJC\d{2}[A-Z]{2}\d{3}$/;

    if (!admissionRegex.test(admission)) {
      setError('Invalid admission number. Example: AJC23CS054');
      return;
    }

    setError('');

    router.push('/reward-success');
  };

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
            Enter your admission number to claim your coupon.
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
                  {/* Graduation icon */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 text-[#0f2e24]"
                  >
                    <GraduationCapIcon className="h-5 w-5" />
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
                  />
                </div>

                {/* Error message BELOW input */}
                {error && (
                  <p
                    id="admission-error"
                    className="mt-1.5 text-sm font-semibold text-red-600"
                  >
                    {error}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#003f2b] bg-[#007a52] px-4 py-3.5 text-lg font-black text-white shadow-[0_4px_0_0_#063324] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:translate-y-1 active:shadow-none"
            >
              <span>Claim my reward</span>

              <ArrowRight
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={3}
              />
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