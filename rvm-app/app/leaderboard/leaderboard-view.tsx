"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  CircleGauge,
  Coins,
  CupSoda,
  Leaf,
  LoaderCircle,
  Medal,
  PackageCheck,
  RefreshCw,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import type {
  LeaderboardApiResponse,
  LeaderboardData,
  LeaderboardEntry,
} from "@/lib/leaderboard";

type PageState =
  | { status: "loading" }
  | { status: "ready"; data: LeaderboardData }
  | { status: "error"; message: string };

const integerFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});
const decimalFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function rankStyle(rank: number) {
  if (rank === 1) {
    return {
      icon: Trophy,
      label: "1st",
      badge: "border-[#efc653] bg-[#fff1aa] text-[#5a4000]",
      row: "border-[#e9c54d]/60 bg-[#fff9df]",
    };
  }

  if (rank === 2) {
    return {
      icon: Medal,
      label: "2nd",
      badge: "border-[#b9c4c8] bg-[#edf1f2] text-[#3c5058]",
      row: "border-[#cad3d6] bg-[#f5f7f7]",
    };
  }

  if (rank === 3) {
    return {
      icon: Award,
      label: "3rd",
      badge: "border-[#d99e68] bg-[#f6d5b5] text-[#613415]",
      row: "border-[#dfb28b] bg-[#fff5eb]",
    };
  }

  return {
    icon: null,
    label: `#${rank}`,
    badge: "border-[#cddbd3] bg-white text-[#315348]",
    row: "border-[#dde7e0] bg-white",
  };
}

function RankBadge({ rank }: { rank: number }) {
  const style = rankStyle(rank);
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-xl border px-2 text-sm font-black ${style.badge}`}
      aria-label={`Rank ${rank}`}
    >
      {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
      {style.label}
    </span>
  );
}

function MaterialPill({
  label,
  items,
  variant,
}: {
  label: string;
  items: number;
  variant: "plastic" | "aluminium";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold ${variant === "plastic"
        ? "bg-[#e8f5df] text-[#28621d]"
        : "bg-[#eeeaf8] text-[#5b4584]"
        }`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {integerFormatter.format(items)} {label}
    </span>
  );
}

