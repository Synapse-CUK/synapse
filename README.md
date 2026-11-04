# Synapse

A LinkedIn-style network for CSE, IT and IoT students and faculty. Students post achievements for faculty to verify, earn XP, and form teams for events and hackathons. Coordinators run the platform.

Built with Next.js 15, Convex and Clerk.

**QA site:** <https://synapse-cuk.vercel.app>. It uses test data only, so don't enter real personal details.

**New to the team?** Start with the [team handbook](docs/handbook/README.md). This week's work is [Sprint 1: Tags and Top Students](docs/handbook/sprint-1-tags-and-top-students.md).

## What's built

| Area | Status |
| --- | --- |
| Sign-in, onboarding, profiles | Working |
| Achievements, faculty verification, XP | Working |
| Events, teams, join requests | Working |
| Coordinator admin panel | Working |
| Connections, likes, comments, messaging, notifications | Planned |
| Kanban, team chat, GitHub tracking | Planned (tables exist, no features yet) |

## Roles

| Role | Can do |
| --- | --- |
| Student | Post achievements, host and join events |
| Faculty pending | Same as a student, while a coordinator reviews the request |
| Faculty | Also verify achievements |
| Coordinator | Manage users, events, achievements and faculty approvals |

Roles live in Convex. Clerk is only used for sign-in.

## Run it locally

You need Node 22, a [Convex](https://convex.dev) account and a [Clerk](https://clerk.com) application.

1. Install and configure:

   ```bash
   npm install
   cp .env.example .env.local
   ```

2. Start Convex, which creates your dev deployment and fills in the Convex values:

   ```bash
   npm run convex:dev
   ```

3. In the Clerk dashboard:
   - Create a JWT template named `convex`.
   - Add a webhook for `user.created` and `user.updated`, pointing to `https://<your-deployment>.convex.site/clerk-users-webhook`.
   - Copy the keys into `.env.local`.

4. Give Convex its own settings:

   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-clerk-domain>.clerk.accounts.dev
   npx convex env set CLERK_WEBHOOK_SECRET whsec_...
   ```

5. In a second terminal, start the app at <http://localhost:3000>:

   ```bash
   npm run dev
   ```

6. Sign up, then make yourself a coordinator:

   ```bash
   npx convex run admin:setRole '{"email":"you@example.com","role":"coordinator"}'
   ```

## Checks

```bash
npm run typecheck
npm run lint
npm test
```

Security rules are tested in `convex/security.test.ts`. CI runs all of these on every pull request.

`npm run build` fails on exFAT drives with an `EISDIR` error from webpack. Build from an NTFS or Linux drive instead.

## QA accounts

```bash
node scripts/seed-qa-users.mjs --testers 5
```

This creates test logins and saves them to `qa-credentials.local.csv`, which is gitignored. Re-running keeps existing passwords and other testers' rows. See [docs/qa/tester-guide.md](docs/qa/tester-guide.md).

### One-click test logins (local only)

Under `npm run dev`, the sign-in page shows **Student**, **Faculty** and **Coordinator** buttons that sign you in as the `qa01` accounts. They use a single-use Clerk sign-in ticket rather than a password, so Convex sees a normal session and every role check still applies. The buttons and the `/api/dev-login` route only work under `next dev` on localhost with a Clerk `sk_test_` key. Production builds don't include the buttons, and the route returns 404 there.

Your dev Convex deployment needs the qa01 records once:

```bash
node scripts/seed-qa-users.mjs --testers 1 --deployment dev
```

## Project layout

| Path | Contents |
| --- | --- |
| `app/` | Pages (Next.js App Router) |
| `components/` | Shared UI |
| `convex/` | Database schema and server functions |
| `convex/lib/` | Shared auth, validators and semester logic |
| `scripts/` | Operator scripts |
| `docs/qa/` | Test plan and tester guide |

See [CONTRIBUTING.md](CONTRIBUTING.md) to help out, and [SECURITY.md](SECURITY.md) to report a vulnerability.
