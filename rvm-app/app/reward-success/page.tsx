"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    ExternalLink,
    Link as LinkIcon,
    MessageSquare,
    Pencil,
    Ticket,
} from "lucide-react";

export default function RewardSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-dvh bg-[#f7f9f3] px-4 py-5 font-sans text-[#082e21] antialiased sm:px-6 sm:py-8">
            <main className="mx-auto flex w-full max-w-md flex-col items-center">
                {/* Brand Header */}
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

                {/* Success Hero */}
                <section
                    aria-labelledby="reward-success-heading"
                    className="mt-2 flex w-full flex-col items-center text-center"
                >
                    {/* Celebration illustration */}
                    <div className="relative flex h-36 w-48 items-center justify-center">
                        {/* --- CONFETTI / BURST PILLS --- */}
                        <span className="absolute left-7 top-3 h-4.5 w-2 rotate-[-25deg] rounded-full bg-[#bdf354]" />
                        <span className="absolute left-1 top-10 h-4.5 w-2 rotate-[-65deg] rounded-full bg-[#c28aff]" />
                        <span className="absolute left-20 top-1 h-5 w-2 rotate-[10deg] rounded-full bg-[#bdf354]" />
                        <span className="absolute right-9 top-3 h-5 w-2 rotate-[45deg] rounded-full bg-[#c28aff]" />
                        <span className="absolute right-1 top-14 h-2 w-4.5 rotate-[-10deg] rounded-full bg-[#bdf354]" />
                        <span className="absolute bottom-4 right-7 h-4.5 w-2 rotate-[-35deg] rounded-full bg-[#c28aff]" />
                        <span className="absolute bottom-2 left-12 h-4.5 w-2 rotate-[35deg] rounded-full bg-[#bdf354]" />

                        {/* --- MASCOT CONTAINER --- */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute -left-4 -top-3 flex flex-col items-center">
                                <div className="h-3 w-3 rounded-full border-[1.5px] border-[#052e16] bg-[#052e16]" />
                                <div className="h-6 w-4 -translate-y-0.5 rounded-bl-full border-b-[3px] border-l-[3px] border-[#052e16]" />
                            </div>

                            <div className="absolute -right-4 -top-6 flex flex-col items-center">
                                <div className="h-3 w-3 rounded-full border-[1.5px] border-[#052e16] bg-[#052e16]" />
                                <div className="h-7 w-4 -translate-y-0.5 rounded-br-full border-b-[3px] border-r-[3px] border-[#052e16]" />
                            </div>

                            <div className="relative z-10 flex h-18 w-28 rotate-[-6deg] items-center justify-center rounded-xl border-2 border-[#052e16] bg-[#0f9f59] shadow-sm">
                                <span className="absolute -left-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-r-2 border-[#052e16] bg-[#f8fbf6]" />
                                <span className="absolute -left-1.5 bottom-1.5 h-2.5 w-2.5 rounded-full border-r-2 border-[#052e16] bg-[#f8fbf6]" />
                                <span className="absolute -right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-l-2 border-[#052e16] bg-[#f8fbf6]" />
                                <span className="absolute -right-1.5 bottom-1.5 h-2.5 w-2.5 rounded-full border-l-2 border-[#052e16] bg-[#f8fbf6]" />

                                <div className="flex flex-col items-center gap-1 pb-0.5">
                                    <div className="flex gap-3">
                                        <span className="h-2 w-3.5 rounded-t-full border-t-[2.5px] border-x-[2.5px] border-[#052e16]" />
                                        <span className="h-2 w-3.5 rounded-t-full border-t-[2.5px] border-x-[2.5px] border-[#052e16]" />
                                    </div>

                                    <div className="relative flex h-4 w-6 items-end justify-center overflow-hidden rounded-b-full border-2 border-[#052e16] bg-[#052e16]">
                                        <span className="absolute -bottom-0.5 h-2 w-4 rounded-t-full bg-[#f472b6]" />
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-2 -right-2 z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#052e16] bg-[#bdf354] shadow-sm">
                                <svg
                                    className="h-5 w-5 text-[#052e16]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3.5}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="relative inline-block">
                        <h1
                            id="reward-success-heading"
                            className="relative z-10 text-[clamp(2rem,9vw,2.75rem)] font-black leading-none tracking-tight"
                        >
                            You nailed it!
                        </h1>

                        <span
                            aria-hidden="true"
                            className="absolute bottom-0.5 left-1/2 h-2.5 w-[85%] -translate-x-1/2 rounded-full bg-[#bdf354]"
                        />
                    </div>

                    <p className="mt-1 max-w-xs text-sm font-semibold leading-relaxed text-[#082e21]/75 sm:text-base">
                        Coupon claimed. Reward unlocked.
                    </p>

                    {/* Student ID */}
                    <p className="mt-3 rounded-full border border-[#a2cfb7] bg-[#e8f3e5] px-4 py-1.5 text-xs font-bold text-[#082e21]">
                        Student ID: ADM-2024-8891
                    </p>
                </section>

                {/* Reward Ticket */}
                <article
                    aria-labelledby="reward-title"
                    className="relative mt-6 w-full overflow-hidden rounded-[1.75rem] border-2 border-[#003f2b] bg-[#fffef9] shadow-[0_6px_0_0_#063324]"
                >
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-1.5 bg-[#bdf354]"
                    />

                    {/* Ticket Header */}
                    <header className="relative bg-[#004d33] px-4 py-3.5 text-white sm:px-5">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <Ticket
                                    className="h-4 w-4 shrink-0 text-[#bdf354]"
                                    strokeWidth={2.5}
                                    aria-hidden="true"
                                />

                                <span className="truncate text-[10px] font-extrabold uppercase tracking-[0.14em] sm:text-xs">
                                    Your campus reward
                                </span>
                            </div>

                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.08em] sm:text-[10px]">
                                <span
                                    aria-hidden="true"
                                    className="h-1.5 w-1.5 rounded-full bg-[#bdf354] shadow-[0_0_6px_rgba(189,243,84,0.7)]"
                                />
                                Claimed
                            </span>
                        </div>

                        <div
                            aria-hidden="true"
                            className="absolute -bottom-px left-0 right-0 flex h-2 translate-y-1/2 items-center justify-between overflow-hidden"
                        >
                            {Array.from({ length: 24 }).map((_, index) => (
                                <span
                                    key={index}
                                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#fffef9]"
                                />
                            ))}
                        </div>
                    </header>

                    {/* Ticket Main Content */}
                    <div className="relative px-5 pb-5 pt-6 sm:px-6">
                        <div className="text-center">
                            <p className="font-manrope text-[clamp(3.5rem,17vw,4.5rem)] font-black leading-[0.9] tracking-[-0.05em] text-[#082e21]">
                                ₹20
                            </p>

                            <h2
                                id="reward-title"
                                className="mt-2 text-lg font-black tracking-tight text-[#082e21] sm:text-xl"
                            >
                                Campus voucher
                            </h2>
                        </div>

                        {/* Collection Details */}
                        <div className="mt-6 rounded-2xl border border-[#ded5f8] bg-[#f2eefc] p-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e3d7fa] text-[#5c37ad]">
                                    <LinkIcon
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium leading-relaxed text-[#555c57]">
                                        Visit{" "}
                                        <span className="px-0.5 text-sm font-extrabold text-[#082e21]">
                                            AES
                                        </span>{" "}
                                        to collect your reward.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Perforated Divider */}
                    <div
                        aria-hidden="true"
                        className="relative flex items-center px-5"
                    >
                        <span className="absolute -left-3.5 h-7 w-7 rounded-full border-r-2 border-[#003f2b] bg-[#f7f9f3]" />
                        <div className="w-full border-t-2 border-dashed border-[#cbd4cc]" />
                        <span className="absolute -right-3.5 h-7 w-7 rounded-full border-l-2 border-[#003f2b] bg-[#f7f9f3]" />
                    </div>

                    {/* Ticket Stub */}
                    <footer className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#89918b]">
                                Ticket ID
                            </p>

                            <p className="mt-0.5 font-mono text-[11px] font-bold tracking-wide text-[#39443e]">
                                CC-20-AES-8891
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#89918b]">
                                Claimed
                            </p>

                            <time
                                dateTime="2026-09-21T18:50:00Z"
                                className="mt-0.5 block text-[11px] font-bold text-[#4f5953]"
                            >
                                21 Sep 2026 · 18:50 UTC
                            </time>
                        </div>
                    </footer>
                </article>

                {/* Feedback */}
                <section
                    aria-labelledby="feedback-heading"
                    className="mt-6 w-full text-center"
                >
                    <h2
                        id="feedback-heading"
                        className="text-xs font-bold text-[#082e21]/80 sm:text-sm"
                    >
                        Help make the next good move better.
                    </h2>

                    <a
                        href="https://forms.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Share feedback (opens Google Forms in a new tab)"
                        className="mt-2.5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#003f2b] bg-[#007a52] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_0_0_#063324] transition-all hover:bg-[#006644] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:translate-y-1 active:shadow-none sm:text-base"
                    >
                        <MessageSquare
                            className="h-5 w-5"
                            aria-hidden="true"
                        />

                        <span>Share feedback</span>

                        <ExternalLink
                            className="ml-0.5 h-4 w-4"
                            strokeWidth={2.5}
                            aria-hidden="true"
                        />
                    </a>
                </section>

                {/* Secondary Navigation */}
                <nav
                    aria-label="Secondary actions"
                    className="mb-2 mt-5 flex w-full justify-center"
                >
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-[#007a52]/20 bg-[#007a52]/5 px-4 py-2 text-xs font-bold text-[#007a52] shadow-sm transition-all duration-200 hover:border-[#007a52]/40 hover:bg-[#007a52]/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                        <Pencil
                            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-6"
                            aria-hidden="true"
                        />

                        <span>Edit admission number</span>
                    </button>
                </nav>
            </main>
        </div>
    );
}