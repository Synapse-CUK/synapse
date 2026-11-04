# Local Development

## First-time setup

You need Node 22, a Convex account with access to the `synapse` project, and the Clerk keys from Amal.

```bash
git clone https://github.com/Synapse-CUK/synapse.git
cd synapse
npm install
cp .env.example .env.local      # fill in the Clerk keys
npm run convex:dev              # terminal 1: creates or links your dev deployment and keeps it in sync
npm run dev                     # terminal 2: http://localhost:3000
```

Keep `npm run convex:dev` running while you work; it pushes your changes in `convex/` to the dev deployment as you save.

First time on the dev database, create the test accounts:

```bash
node scripts/seed-qa-users.mjs --testers 1 --deployment dev
```

## Signing in

On localhost the sign-in page shows **Student**, **Faculty** and **Coordinator** buttons for the `qa01` accounts. They use a single-use Clerk sign-in ticket, so nobody needs a password. They only exist under `npm run dev` on localhost; production builds don't include them. To switch accounts, sign out first.

## Common tasks

**Start the dev database fresh**

```bash
npx convex env set ALLOW_DATA_RESET true     # dev only, never --prod
npx convex run admin:resetAllData
node scripts/seed-qa-users.mjs --testers 1 --deployment dev
```

**Make someone a coordinator** (they must have signed in once)

```bash
npx convex run admin:setRole '{"email":"you@example.com","role":"coordinator"}'          # dev
npx convex run --prod admin:setRole '{"email":"you@example.com","role":"coordinator"}'   # live site
```

**Create QA accounts on the live site**

```bash
node scripts/seed-qa-users.mjs --testers 5
```

Logins go to `qa-credentials.local.csv` (gitignored). Re-running keeps existing passwords.

## Checks before every push

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

`npm test` runs `convex/security.test.ts`: every permission rule has a test. Add one when you add a rule.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `npm run convex:dev` says "fetch failed" | Something on your machine blocks Convex. Run `conda deactivate`, clear `HTTPS_PROXY` and `HTTP_PROXY`, or try another network |
| `next build` fails with `EISDIR ... readlink` | The repo is on an exFAT drive. Build from an NTFS drive |
| git says "dubious ownership" | Same drive issue: `git -c safe.directory=<repo path> ...` |
| Turbopack: "next/font/google queries have exactly one entry" | Self-host the font with `next/font/local` (already done for Cormorant Garamond) |
| A folder is "Permission denied" after switching branches | A forgotten dev server holds it open. Stop old `next dev` processes |
| Signed in but redirected to onboarding again and again | Your student record is missing a registration number or admission year |
| Dev buttons say the account doesn't exist | Run the seed command above |
