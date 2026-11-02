# Contributing

## Testers

You don't need to write code. Read the [tester guide](docs/qa/tester-guide.md), work through the [test plan](docs/qa/test-plan.md), and file issues using the bug report form.

## Developers

1. Branch from `main`.
2. Make your change and add tests for it.
3. Run `npm run typecheck`, `npm run lint` and `npm test`.
4. Open a pull request. CI must pass, and the project lead reviews it.

Merging to `main` deploys to the QA site.

## Rules for Convex code

Read `convex/_generated/ai/guidelines.md` first.

- Treat every public `query` and `mutation` as open to the internet. The browser checks are for display only.
- Get the caller from `getCurrentUser` in `convex/lib/auth.ts`, never from an argument.
- Use `internalMutation` for anything only the server should call.
- Don't return `email`, `universityEmail`, `registrationNumber` or `clerkId` to other users.
- Queries return `null` or `[]` for signed-out callers, because pages can render before sign-in finishes. Mutations throw.
- Never read roles from Clerk metadata. Users can write to it from the browser.

Add negative tests for permission changes in `convex/security.test.ts`: the wrong user gets refused.

## Secrets

Never commit `.env.local`, QA logins or real student data. This repo is public.
