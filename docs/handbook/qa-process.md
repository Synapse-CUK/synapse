# QA Process

3 to 5 student testers try the live QA site and report bugs. Testers don't write code.

## Accounts

`node scripts/seed-qa-users.mjs --testers 5` creates, for each tester:

| Account | Use it for |
| --- | --- |
| `qaNN-student` | Posting achievements, joining teams, profiles |
| `qaNN-faculty` | Verifying achievements, hosting as faculty |
| `qaNN-fresh` | First-time onboarding (student or faculty path) |
| `qaNN-coordinator` | Coordinator dashboard. Lead tester only |

- The addresses use Clerk's `+clerk_test` format, so no real email is sent. The verification code is always `424242`.
- Logins are saved to `qa-credentials.local.csv`, which is never committed. Send each tester **only their own rows**, privately.
- Use a private window for a second account.

## Ground rules

- The QA site's data can be wiped. Don't enter real personal details.
- Testers share the site. Don't delete other people's test data unless you're testing that.
- Never paste passwords into an issue. The repo is public.
- Found a way to see private data or get a role you shouldn't? Don't file a public issue: follow `SECURITY.md`.

## Reporting a bug

1. Search existing issues first.
2. GitHub: **Issues → New issue → Bug report**, and fill every field.
3. Good title: `[Bug] Join button does nothing on phone for CSE-only events`. Bad title: `events broken`.

| Severity | Meaning | Example |
| --- | --- | --- |
| S1 Blocker | Data loss, security problem, or a main flow unusable | Can't sign in; can see another student's private data |
| S2 Major | Broken feature with a workaround | Search fails, but scrolling works |
| S3 Minor | Works, but wrong or confusing | Wrong count, unclear error |
| S4 Cosmetic | Spelling, layout, styling | Text overflows a card |

## Bug lifecycle

Reported → Confirmed → In progress → Fixed → Verified.

When a bug reaches **Fixed**, the tester retests it on the QA site. If it works, they move it to **Verified**. If not, they comment and move it back to **Confirmed**. Confirmed bugs are mirrored into Linear by the project lead.

## Test plan

The checklist is `docs/qa/test-plan.md` in the repo. It covers sign-in and onboarding, faculty requests, profiles, achievements, events and teams, the coordinator panel, access checks, and phone use.

**Note:** sections 1 and 2 still describe the old faculty onboarding (with a registration number). Update them when the roles fix ships (tracked in Linear).
