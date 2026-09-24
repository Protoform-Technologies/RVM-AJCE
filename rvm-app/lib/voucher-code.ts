const RAW_CODE_PATTERN = /(?:DRSV\.[A-Z0-9]+|RV-[A-Z0-9-]+)/i;
const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

export function extractVoucherCode(value: string) {
  const input = value.trim();

  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);
    const couponEntry = Array.from(url.searchParams.entries()).find(
      ([key]) => key.toLowerCase() === "couponcode",
    );

    if (couponEntry) {
      return extractVoucherCode(couponEntry[1]);
    }
  } catch {
    // Raw voucher values are expected to fail URL parsing.
  }

  const code = input.match(RAW_CODE_PATTERN)?.[0]
    ?? input.match(UUID_PATTERN)?.[0]
    ?? null;

  if (!code || code.length < 6 || code.length > 96) {
    return null;
  }

  return code.toUpperCase();
}

export function couponCodeFromPageUrl(pageUrl: string | null | undefined) {
  if (!pageUrl) {
    return null;
  }

  try {
    const url = new URL(pageUrl);
    const couponEntry = Array.from(url.searchParams.entries()).find(
      ([key]) => key.toLowerCase() === "couponcode",
    );

    return couponEntry ? extractVoucherCode(couponEntry[1]) : null;
  } catch {
    return null;
  }
}
