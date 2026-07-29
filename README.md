# VULKAN Gym — Backend

REST API for the VULKAN gym management app. Node.js + Express + TypeScript, Prisma ORM, MySQL, JWT auth.

Built to match the shape of `Gym Front`'s mock `DataContext` exactly, so wiring the frontend to this API is a matter of replacing each mock mutation with a `fetch` call — no page or component needs to change.

## Stack

- **Runtime**: Node.js (ESM) + TypeScript, run via `tsx`
- **Framework**: Express 4
- **Database**: MySQL, accessed via Prisma ORM
- **Auth**: JWT (7-day expiry), passwords hashed with bcrypt
- **Validation**: Zod on every request body

## Setup

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (a MySQL server must already be running) and a `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the schema:
   ```bash
   npx prisma migrate dev
   ```
4. Seed demo data (idempotent — safe to re-run):
   ```bash
   npm run prisma:seed
   ```
5. Start the dev server (hot reload):
   ```bash
   npm run dev
   ```
   Server listens on `http://localhost:4000` by default (`PORT` in `.env`).

Run the test suite with `npm test`.

## Demo accounts

Same accounts as the frontend's `demoAccounts.ts`, password `vulkan2026` for all:

| Email | Role |
|---|---|
| admin@vulkangym.com | admin |
| recepcion@vulkangym.com | reception |
| andres.reyes@gmail.com … daniela.cruz@gmail.com (m1–m6) | member |
| marco.diaz@vulkangym.com … camila.soto@vulkangym.com (t1–t4) | trainer |

## Auth

`POST /auth/login` — `{ email, password }` → `{ token, session }`. `session` matches the frontend's `Session` type (`role`, `name`, `avatar`, `memberId?`, `trainerId?`).

`GET /auth/me` — returns the current session for a valid token. Useful for restoring session on page reload instead of trusting a stale localStorage copy.

Every other route requires `Authorization: Bearer <token>`.

## Resources

All list endpoints return every row (no pagination), matching the frontend's "load everything into context" pattern — role-based filtering happens client-side same as before.

| Resource | Endpoints |
|---|---|
| Members | `GET /members`, `POST /members` (admin), `PATCH /members/:id` (admin or self), `DELETE /members/:id` (admin, cascades — no ghost seats), `PUT /members/:id/measurements` (admin/trainer, upserts by date), `POST/DELETE /members/:id/photos` (self) |
| Trainers | `GET /trainers`, `POST /trainers` (admin), `PATCH /trainers/:id` (admin or self), `DELETE /trainers/:id` (admin, blocked with 409 while classes are still assigned), `POST /trainers/:id/reassign-classes` (admin, `{ toTrainerId }`) |
| Classes | `GET /classes`, `POST /classes` (admin, 409 on schedule clash), `PATCH /classes/:id` (admin, 409 on clash or capacity below current bookings), `DELETE /classes/:id` (admin), `POST /classes/:id/toggle-booking` `{memberId}` (member, self; auto-promotes the next waitlisted member when unbooking), `POST /classes/:id/waitlist/join`/`leave` (member, self), `POST /classes/:id/toggle-attendance` `{memberId}` (admin/trainer) |
| Payments | `GET /payments`, `POST /payments`, `PATCH /payments/:id`, `DELETE /payments/:id` (admin/reception) |
| Session packages | `GET /session-packages`, `POST/PATCH/DELETE /session-packages/:id` (admin), `POST /session-packages/:id/use` (admin) |
| Workout plans | `GET /workout-plans`, `POST /workout-plans` (trainer/admin), `PATCH /workout-plans/:id` (replaces exercises), `DELETE /workout-plans/:id` |
| Check-ins | `GET/POST /check-ins` (admin/reception), `DELETE /check-ins/:id` (undo, decrements the member's count) |
| Signup requests | `POST /signup-requests` (public, no auth), `GET /signup-requests` (admin), `POST /signup-requests/:id/approve` `{trainerId}` → creates the Member **and** a User account, returns a `temporaryPassword` for staff to relay (see note below), `POST /signup-requests/:id/reject` |
| Audit log | `GET /audit-log` (admin), `POST /audit-log` `{actor, action}` (any authenticated role) |

Full request/response field names match the frontend's `src/data/types.ts` interfaces one-to-one (e.g. `Member`, `GymClass`, `Payment`) — dates are plain `YYYY-MM-DD` strings, not ISO timestamps, so `formatDate`/`toMinutes` etc. in the frontend keep working unmodified.

### Note on member passwords

There's no email service wired up yet, so approving a signup request or otherwise creating a member account generates a random temporary password and returns it in the API response — staff need to relay it to the member directly (or you build a "reset password" email flow before going live). This is the one place the mock's blanket `DEMO_PASSWORD` couldn't carry over as-is, since every account now needs a real, distinct credential.

## Wiring up the frontend

Two files in `Gym Front` are the entire integration surface — nothing else changes:

1. **`src/context/AuthContext.tsx`** — replace the `login()` body with a `fetch('http://localhost:4000/auth/login', ...)` call; store the returned `token` (e.g. alongside the session in localStorage) and attach it as `Authorization: Bearer <token>` on every subsequent request.
2. **`src/context/DataContext.tsx`** — replace every mutation's body (`addMember`, `updateClass`, `toggleBooking`, …) with a `fetch` call to the matching endpoint above, and replace the initial `useState(() => loadStored()?.x ?? initialX)` seeds with a `GET` on mount for each resource.

Every validation rule the frontend already enforces client-side (duplicate email, schedule conflicts, capacity vs. bookings, trainer-has-classes) is enforced again server-side, so nothing changes in the pages themselves — a rejected request will already come back with the same kind of error message the mock used to construct locally; just surface `error` from the response body in the existing `showToast(..., 'error')` calls.
