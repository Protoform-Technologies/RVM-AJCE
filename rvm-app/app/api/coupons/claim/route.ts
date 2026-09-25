import { NextResponse } from "next/server";

import type { Coupon } from "@/lib/coupon";

const DEFAULT_API_BASE_URL = "https://api.cashcrow.co.in/api/v1/rvm";
const DEFAULT_CLAIM_ORIGIN = "https://claim.cashcrow.co.in";

type CashcrowResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  coupon?: Coupon;
};

const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: "Admission number or employee ID must be 3–5 digits.",
  validation: "Admission number or employee ID must be 3–5 digits.",
  COUPON_NOT_FOUND: "We could not find that voucher.",
  COUPON_ALREADY_CLAIMED: "This voucher has already been claimed.",
  COUPON_NOT_CLAIMABLE: "This voucher has expired, was voided, or cannot be claimed.",
  CLAIM_IN_PROGRESS: "This voucher claim is already in progress. Wait about 2 minutes before checking again.",
  AES_AJCE_CREDIT_FAILED: "The food-court credit was rejected. The voucher was not claimed; you can try again.",
  AES_AJCE_TIMEOUT: "The food-court credit status is uncertain. Do not retry immediately; contact support if it does not resolve.",
  AES_AJCE_NETWORK_ERROR: "The food-court credit status is uncertain. Do not retry immediately; contact support if it does not resolve.",
  AES_AJCE_NOT_CONFIGURED: "Food-court crediting is not configured. Please contact support.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  UNAUTHORIZED: "Cashcrow rejected the configured claim credentials.",
  FORBIDDEN_ORIGIN: "Cashcrow rejected the configured claim website origin.",
  INTERNAL_ERROR: "Cashcrow could not process the voucher right now.",
};

async function readJson(response: Response): Promise<CashcrowResponse> {
  try {
    return (await response.json()) as CashcrowResponse;
  } catch {
    return {};
  }
}

function upstreamError(
  response: Response,
  body: CashcrowResponse,
  fallback: string,
) {
  const error = body.error ?? "UPSTREAM_ERROR";
  const status = response.status >= 400 && response.status < 600
    ? response.status
    : 502;
  const headers = new Headers({ "Cache-Control": "no-store" });
  const retryAfter = response.headers.get("Retry-After");

  if (retryAfter) {
    headers.set("Retry-After", retryAfter);
  }

  return NextResponse.json(
    {
      success: false,
      error,
      message: errorMessages[error] ?? fallback,
    },
    { status, headers },
  );
}

export async function POST(request: Request) {
  console.log("[voucher-claim:v3] Request received.");

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "VALIDATION_ERROR", message: errorMessages.VALIDATION_ERROR },
      { status: 400 },
    );
  }

  const couponCode =
    typeof payload === "object" && payload !== null && "couponCode" in payload
      ? String(payload.couponCode).trim().toUpperCase()
      : "";
  const admissionNumber =
    typeof payload === "object" && payload !== null && "admissionNumber" in payload
      ? String(payload.admissionNumber).trim()
      : "";

  if (
    couponCode.length < 6 ||
    couponCode.length > 96 ||
    !/^\d{3,5}$/.test(admissionNumber)
  ) {
    return NextResponse.json(
      { success: false, error: "VALIDATION_ERROR", message: errorMessages.VALIDATION_ERROR },
      { status: 400 },
    );
  }

  const username = process.env.CASHCROW_CLAIM_USERNAME;
  const password = process.env.CASHCROW_CLAIM_PASSWORD;

  if (!username || !password) {
    console.error("Cashcrow claim credentials are not configured.");
    return NextResponse.json(
      {
        success: false,
        error: "CONFIGURATION_ERROR",
        message: "Voucher claiming is not configured yet. Please contact support.",
      },
      { status: 503 },
    );
  }

  const apiBaseUrl = (
    process.env.CASHCROW_RVM_API_BASE_URL ?? DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
  const claimOrigin = (
    process.env.CASHCROW_CLAIM_ORIGIN ?? DEFAULT_CLAIM_ORIGIN
  ).replace(/\/$/, "");
  const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const sharedHeaders = {
    Authorization: authorization,
    Origin: claimOrigin,
    Referer: `${claimOrigin}/`,
  };

  try {
    const claimStartedAt = Date.now();
    console.log("[voucher-claim:v3] Calling Cashcrow claim endpoint.");

    const claimResponse = await fetch(`${apiBaseUrl}/admin/coupons/claim`, {
      method: "POST",
      headers: {
        ...sharedHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        couponCode,
        admissionNumber,
      }),
      cache: "no-store",
    });
    console.log(
      `[voucher-claim:v3] Cashcrow claim endpoint responded with status ${claimResponse.status} in ${Date.now() - claimStartedAt}ms.`,
    );
    const claimBody = await readJson(claimResponse);

    if (!claimResponse.ok || !claimBody.coupon) {
      return upstreamError(
        claimResponse,
        claimBody,
        "The voucher was not claimed. Please follow the displayed guidance.",
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: claimBody.message ?? "Coupon claimed",
        coupon: claimBody.coupon,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Claim-Flow-Version": "cashcrow-v3",
        },
      },
    );
  } catch (error) {
    console.error("Cashcrow voucher claim failed.", error);
    return NextResponse.json(
      {
        success: false,
        error: "UPSTREAM_UNAVAILABLE",
        message: "Cashcrow is temporarily unavailable. Please try again.",
      },
      { status: 502 },
    );
  }
}
