const STORAGE_KEY = "cashcrow:voucher-outcomes:v1";
const NOT_FOUND_TTL_MS = 5 * 60 * 1000;

export type VoucherOutcomeKind =
  | "CLAIMED"
  | "EXPIRED"
  | "VOID"
  | "NOT_FOUND"
  | "NOT_CLAIMABLE";

export type CachedVoucherOutcome = {
  kind: VoucherOutcomeKind;
  message: string;
  cachedAt: number;
  expiresAt: number | null;
};

type VoucherOutcomeStore = Record<string, CachedVoucherOutcome>;

function readStore(): VoucherOutcomeStore {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as unknown;
    return typeof parsed === "object" && parsed !== null
      ? parsed as VoucherOutcomeStore
      : {};
  } catch {
    return {};
  }
}

function writeStore(store: VoucherOutcomeStore) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function getCachedVoucherOutcome(couponCode: string) {
  const store = readStore();
  const outcome = store[couponCode];

  if (!outcome) {
    return null;
  }

  if (outcome.expiresAt !== null && outcome.expiresAt <= Date.now()) {
    delete store[couponCode];
    writeStore(store);
    return null;
  }

  return outcome;
}

export function cacheVoucherOutcome(
  couponCode: string,
  kind: VoucherOutcomeKind,
  message: string,
) {
  const store = readStore();
  const cachedAt = Date.now();

  store[couponCode] = {
    kind,
    message,
    cachedAt,
    // Claimed, expired, void, and explicitly not-claimable states are terminal.
    expiresAt: kind === "NOT_FOUND" ? cachedAt + NOT_FOUND_TTL_MS : null,
  };

  writeStore(store);
}
