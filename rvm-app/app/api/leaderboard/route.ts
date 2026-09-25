import { NextResponse } from "next/server";

import type {
  LeaderboardApiResponse,
  LeaderboardData,
  LeaderboardEntry,
  MaterialImpact,
} from "@/lib/leaderboard";

const DEFAULT_API_BASE_URL = "https://api.cashcrow.co.in/api/v1/rvm";
const LEADERBOARD_LIMIT = 10;

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isMaterialImpact(value: unknown): value is MaterialImpact {
  if (!value || typeof value !== "object") {
    return false;
  }

  const material = value as Record<string, unknown>;
  return isFiniteNonNegativeNumber(material.items)
    && isFiniteNonNegativeNumber(material.amount)
    && isFiniteNonNegativeNumber(material.eco_credits)
    && isFiniteNonNegativeNumber(material.co2e_kg);
}

function isOptionalMaterialImpact(value: unknown): value is MaterialImpact | undefined {
  return value === undefined || isMaterialImpact(value);
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (!value || typeof value !== "object") {
    return false;
  }

  const entry = value as Record<string, unknown>;
  const byMaterial = entry.by_material;

  return Number.isInteger(entry.rank)
    && Number(entry.rank) > 0
    && typeof entry.admission_number === "string"
    && entry.admission_number.length > 0
    && isFiniteNonNegativeNumber(entry.items_recycled)
    && isFiniteNonNegativeNumber(entry.amount_earned)
    && isFiniteNonNegativeNumber(entry.eco_credits)
    && isFiniteNonNegativeNumber(entry.co2e_kg)
    && !!byMaterial
    && typeof byMaterial === "object"
    && isOptionalMaterialImpact((byMaterial as Record<string, unknown>).plastic)
    && isOptionalMaterialImpact((byMaterial as Record<string, unknown>).aluminium);
}

function isLeaderboardData(value: unknown): value is LeaderboardData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;
  const summary = data.summary;

  return !!summary
    && typeof summary === "object"
    && isFiniteNonNegativeNumber((summary as Record<string, unknown>).participants)
    && isFiniteNonNegativeNumber((summary as Record<string, unknown>).total_eco_credits)
    && isFiniteNonNegativeNumber((summary as Record<string, unknown>).total_co2e_kg)
    && Array.isArray(data.leaderboard)
    && data.leaderboard.every(isLeaderboardEntry);
}

export async function GET() {
  const apiBaseUrl = (
    process.env.CASHCROW_RVM_API_BASE_URL ?? DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");

  try {
    const upstreamResponse = await fetch(
      `${apiBaseUrl}/ajce/leaderboard?limit=${LEADERBOARD_LIMIT}`,
      { cache: "no-store" },
    );

    let body: unknown;

    try {
      body = await upstreamResponse.json();
    } catch {
      body = null;
    }

    const upstreamBody = body as {
      success?: unknown;
      data?: unknown;
      error?: unknown;
      message?: unknown;
    } | null;

    if (
      !upstreamResponse.ok
      || upstreamBody?.success !== true
      || !isLeaderboardData(upstreamBody.data)
    ) {
      const status = upstreamResponse.status >= 400
        && upstreamResponse.status < 600
        ? upstreamResponse.status
        : 502;
      const response: LeaderboardApiResponse = {
        success: false,
        error: typeof upstreamBody?.error === "string"
          ? upstreamBody.error
          : "UPSTREAM_ERROR",
        message: "The leaderboard is unavailable right now. Please try again.",
      };

      return NextResponse.json(response, {
        status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const response: LeaderboardApiResponse = {
      success: true,
      data: upstreamBody.data,
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Cashcrow leaderboard request failed.", error);

    const response: LeaderboardApiResponse = {
      success: false,
      error: "UPSTREAM_UNAVAILABLE",
      message: "Cashcrow is temporarily unavailable. Please try again.",
    };

    return NextResponse.json(response, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
