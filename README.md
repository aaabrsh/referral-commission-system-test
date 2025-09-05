## Referral Commission System — Quick Guide

### Tech stack
- Next.js (App Router)
- UI: shadcn/ui, Tailwind CSS
- Data: Postgres + Prisma
- Integrations: Circle Admin API, Stripe Connect

### Circle handshake (auth flow)
- Step 1 — Verify email: client calls `POST /api/auth/verify-email` with `email`.
  - Server looks up the email in Circle via `verifyCircleMemberByEmail` (`lib/circle.ts`). If not found → 404.
  - If found, the local `User` is checked (created if missing), a one-time login code is generated and DM'd to the Circle member.
- Step 2 — Verify code: client calls `POST /api/auth/verify-code` with `email` and `code`.
  - Server validates and clears the code, creates a session, sets the session cookie, and creates a Stripe Connect account if missing.
- Test mode shortcuts:
  - `NEXT_PUBLIC_TEST_LOGIN_EMAIL` + `NEXT_PUBLIC_TEST_LOGIN_CODE` allow direct login without the Circle DM/code flow.
  - `SKIP_CIRCLE_INTEGRATION=true` only affects referral receiver verification (not the login flow).

### Data storage (Postgres + Prisma)
- `User`: checked during email verification (created if missing), and also created during referral submission if the receiver doesn't exist. Fields: `circle_member_id`, `email`, `name`, `avatar_url`, optional `stripe_connect_id` and `kyc_status` for stripe kyc status.
- `Referral`: created on submit with `introducer_user_id`, `receiver_user_id`, `lead_company`, `lead_email`, `deal_value`, `stage` (`NEW`, `CONTACTED`, `WON`).
- Stage updates happen through the deals pipeling using drag and drop.

### How referrals work
- API: `POST /api/referrals` validates payload, prevents duplicates for the same `lead_email` within 30 days, verifies receiver in Circle (unless skipped), persists referral, and sends a Circle DM to the receiver.

### Test referral submission
1) Ensure you are logged in (use test login vars for convenience).
2) Navigate to "Submit Referral" in the navbar, fill out the form, and submit.
3) If `SKIP_CIRCLE_INTEGRATION=true`, the Circle verification for the receiver is skipped while creating a referral.

### View the pipeline
- Navigate to the `Deals Pipeline` link in the navbar to see referrals by stage.
- Drag and drop deals between stages to update their stage

### Environment variables
- examples provided in  `.env.example` file

### Stripe Connect
- On first login, a Stripe Connect account is created if missing. Use the `Connect with Stripe` button in the navbar to complete onboarding. Webhooks are handled in `app/api/stripe/webhook/route.ts`.

### tips
- Circle helpers: `lib/circle.ts`.
- Stripe helpers: `lib/stripe.ts`.
- Auth helpers: `lib/auth.ts`.
- APIs: `app/api`.
- Pages.
    - Login : `app/login`
    - Authenticated pages (referral form and deals pipeline) : `app/(authenticated)/`
- Test locally with `SKIP_CIRCLE_INTEGRATION=true` to avoid Circle dependency.
- set `NEXT_PUBLIC_TEST_LOGIN_EMAIL` + `NEXT_PUBLIC_TEST_LOGIN_CODE` and click on `use test account` link on login page for direct login

