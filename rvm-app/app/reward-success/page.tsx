"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Check,
    ReceiptIndianRupee,
    LoaderCircle,
    Pencil,
    Ticket,
} from "lucide-react";

import {
    CLAIMED_COUPON_STORAGE_KEY,
    type ClaimedCoupon,
} from "@/lib/coupon";

const subscribeToSessionStorage = () => () => {};
const getStoredCoupon = () =>
    sessionStorage.getItem(CLAIMED_COUPON_STORAGE_KEY);
const getServerStoredCoupon = () => undefined;

function parseClaimedCoupon(storedCoupon: string | null | undefined) {
    if (!storedCoupon) {
        return null;
    }

    try {
        const parsedCoupon = JSON.parse(storedCoupon) as ClaimedCoupon;

        if (
            parsedCoupon.status !== "CLAIMED" ||
            typeof parsedCoupon.couponCode !== "string" ||
            typeof parsedCoupon.amount !== "number" ||
            typeof parsedCoupon.admissionNumber !== "string"
        ) {
            return null;
        }

        return parsedCoupon;
    } catch {
        return null;
    }
}

export default function RewardSuccessPage() {
    const router = useRouter();
    const storedCoupon = useSyncExternalStore(
        subscribeToSessionStorage,
        getStoredCoupon,
        getServerStoredCoupon,
    );
    const coupon = useMemo(
        () => parseClaimedCoupon(storedCoupon),
        [storedCoupon],
    );

    if (storedCoupon === undefined) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-[#f7f9f3] text-[#007a52]">
                <LoaderCircle className="h-8 w-8 animate-spin" aria-label="Loading claimed voucher" />
            </main>
        );
    }

    if (!coupon) {
        return (
            <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[#f7f9f3] px-6 text-center text-[#082e21]">
                <Ticket className="h-10 w-10 text-[#007a52]" aria-hidden="true" />
                <h1 className="text-2xl font-black">No claimed voucher to show</h1>
                <button
                    type="button"
                    onClick={() => router.replace("/")}
                    className="rounded-xl bg-[#007a52] px-5 py-3 font-bold text-white"
                >
                    Enter a voucher
                </button>
            </main>
        );
    }

    const claimedAt = coupon.claimedAt ? new Date(coupon.claimedAt) : null;
    const formattedClaimedAt = claimedAt && !Number.isNaN(claimedAt.getTime())
        ? new Intl.DateTimeFormat("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "UTC",
        }).format(claimedAt)
        : "Just now";

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
                    <div className="relative w-full max-w-sm mx-auto h-36 rounded-xl p-4 overflow-hidden flex items-center justify-center font-sans select-none bg-[#faf9f5]">

                        {/* Background Soft Blobs */}
                        <div className="absolute top-1 left-2 w-20 h-14 bg-[#e3f4d7] rounded-full filter blur-lg opacity-70" />
                        <div className="absolute top-1/2 right-8 w-20 h-20 bg-[#eae1f8] rounded-full filter blur-lg opacity-60" />

                        {/* Main Illustration Container */}
                        <div className="relative flex items-center justify-center">

                            {/* Confetti / Burst Pills */}
                            <div className="absolute -top-6 -left-6 w-1.5 h-4 bg-[#ccfbf1] rounded-full -rotate-45" />
                            <div className="absolute -top-7 left-2 w-1.5 h-4 bg-[#bef264] rounded-full rotate-12" />
                            <div className="absolute -top-4 right-0 w-1.5 h-4 bg-[#ddd6fe] rounded-full rotate-45" />
                            <div className="absolute top-5 -left-8 w-1.5 h-4 bg-[#ddd6fe] rounded-full rotate-45" />
                            <div className="absolute -bottom-6 -left-3 w-1.5 h-4 bg-[#bef264] rounded-full rotate-45" />
                            <div className="absolute -bottom-7 right-4 w-1.5 h-4 bg-[#bef264] rounded-full -rotate-12" />
                            <div className="absolute bottom-1 right-[-1.5rem] w-1.5 h-4 bg-[#ddd6fe] rounded-full rotate-45" />

                            {/* Raised Arm (Left) */}
                            <div className="absolute -left-5 top-0 z-0">
                                <svg className="w-7 h-8 text-[#064e3b]" viewBox="0 0 50 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M 40 45 C 15 45, 10 25, 15 15" />
                                    <circle cx="15" cy="12" r="6" fill="#064e3b" stroke="none" />
                                </svg>
                            </div>

                            {/* Raised Arm (Right) */}
                            <div className="absolute -right-4 -top-3 z-0">
                                <svg className="w-7 h-8 text-[#064e3b]" viewBox="0 0 50 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M 10 45 C 35 45, 40 25, 35 15" />
                                    <circle cx="35" cy="12" r="6" fill="#064e3b" stroke="none" />
                                </svg>
                            </div>

                            {/* Scaled Down Character Ticket Body */}
                            <div
                                className="relative w-24 h-16 bg-gradient-to-br from-[#10b981] via-[#059669] to-[#047857] rounded-lg p-2 flex flex-col items-center justify-center -rotate-6 shadow-sm z-10"
                                style={{
                                    maskImage:
                                        'radial-gradient(circle 6px at 0% 50%, transparent 99%, black 100%), radial-gradient(circle 6px at 100% 50%, transparent 99%, black 100%)',
                                    WebkitMaskImage:
                                        'radial-gradient(circle 6px at 0% 50%, transparent 99%, black 100%), radial-gradient(circle 6px at 100% 50%, transparent 99%, black 100%)',
                                    maskComposite: 'intersect',
                                    WebkitMaskComposite: 'source-in',
                                }}
                            >
                                {/* Eyes */}
                                <div className="flex space-x-2.5 mb-0.5">
                                    <div className="w-2.5 h-2 border-t-2 border-r-2 border-[#022c22] rounded-tr-full transform -rotate-45" />
                                    <div className="w-2.5 h-2 border-t-2 border-r-2 border-[#022c22] rounded-tr-full transform -rotate-45" />
                                </div>

                                {/* Open Happy Mouth */}
                                <div className="w-4 h-2.5 bg-[#022c22] rounded-b-full overflow-hidden relative flex justify-center">
                                    <div className="absolute bottom-0 w-2.5 h-1.5 bg-[#c084fc] rounded-t-full" />
                                </div>
                            </div>

                            {/* Green Checkmark Circle (Bottom Right) */}
                            <div className="absolute -bottom-2 -right-2 z-20 bg-[#bef264] p-1 rounded-full shadow-md border-2 border-[#faf9f5]">
                                <Check className="w-4 h-4 text-[#022c22] stroke-[3.5]" />
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

                    {/* Admission number or employee ID */}
                    <p className="mt-3 rounded-full border border-[#a2cfb7] bg-[#e8f3e5] px-4 py-1.5 text-xs font-bold text-[#082e21]">
                        Admission / Employee ID: {coupon.admissionNumber}
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
                                    Cashcrow RVM voucher
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
                                ₹{coupon.amount.toLocaleString("en-IN")}
                            </p>

                            <h2
                                id="reward-title"
                                className="mt-2 text-lg font-black tracking-tight text-[#082e21] sm:text-md"
                            >
                                Discount confirmed
                            </h2>
                        </div>

                        {/* Collection Details */}
                        <div className="mt-6 rounded-2xl border border-[#ded5f8] bg-[#f2eefc] p-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e3d7fa] text-[#5c37ad]">
                                    <ReceiptIndianRupee
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs font-medium leading-relaxed text-[#555c57]">
                                        Apply this amount as the discount for the
                                        customer&apos;s current purchase.
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
                                {coupon.couponCode}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#89918b]">
                                Claimed
                            </p>

                            <time
                                dateTime={coupon.claimedAt ?? undefined}
                                className="mt-0.5 block text-[11px] font-bold text-[#4f5953]"
                            >
                                {formattedClaimedAt} UTC
                            </time>
                        </div>
                    </footer>
                </article>

                {/* Secondary Navigation */}
                <nav
                    aria-label="Secondary actions"
                    className="mb-2 mt-6 flex w-full flex-col items-center gap-4"
                >
                    <a
                        href="https://forms.gle/bT28PE7tpB6dhCATA"
                        className="flex min-h-12 w-full items-center justify-center rounded-2xl border-2 border-[#003f2b] bg-[#007a52] px-4 py-3.5 text-lg font-black text-white shadow-[0_4px_0_0_#063324] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:translate-y-1 active:shadow-none"
                    >
                        Share feedback
                    </a>

                    <button
                        type="button"
                        onClick={() => {
                            sessionStorage.removeItem(CLAIMED_COUPON_STORAGE_KEY);
                            router.push("/");
                        }}
                        className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-[#007a52]/20 bg-[#007a52]/5 px-4 py-2 text-xs font-bold text-[#007a52] shadow-sm transition-all duration-200 hover:border-[#007a52]/40 hover:bg-[#007a52]/10 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                        <Pencil
                            className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-rotate-6"
                            aria-hidden="true"
                        />

                        <span>Claim another voucher</span>
                    </button>
                </nav>
            </main>
        </div>
    );
}
