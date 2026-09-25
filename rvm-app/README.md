# Cashcrow RVM voucher claim frontend

This Next.js app opens a printed RVM voucher deep link, verifies that the voucher
is `ISSUED`, collects a 3-digit employee ID or 5-digit admission number, claims the voucher, and
displays the confirmed reward amount. If the page is opened without a valid
`couponcode` query parameter, it shows a camera QR scanner instead.

## Configuration

Copy `.env.example` to `.env.local` and add the dedicated claim credentials:

```dotenv
CASHCROW_CLAIM_USERNAME=your_claim_username
CASHCROW_CLAIM_PASSWORD=your_claim_password
CASHCROW_RVM_API_BASE_URL=https://api.cashcrow.co.in/api/v1/rvm
CASHCROW_CLAIM_ORIGIN=https://claim.cashcrow.co.in
```

There is no user login gate. The browser calls same-origin Next.js route
handlers, and those server-only handlers attach HTTP Basic Auth when forwarding
requests to Cashcrow. The username and password are never compiled into or sent
to the browser.

## Getting Started

First, run the development server:

```bash
npm run dev
# HTTPS development (required for camera testing outside localhost)
npm run dev:https
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open a deep link such as
`http://localhost:3000/?couponcode=DRSV.EXAMPLE` to test the parameter flow.
Opening [http://localhost:3000](http://localhost:3000) without the parameter
shows the scanner and manual-code fallback. Camera access requires a secure
browser context: use `https://` in production, `http://localhost` on the same
computer, or `npm run dev:https` for local HTTPS. When testing from a phone over
the LAN, the phone must trust the development certificate; otherwise use a
trusted HTTPS deployment or development tunnel.

The browser calls `/api/coupons/lookup` and `/api/coupons/claim`. These handlers
forward to `https://api.cashcrow.co.in/api/v1/rvm/admin/coupons/...` with the
server-only credentials and configured claim origin.

On admission-number submission, the claim handler sends exactly one backend
request containing both `couponCode` and the 3- or 5-digit `admissionNumber` to the
Cashcrow claim endpoint. Cashcrow validates voucher status and performs the
AJCE food-court credit as part of that operation, so this frontend does not
call AJCE directly.

Cashcrow returns the persisted `admissionNumber` and `aesCreditedAt` after a
successful claim. Backend idempotency prevents a second successful AJCE credit
for the same voucher.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
