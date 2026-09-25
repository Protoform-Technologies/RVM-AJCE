import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, CircleAlert, QrCode } from "lucide-react";
import type { ReactNode } from "react";

type VoucherNoticeProps = {
  eyebrow: string;
  icon: ReactNode;
  message: string;
  title: string;
};

function VoucherNotice({ eyebrow, icon, message, title }: VoucherNoticeProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#f8fbf6] px-4 py-8 font-sans text-[#0f2e24]">
      <div aria-hidden="true" className="absolute -left-14 top-28 h-44 w-20 -rotate-45 rounded-full bg-[#bdf354]/35" />
      <div aria-hidden="true" className="absolute -right-12 bottom-24 h-48 w-20 rotate-35 rounded-full bg-[#d8c7ff]/35" />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-notice-title"
        aria-describedby="voucher-notice-message"
        className="relative z-10 w-full max-w-sm rounded-[2rem] border border-black/5 bg-white p-6 text-center shadow-xl sm:p-8"
      >
        <Image
          src="/assets/Cashcrow_logo1.png"
          alt="Cashcrow"
          width={152}
          height={72}
          priority
          className="mx-auto h-auto w-36"
        />

        <div className="mx-auto mt-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#e7f8dd] text-[#007a52]">
          {icon}
        </div>

        <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#007a52]">
          {eyebrow}
        </p>
        <h1 id="voucher-notice-title" className="mt-2 text-3xl font-black tracking-tight">
          {title}
        </h1>
        <p id="voucher-notice-message" role="alert" className="mt-3 text-sm font-medium leading-relaxed text-[#527063]">
          {message}
        </p>

        <Link
          href="/"
          className="mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#003f2b] bg-[#007a52] px-4 py-3 font-black text-white shadow-[0_4px_0_0_#063324] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:translate-y-1 active:shadow-none"
        >
          <QrCode aria-hidden="true" className="h-5 w-5" />
          Scan a different voucher
        </Link>
      </section>
    </main>
  );
}

export function VoucherClaimedNotice({ message }: { message?: string }) {
  return (
    <VoucherNotice
      eyebrow="Redemption status"
      icon={<BadgeCheck aria-hidden="true" className="h-11 w-11" strokeWidth={2.4} />}
      message={message ?? "This voucher has already been redeemed and cannot be used again."}
      title="Voucher already claimed"
    />
  );
}

export function VoucherErrorNotice({
  message,
  title = "Voucher unavailable",
}: {
  message: string;
  title?: string;
}) {
  return (
    <VoucherNotice
      eyebrow="Voucher status"
      icon={<CircleAlert aria-hidden="true" className="h-11 w-11" strokeWidth={2.4} />}
      message={message}
      title={title}
    />
  );
}