function PodiumPlace({ entry }: { entry: LeaderboardEntry }) {
  const podiumStyle = {
    1: {
      Icon: Trophy,
      place: "1st place",
      numeral: "1",
      shell: "w-[7.4rem] sm:w-[11rem]",
      card:
        "border-[#f7da74] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(242,247,244,0.95)_100%)] shadow-[0_18px_36px_rgba(7,63,48,0.18)]",
      cardGlow: "from-white/90 to-transparent",
      medal: "border-[#f0d988] bg-[linear-gradient(180deg,#fff7d8_0%,#efd47a_100%)] text-[#7b5c08] shadow-[0_10px_24px_rgba(217,183,83,0.28)]",
      score: "bg-[#073f30] text-white",
      scoreIcon: "text-[#bdf354]",
      meta: "text-[#637a71]",
      chip: "border-[#d9c171] bg-[#fff6d9] text-[#775b06]",
      base: "border-[#d8b35a] bg-[linear-gradient(180deg,#f8e2a2_0%,#ddb458_52%,#b88c31_100%)]",
      baseShadow: "bg-[#d0a64a]/35",
      baseHighlight: "from-white/45 to-transparent",
      number: "text-[3.7rem] sm:text-[5.4rem] text-[#fffdf5]",
      height: "h-24 sm:h-36",
      offset: "sm:-translate-y-2",
    },
    2: {
      Icon: Medal,
      place: "2nd place",
      numeral: "2",
      shell: "w-[6.5rem] sm:w-[9.4rem]",
      card:
        "border-[#d8dde1] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(241,245,248,0.96)_100%)] shadow-[0_14px_28px_rgba(104,122,133,0.16)]",
      cardGlow: "from-white/85 to-transparent",
      medal: "border-[#cfd6dd] bg-[linear-gradient(180deg,#ffffff_0%,#dfe5eb_100%)] text-[#5d6e79] shadow-[0_8px_18px_rgba(159,174,184,0.22)]",
      score: "bg-[#5e6972] text-white",
      scoreIcon: "text-[#eef4f8]",
      meta: "text-[#708087]",
      chip: "border-[#cfd7dd] bg-[#f2f5f8] text-[#52626d]",
      base: "border-[#c8d0d6] bg-[linear-gradient(180deg,#eff3f6_0%,#c7cfd6_52%,#9ca9b3_100%)]",
      baseShadow: "bg-[#adb8c1]/30",
      baseHighlight: "from-white/50 to-transparent",
      number: "text-[2.8rem] sm:text-[4.2rem] text-white",
      height: "h-20 sm:h-28",
      offset: "",
    },
    3: {
      Icon: Award,
      place: "3rd place",
      numeral: "3",
      shell: "w-[6.3rem] sm:w-[9rem]",
      card:
        "border-[#dfc2a8] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(252,244,238,0.96)_100%)] shadow-[0_14px_28px_rgba(147,101,65,0.14)]",
      cardGlow: "from-white/85 to-transparent",
      medal: "border-[#ddb38f] bg-[linear-gradient(180deg,#fff0e3_0%,#dfb08a_100%)] text-[#7e4b2c] shadow-[0_8px_18px_rgba(182,121,81,0.22)]",
      score: "bg-[#7d5a47] text-white",
      scoreIcon: "text-[#ffe1cd]",
      meta: "text-[#7e6e65]",
      chip: "border-[#e1c1a6] bg-[#fff1e5] text-[#7d4d2c]",
      base: "border-[#d0a07a] bg-[linear-gradient(180deg,#efc7aa_0%,#cb9165_52%,#9f613a_100%)]",
      baseShadow: "bg-[#c48c67]/28",
      baseHighlight: "from-white/42 to-transparent",
      number: "text-[2.6rem] sm:text-[3.9rem] text-[#fffaf7]",
      height: "h-16 sm:h-24",
      offset: "",
    },
  }[entry.rank as 1 | 2 | 3];

  const Icon = podiumStyle.Icon;

  return (
    <article className={`flex min-w-0 flex-col items-center justify-end text-center ${podiumStyle.offset}`}>
      <div className={`relative z-10 ${podiumStyle.shell}`}>
        <div className={`relative overflow-hidden rounded-[1.45rem] border px-3 py-3 backdrop-blur-sm sm:px-4 sm:py-4 ${podiumStyle.card}`}>
          <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-12 bg-gradient-to-b ${podiumStyle.cardGlow}`} />

          <div className="relative flex flex-col items-center">
            <span className={`flex h-11 w-11 items-center justify-center rounded-full border-2 sm:h-12 sm:w-12 ${podiumStyle.medal}`}>
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>

            <p className="mt-2 max-w-full truncate text-sm font-black text-[#17352c] sm:text-lg">
              {entry.admission_number}
            </p>

            <div className="mt-2 flex w-full min-w-0 flex-col items-center rounded-xl border border-[#dce9df] bg-[#f2f9f4] px-1 py-1.5">
              <span className="text-[8px] font-extrabold uppercase tracking-wide text-[#637a71] sm:text-[10px]">
                Money earned
              </span>
              <span className="max-w-full text-center text-sm font-black tabular-nums tracking-tight text-[#007a52] sm:text-xl">
                {currencyFormatter.format(entry.amount_earned)}
              </span>
            </div>

            <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black shadow-sm sm:text-sm ${podiumStyle.score}`}>
              <Trophy className={`h-3.5 w-3.5 ${podiumStyle.scoreIcon}`} aria-hidden="true" />
              {integerFormatter.format(entry.eco_credits)}
            </div>

            <p className={`mt-2 text-[9px] font-bold sm:text-[11px] ${podiumStyle.meta}`}>
              {integerFormatter.format(entry.items_recycled)} items <br /> {decimalFormatter.format(entry.co2e_kg)} kg CO₂e
            </p>
          </div>
        </div>

        <div className="relative z-20 mx-auto -mt-3 w-fit">
          <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] shadow-md sm:text-[11px] ${podiumStyle.chip}`}>
            {podiumStyle.place}
          </span>
        </div>
      </div>

      <div className={`relative -mt-2 ${podiumStyle.shell}`}>
        <div aria-hidden="true" className={`absolute inset-x-4 -bottom-3 h-6 rounded-full blur-xl ${podiumStyle.baseShadow}`} />
        <div className={`relative overflow-hidden rounded-t-[1.35rem] border border-b-0 ${podiumStyle.height} ${podiumStyle.base}`}>
          <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b ${podiumStyle.baseHighlight}`} />
          <span aria-hidden="true" className="absolute inset-y-0 left-[28%] w-px bg-white/18" />
          <span aria-hidden="true" className="absolute inset-y-0 right-[28%] w-px bg-black/8" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`font-black italic leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)] ${podiumStyle.number}`}>
              {podiumStyle.numeral}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const orderedEntries = [2, 1, 3]
    .map((rank) => entries.find((entry) => entry.rank === rank))
    .filter((entry): entry is LeaderboardEntry => !!entry);

  if (orderedEntries.length === 0) {
    return null;
  }

  return (
    <section
      className="relative mt-7 overflow-hidden rounded-[2rem] backdrop-blur-md shadow-sm border border-[#d6e3da] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,248,245,0.98)_100%)] px-3 pb-6 pt-6 shadow-[0_16px_40px_rgba(16,47,37,0.08)] sm:px-7 sm:pb-8"
      aria-labelledby="podium-heading"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-12 h-40 w-40 -translate-x-1/2 rounded-full bg-[#bdf354]/12 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-10 top-8 h-28 w-28 rounded-full bg-[#dfe9e3]/45 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-10 h-28 w-28 rounded-full bg-[#f5efe2]/55 blur-3xl" />

      <div className="relative text-center">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#007a52]">Recycling champions</p>
      </div>

      <div className="relative mt-8 grid grid-cols-3 items-end gap-2 sm:mt-10 sm:gap-4">
        {orderedEntries.map((entry) => (
          <PodiumPlace key={`${entry.rank}-${entry.admission_number}`} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  const style = rankStyle(entry.rank);
  const plasticItems = entry.by_material.plastic?.items ?? 0;
  const aluminiumItems = entry.by_material.aluminium?.items ?? 0;

  return (
    <article className={`rounded-3xl border p-4 shadow-sm ${style.row}`}>
      <div className="flex items-start gap-3">
        <RankBadge rank={entry.rank} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-[#102f25]">
            {entry.admission_number}
          </p>
          <p className="text-xs font-semibold text-[#60766e]">Admission / Employee ID</p>
        </div>

        <div className="text-right">
          <p className="text-xl font-black text-[#007a52]">
            {integerFormatter.format(entry.eco_credits)}
          </p>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#60766e]">
            Eco credits
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-[#cbd9d1] rounded-2xl bg-white/65 py-3 text-center">
        <div className="px-2">
          <p className="font-black text-[#102f25]">{entry.items_recycled}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#60766e]">Items</p>
        </div>
        <div className="px-2">
          <p className="font-black text-[#102f25]">
            {currencyFormatter.format(entry.amount_earned)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#60766e]">Earned</p>
        </div>
        <div className="px-2">
          <p className="font-black text-[#102f25]">
            {decimalFormatter.format(entry.co2e_kg)} kg
          </p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#60766e]">CO₂e</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {plasticItems > 0 ? (
          <MaterialPill label="plastic" items={plasticItems} variant="plastic" />
        ) : null}
        {aluminiumItems > 0 ? (
          <MaterialPill label="aluminium" items={aluminiumItems} variant="aluminium" />
        ) : null}
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <section aria-label="Loading leaderboard" className="mt-6">
      <div className="flex items-center justify-center gap-2 rounded-3xl border border-[#dce8df] bg-white p-8 text-[#007a52] shadow-sm">
        <LoaderCircle className="h-6 w-6 animate-spin" aria-hidden="true" />
        <p className="font-extrabold">Loading the leaderboard…</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="h-28 animate-pulse rounded-3xl border border-[#dce8df] bg-white/70"
          />
        ))}
      </div>
    </section>
  );
}

async function requestLeaderboard(): Promise<LeaderboardData> {
  const response = await fetch("/api/leaderboard", { cache: "no-store" });
  const result = await response.json() as LeaderboardApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(
      result.success
        ? "The leaderboard is unavailable right now."
        : result.message,
    );
  }

  return result.data;
}

export function LeaderboardView() {
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const displayedEntries = state.status === "ready"
    ? state.data.leaderboard.filter((entry) => entry.rank <= 10).slice(0, 10)
    : [];
  const podiumEntries = displayedEntries.filter((entry) => entry.rank <= 3);
  const remainingEntries = displayedEntries.filter((entry) => entry.rank > 3);

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await requestLeaderboard();
      setState({ status: "ready", data });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error
          ? error.message
          : "Unable to load the leaderboard. Check your connection and try again.",
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void requestLeaderboard().then(
      (data) => {
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      },
      (error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error
              ? error.message
              : "Unable to load the leaderboard. Check your connection and try again.",
          });
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f4f8f1] px-4 pb-12 pt-5 font-sans text-[#102f25] sm:px-6 sm:pt-7">
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 top-36 h-72 w-72 rounded-full bg-[#bdf354]/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 top-12 h-80 w-80 rounded-full bg-[#d9cdf7]/30 blur-3xl" />

      <div className="relative mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            aria-label="Back to Cashcrow home"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfe0d6] bg-white/80 text-[#0b5239] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52]"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>

          <Image
            src="/assets/Cashcrow_logo1.png"
            alt="Cashcrow"
            width={152}
            height={72}
            priority
            className="h-auto w-32 sm:w-36"
          />

          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              void loadLeaderboard();
            }}
            disabled={refreshing || state.status === "loading"}
            aria-label="Refresh leaderboard"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#cfe0d6] bg-white/80 text-[#0b5239] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          </button>
        </header>

        <section className="mt-7 text-center" aria-labelledby="leaderboard-heading">

          <h1
            id="leaderboard-heading"
            className="text-[clamp(2.25rem,10vw,3.25rem)] font-black leading-[1.05] tracking-tight text-[#0f2e24]"
          >
            <span>Campus </span>

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

              <span className="relative z-10">legends.</span>
            </span>
          </h1>

          <p className="mx-auto mt-1 max-w-xs text-base font-medium leading-relaxed text-[#2d4d42] sm:text-[17px]">
            You recycled. Now check the campus clout & top contenders.
          </p>
        </section>

        {state.status === "loading" ? <LoadingState /> : null}

        {state.status === "error" ? (
          <section className="mx-auto mt-8 max-w-lg rounded-3xl border border-[#ead8d0] bg-white p-7 text-center shadow-sm" role="alert">
            <CircleGauge className="mx-auto h-9 w-9 text-[#a45638]" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-black">We couldn&apos;t load the standings</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#6f625d]">{state.message}</p>
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading" });
                void loadLeaderboard();
              }}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border-2 border-[#003f2b] bg-[#007a52] px-5 py-2.5 font-black text-white shadow-[0_3px_0_0_#063324] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a52] focus-visible:ring-offset-2 active:translate-y-0.5 active:shadow-none"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </section>
        ) : null}

        {state.status === "ready" ? (
          <>
            <section
              aria-label="Community impact summary"
              className="mx-auto mt-7 w-full max-w-xl overflow-hidden rounded-3xl border border-emerald-900/10 bg-white/80 p-5 shadow-sm backdrop-blur-md sm:p-6"
            >
              {/* Header Section */}
              <div className="border-b border-emerald-900/10 pb-3 text-emerald-700">
                <h2 className="text-xs text-center font-bold uppercase tracking-wider text-[#007a52]">
                  Gross Campus Impact
                </h2>
              </div>

              {/* Metrics Grid */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {/* Recyclers Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-50">
                  <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:text-xs">
                    <Users className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                    Rivalry
                  </p>
                  <p className="my-1.5 text-xl font-bold leading-none tabular-nums tracking-tight text-slate-900 sm:text-2xl">
                    {integerFormatter.format(state.data.summary.participants)}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 sm:text-xs">Recyclers</p>
                </div>

                {/* Eco Credits Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3 text-center transition-all hover:bg-amber-50/80">
                  <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 sm:text-xs">
                    <Coins className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                    Mined
                  </p>
                  <p className="my-1.5 text-xl font-bold leading-none tabular-nums tracking-tight text-amber-900 sm:text-2xl">
                    {integerFormatter.format(state.data.summary.total_eco_credits)}
                  </p>
                  <p className="text-[11px] font-medium text-amber-700/80 sm:text-xs">Eco Credits</p>
                </div>

                {/* CO2e Prevented Card */}
                <div className="flex flex-col justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3 text-center transition-all hover:bg-emerald-50/80">
                  <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 sm:text-xs">
                    <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    Prevented
                  </p>
                  <p className="my-1.5 text-xl font-bold leading-none tabular-nums tracking-tight text-emerald-900 sm:text-2xl">
                    {decimalFormatter.format(state.data.summary.total_co2e_kg)}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-700/80 sm:text-xs">kg CO₂e</p>
                </div>
              </div>
            </section>

            <Podium entries={podiumEntries} />

            <section className="mt-7 overflow-hidden rounded-[2rem] border border-[#d6e3da] bg-white/80 shadow-sm" aria-labelledby="standings-heading">
              <header className="flex flex-col gap-3 border-b border-[#dce7df] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#007a52]">Ranks 4–10</p>
                  <h2 id="standings-heading" className="mt-1 text-2xl font-black tracking-tight">Community standings</h2>
                </div>
                <p className="flex items-center gap-2 text-xs font-bold text-[#61776e]">
                  <PackageCheck className="h-4 w-4 text-[#007a52]" aria-hidden="true" />
                  Ranked by eco credits
                </p>
              </header>

              {displayedEntries.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  <Trophy className="mx-auto h-10 w-10 text-[#8ba098]" aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-black">The board is ready</h3>
                  <p className="mt-1 text-sm font-semibold text-[#667b73]">Recycle an item to claim the first spot.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 p-4 md:hidden">
                    {remainingEntries.map((entry) => (
                      <LeaderboardCard key={`${entry.rank}-${entry.admission_number}`} entry={entry} />
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[850px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-[#dce7df] bg-[#f7faf7] text-[11px] font-black uppercase tracking-[0.1em] text-[#657a72]">
                          <th className="px-6 py-4">Rank</th>
                          <th className="px-4 py-4">Admission / Employee ID</th>
                          <th className="px-4 py-4 text-center">Items</th>
                          <th className="px-4 py-4 text-right">Earned</th>
                          <th className="px-4 py-4 text-right">Eco credits</th>
                          <th className="px-4 py-4 text-right">CO₂e</th>
                          <th className="px-6 py-4">Material mix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {remainingEntries.map((entry) => {
                          const style = rankStyle(entry.rank);
                          const plasticItems = entry.by_material.plastic?.items ?? 0;
                          const aluminiumItems = entry.by_material.aluminium?.items ?? 0;
                          return (
                            <tr
                              key={`${entry.rank}-${entry.admission_number}`}
                              className={`border-b last:border-b-0 ${style.row}`}
                            >
                              <td className="px-6 py-4"><RankBadge rank={entry.rank} /></td>
                              <th scope="row" className="px-4 py-4 text-base font-black">{entry.admission_number}</th>
                              <td className="px-4 py-4 text-center font-extrabold">{integerFormatter.format(entry.items_recycled)}</td>
                              <td className="px-4 py-4 text-right font-extrabold">{currencyFormatter.format(entry.amount_earned)}</td>
                              <td className="px-4 py-4 text-right text-lg font-black text-[#007a52]">{integerFormatter.format(entry.eco_credits)}</td>
                              <td className="px-4 py-4 text-right font-extrabold">{decimalFormatter.format(entry.co2e_kg)} kg</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {plasticItems > 0 ? (
                                    <MaterialPill label="plastic" items={plasticItems} variant="plastic" />
                                  ) : null}
                                  {aluminiumItems > 0 ? (
                                    <MaterialPill label="aluminium" items={aluminiumItems} variant="aluminium" />
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>

            <aside className="mt-5 grid gap-3 rounded-3xl border border-[#d8e5db] bg-white/70 p-4 sm:grid-cols-2 sm:p-5" aria-label="How eco credits are calculated">
              <div className="flex items-center gap-3 rounded-2xl bg-[#edf8e8] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#347329] shadow-sm">
                  <CupSoda className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-black">Plastic</p>
                  <p className="text-xs font-semibold text-[#5d7569]">1 credit · 0.04 kg CO₂e per item</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-[#f1edf9] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#654b91] shadow-sm">
                  <CircleGauge className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-black">Aluminium</p>
                  <p className="text-xs font-semibold text-[#6f6680]">3 credits · 0.15 kg CO₂e per item</p>
                </div>
              </div>
            </aside>
          </>
        ) : null}

        <footer className="mt-8 flex items-center justify-center gap-2 text-center text-xs font-bold text-[#5f756c]">
          <Leaf className="h-4 w-4 text-[#007a52]" aria-hidden="true" />
          Every item counts. Keep recycling, AJCE.
        </footer>
      </div>
    </main>
  );
}
