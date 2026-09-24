export const CLAIMED_COUPON_STORAGE_KEY = "cashcrow:last-claimed-coupon";

export type CouponStatus = "ISSUED" | "CLAIMED" | "EXPIRED" | "VOID";

export type Coupon = {
  couponCode: string;
  voucherQr?: string;
  transactionId?: string;
  amount: number;
  units?: number;
  status: CouponStatus;
  sessionId?: string;
  deviceId?: string;
  issuedAt?: string;
  claimedAt: string | null;
  expiresAt?: string;
};

export type ClaimCouponResponse = {
  success: true;
  message: string;
  coupon: Coupon;
};

export type ClaimedCoupon = Coupon & {
  admissionNumber: string;
};
