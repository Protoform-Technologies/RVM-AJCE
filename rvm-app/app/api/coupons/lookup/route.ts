import { NextResponse } from "next/server";

import type { Coupon } from "@/lib/coupon";
import { extractVoucherCode } from "@/lib/voucher-code";

const DEFAULT_API_BASE_URL = "https://api.cashcrow.co.in/api/v1/rvm";
const DEFAULT_CLAIM_ORIGIN = "https://claim.cashcrow.co.in";

type LookupResponse = {
  success?: boolean;
  error?: string;
  coupon?: Coupon;
};

const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: "This QR code does not contain a valid voucher.",
  COUPON_NOT_FOUND: "We could not find this voucher. Scan the printed QR again.",
  RATE_LIMITED: "Too many attempts. Please wait a moment and try again.",
  UNAUTHORIZED: "Cashcrow rejected the configured claim credentials.",
  FORBIDDEN_ORIGIN: "Cashcrow rejected the configured claim website origin.",
  INTERNAL_ERROR: "Cashcrow could not check this voucher right now.",
};

export async function GET(request: Request) {
  const input = new URL(request.url).searchParams.get("code") ?? "";
  const couponCode = extractVoucherCode(input);

  if (!couponCode) {
    return NextResponse.json(
      {
        success: false,
        error: "VALIDATION_ERROR",
        message: errorMessages.VALIDATION_ERROR,
      },
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
        message: "Voucher lookup is not configured yet. Please contact support.",
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

  try {
    const response = await fetch(
      `${apiBaseUrl}/admin/coupons/${encodeURIComponent(couponCode)}`,
      {
        headers: {
          Authorization: authorization,
          Origin: claimOrigin,
          Referer: `${claimOrigin}/`,
        },
        cache: "no-store",
      },
    );

    let body: LookupResponse = {};
    try {
      body = (await response.json()) as LookupResponse;
    } catch {
      // Do not expose malformed upstream response bodies.
    }

    if (!response.ok || !body.coupon) {
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
          message: errorMessages[error]
            ?? "The voucher could not be checked right now.",
        },
        { status, headers },
      );
    }

    return NextResponse.json(
      { success: true, coupon: body.coupon },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Cashcrow voucher lookup failed.", error);
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
