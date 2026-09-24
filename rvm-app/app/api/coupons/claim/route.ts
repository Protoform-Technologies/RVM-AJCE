import { NextResponse } from "next/server";

import type { Coupon } from "@/lib/coupon";

const DEFAULT_API_BASE_URL = "https://api.cashcrow.co.in/api/v1/rvm";
const DEFAULT_CLAIM_ORIGIN = "https://claim.cashcrow.co.in";
const DEFAULT_AES_STOCK_API_URL = "https://stock.aesajce.in/offers/cashcrow";

type CashcrowResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  coupon?: Coupon;
};

type AesOfferResponse = {
  success?: boolean;
};

const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: "Enter a valid voucher code.",
  COUPON_NOT_FOUND: "We could not find that voucher.",
  COUPON_ALREADY_CLAIMED: "This voucher has already been claimed.",
  COUPON_NOT_CLAIMABLE: "This voucher has expired, was voided, or cannot be claimed.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  UNAUTHORIZED: "Cashcrow rejected the configured claim credentials.",
  FORBIDDEN_ORIGIN: "Cashcrow rejected the configured claim website origin.",
  INVALID_COUPON_AMOUNT: "This voucher does not have a valid discount amount.",
  OFFER_FAILED: "The student offer could not be created. The voucher was not claimed.",
  CLAIM_FAILED_AFTER_OFFER: "The student offer was created, but the voucher could not be marked claimed. Do not retry; contact support.",
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
      ? String(payload.admissionNumber).trim().toUpperCase()
      : "";

  if (
    couponCode.length < 6 ||
    couponCode.length > 96 ||
    !/^AJC\d{2}[A-Z]{2}\d{3}$/.test(admissionNumber)
  ) {
    return NextResponse.json(
      { success: false, error: "VALIDATION_ERROR", message: errorMessages.VALIDATION_ERROR },
      { status: 400 },
    );
  }

  const username = process.env.CASHCROW_CLAIM_USERNAME;
  const password = process.env.CASHCROW_CLAIM_PASSWORD;
  const aesStockApiKey = process.env.AES_STOCK_API_KEY;

  if (!username || !password || !aesStockApiKey) {
    console.error("Cashcrow or AES stock credentials are not configured.");
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
  const aesStockApiUrl = process.env.AES_STOCK_API_URL
    ?? DEFAULT_AES_STOCK_API_URL;
  const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const sharedHeaders = {
    Authorization: authorization,
    Origin: claimOrigin,
    Referer: `${claimOrigin}/`,
  };

  try {
    const lookupResponse = await fetch(
      `${apiBaseUrl}/admin/coupons/${encodeURIComponent(couponCode)}`,
      { headers: sharedHeaders, cache: "no-store" },
    );
    const lookupBody = await readJson(lookupResponse);

    if (!lookupResponse.ok || !lookupBody.coupon) {
      return upstreamError(
        lookupResponse,
        lookupBody,
        "The voucher could not be checked right now.",
      );
    }

    if (lookupBody.coupon.status !== "ISSUED") {
      const error = lookupBody.coupon.status === "CLAIMED"
        ? "COUPON_ALREADY_CLAIMED"
        : "COUPON_NOT_CLAIMABLE";

      return NextResponse.json(
        { success: false, error, message: errorMessages[error] },
        { status: 409 },
      );
    }

    const offerAmount = lookupBody.coupon.amount;

    if (!Number.isFinite(offerAmount) || offerAmount <= 0) {
      console.error("Cashcrow returned an invalid coupon amount.");
      return NextResponse.json(
        {
          success: false,
          error: "INVALID_COUPON_AMOUNT",
          message: errorMessages.INVALID_COUPON_AMOUNT,
        },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const offerStartedAt = Date.now();
    console.info("[voucher-claim] Calling AJCE offer endpoint.");

    const offerResponse = await fetch(aesStockApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: aesStockApiKey,
        buyer_id: admissionNumber,
        amount: offerAmount,
      }),
      cache: "no-store",
    });
    console.info(
      `[voucher-claim] AJCE offer endpoint responded with status ${offerResponse.status} in ${Date.now() - offerStartedAt}ms.`,
    );
    let offerBody: AesOfferResponse = {};

    try {
      offerBody = (await offerResponse.json()) as AesOfferResponse;
    } catch {
      // Some successful AJCE responses may not include a JSON body.
    }

    if (!offerResponse.ok || offerBody.success === false) {
      console.error(
        `AES Cashcrow offer creation failed with status ${offerResponse.status}.`,
      );
      return NextResponse.json(
        {
          success: false,
          error: "OFFER_FAILED",
          message: errorMessages.OFFER_FAILED,
        },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const claimCode = lookupBody.coupon.voucherQr || lookupBody.coupon.couponCode;
    const claimStartedAt = Date.now();
    console.info("[voucher-claim] AJCE offer succeeded; calling Cashcrow claim endpoint.");

    const claimResponse = await fetch(`${apiBaseUrl}/admin/coupons/claim`, {
      method: "POST",
      headers: {
        ...sharedHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ couponCode: claimCode }),
      cache: "no-store",
    });
    console.info(
      `[voucher-claim] Cashcrow claim endpoint responded with status ${claimResponse.status} in ${Date.now() - claimStartedAt}ms.`,
    );
    const claimBody = await readJson(claimResponse);

    if (!claimResponse.ok || !claimBody.coupon) {
      console.error(
        `Cashcrow claim failed with status ${claimResponse.status} after the AES offer was created.`,
      );
      return NextResponse.json(
        {
          success: false,
          error: "CLAIM_FAILED_AFTER_OFFER",
          message: errorMessages.CLAIM_FAILED_AFTER_OFFER,
        },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: claimBody.message ?? "Coupon claimed",
        coupon: { ...lookupBody.coupon, ...claimBody.coupon },
      },
      { headers: { "Cache-Control": "no-store" } },
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
