# Marj Lopez — Inquiry System

People who DM Marj about starting an Airbnb, building one, or getting a booking
system fill out a short step-by-step form instead. Their request lands in a team
Inbox that is already sorted (hot and waiting first), and the conversation, calls
included, happens there.

Built on the Malaya OBS stack and design: TanStack Start, React 19, Tailwind 4,
Radix/shadcn, Hugeicons, Supabase (Auth, Postgres, Storage, Realtime), Vercel.
The spec is `../PRD.md`.

## Pages

| Path | Who | What |
|---|---|---|
| `/` | everyone | Landing page: what Marj helps with, how it works, FAQ |
| `/inquire` | everyone | The step-by-step form. Sign-in is only asked at the last step |
| `/messages` | clients | Their requests and the one conversation with the team |
| `/admin/login` | team | Sign in |
| `/admin/inbox` | team | The Inbox: list · thread · lead panel |
| `/admin/quick-replies` | team | Saved answers and the automatic thank-yous |
| `/admin/team` | team | Who answers, and their load |

## Setup

1. **Database.** In Supabase, open the SQL editor, paste `supabase/schema.sql` and run it.
   Re-running wipes the app's tables.
2. **Auth.** Go to Authentication → Sign In / Providers → Email and turn off **Confirm email**,
   so a person who sends the form lands in their inbox straight away. With it on, they get a
   confirmation link first, and their answers are kept until they come back.
3. **Demo data.** Run `npm run seed`. It needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, which is
   gitignored and never deployed.
4. **Run it.** `npm install`, then `npm run dev`.

## Demo accounts

All of them use the password `password`.

| Email | Role |
|---|---|
| `marj@demo.test` | Owner |
| `bea@demo.test` | Assistant |
| `paolo@demo.test` | Assistant |
| `client@demo.test` | Client (Carla Mendoza). She has a call waiting for her to confirm |

## Placeholders for Marj

- His portrait and his own story on the landing page. It currently uses Malaya Villas photos and
  draft copy.
- His social links (`src/lib/brand.ts`).
- The privacy notice (`src/routes/privacy.tsx`). It's a plain-language draft.
- The palette. It's Malaya's for now; his own colours are a token change in `src/styles.css`.

## Not built yet (PRD v1.5)

Email notifications (Resend), scheduled replies, editable questions and Hot thresholds in Settings,
inviting assistants from the app, and a numbers page.
