# RIFT DISTRICT® — Automated Email System (Task Tracker)

Nodemailer + Gmail SMTP transactional email system, integrated **one mail flow at a time**.
Exact brand copy per spec. Email sends are **fire-and-forget & never throw** (cannot break orders/admin actions).

**Env required:** `GMAIL_EMAIL`, `GMAIL_APP_PASSWORD` (Gmail App Password).

---

## Task 0 — Foundation
- [x] Deps: `nodemailer` + `@types/nodemailer`; `serverExternalPackages` += `"nodemailer"`.
- [x] `.env.example`: `GMAIL_EMAIL`, `GMAIL_APP_PASSWORD`.
- [x] `src/lib/email/`: `transporter.ts`, `sendEmail.ts`, `templates/layout.ts`, `index.ts` (old stub `src/lib/email.ts` removed).
- [x] Verify: `npm run build` passes (green).
- [ ] Live send to a real inbox — pending real `GMAIL_EMAIL`/`GMAIL_APP_PASSWORD` in `.env.local` (will be exercised by Task 1's verification email).

### Pre-existing branch build errors fixed to reach a green build (unrelated to email)
1. `src/app/api/admin/replacements/[id]/route.ts` — Next 16 async `params` (now `Promise`, awaited).
2. `scripts/migrations/001-replacement-requests.ts` — import path `../src/lib/sql` → `../../src/lib/sql`.
3. `src/app/admin/replacements/[id]/page.tsx` — implicit `any` in `images.map`.
4. `src/app/api/admin/replacements/route.ts` — redundant `?? undefined`.
5. `src/types/index.ts` — `export`/`export type` under `isolatedModules` (2 lines).
6. `src/app/admin/products/page.tsx` — `useSearchParams()` wrapped in `<Suspense>`.

## Task 1 — Signup OTP Verification (auth gating)
- [x] DB user auth columns (`is_verified`, `otp_hash`, `otp_expiry`) + helpers (`src/lib/db/users.ts`); existing accounts backfilled to verified.
- [x] `src/lib/otp.ts` (generate/hash/verify/expiry); `sendVerificationEmail` ("Verify Your RIFT DISTRICT Account").
- [x] `register` (no auto-login, send OTP), `verify-otp`, `resend-otp` routes; `login` blocks unverified (`EMAIL_NOT_VERIFIED`).
- [x] OTP step wired into the real `signup/page.tsx` + `login/page.tsx` (AuthForm was dead code).

## Task 2 — Password Reset (OTP)
- [x] DB reset columns + helpers; `sendPasswordResetEmail`.
- [x] `forgot-password` + `reset-password` routes; `/forgot-password` page; "Forgot password?" link on login.

## Task 3 — Order Confirmation
- [x] `sendOrderConfirmationEmail`; wired into `orders` POST (fire-and-forget).

## Task 4 — Order Shipped (+ tracking_number)
- [x] DB `tracking_number` col + `ensureOrderTrackingColumn`; `sendOrderShippedEmail`; admin PATCH accepts `trackingNumber`.

## Task 5 — Order Delivered
- [x] `sendOrderDeliveredEmail`; wired into admin PATCH on `delivered`.

## Task 6 — Replacement Received (+ RD-CASE Case ID)
- [x] `seq_replacement_case` + `RD-CASE-######` requestId; `sendReplacementReceivedEmail`.

## Task 7 — Replacement Approved
- [x] `sendReplacementApprovedEmail`; wired into admin `approve`.

## Task 8 — Replacement Rejected
- [x] `sendReplacementRejectedEmail`; wired into admin `reject`.

## Final Verification
- [x] `npm run build` passes (green, 54 routes — all new auth routes present).
- [x] All new email files lint-clean (the 51 `npm run lint` errors are pre-existing/unrelated: CursorFollower, useAnimations, authStore, middleware, etc.).
- [x] Existing-user lockout prevented: `is_verified` backfills existing accounts to verified; only new signups start unverified.
- [ ] **Live run pending real `GMAIL_EMAIL`/`GMAIL_APP_PASSWORD` in `.env.local`** + a running SQL Server, to confirm all 8 emails deliver and DB columns/sequence are created by the `ensure*` calls.
