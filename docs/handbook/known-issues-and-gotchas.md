# Known Issues and Gotchas

Open problems are tracked in Linear. This page explains the ones that surprise people.

## Product issues (open)

| Issue | Effect | Linear project |
| --- | --- | --- |
| The roles fix isn't on `main` yet | Live site: coordinators lack faculty powers, faculty asked for a registration number, errors show as "Server Error". Fixed on `fix/roles-and-onboarding`; branch from it for Sprint 1 work | Roles & onboarding fix |
| Deleting an achievement keeps its XP and file | XP totals can be inflated; storage fills up | Roles & onboarding fix |
| Proof and GitHub links accept any text | A bad link can appear as a clickable link | Roles & onboarding fix |
| No server-side limits on titles, team size, deadline | Direct calls can create odd events | Roles & onboarding fix |
| `ALLOWED_EMAIL_DOMAIN` only warns | Any email can sign up | Infrastructure & tooling |
| Large lists load whole tables | Fine for QA, slow at scale | Infrastructure & tooling |
| Admission year picker covers 7 years | Older years can't be chosen | Roles & onboarding fix |

## Development gotchas

**Production hides error messages.** On the live site, Convex replaces the text of any plain `Error` with "Server Error". Throw `ConvexError("...")` for anything a user should read, and show it with `errorMessage(err)`.

**Two databases.** Localhost uses the dev database; the live site uses prod. If "my data is missing", check which one you're looking at.

**Coordinator is granted outside the app.** Use `admin:setRole` (dashboard or command line). The app never lets someone promote themselves.

**exFAT drive.** On an exFAT drive, `next build` fails with `EISDIR readlink` and git complains about ownership. Use an NTFS drive.

**Convex CLI "fetch failed".** If the browser reaches Convex but `npm run convex:dev` doesn't, a conda environment or proxy setting is usually the cause.

**Turbopack and Google Fonts.** Google can serve fonts from URLs Turbopack can't parse. Self-host with `next/font/local`.

**Stale dev servers on Windows.** A forgotten `next dev` can hold folders open and break git checkouts. Stop old servers before switching branches.

**Pushes deploy.** Merging to `main` puts the change on the live QA site within a minute.
