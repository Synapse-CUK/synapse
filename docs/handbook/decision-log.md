# Decision Log

Add a row whenever the team decides something that someone might later ask "why?" about.

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-03 | Move the repo to a public GitHub org with 3 to 5 student testers | Vercel Hobby only deploys public org repos; test with real students before launch |
| 2026-11-03 | Roles live only in Convex; coordinator only via `admin:setRole` | Clerk metadata can be written from the browser; stops self-promotion |
| 2026-11-03 | QA site uses Convex prod with the Clerk development instance | `+clerk_test` addresses and code 424242 work for testers |
| 2026-11-03 | Private details only for the owner and coordinators | Student privacy |
| 2026-11-04 | Christ University palette and Cormorant Garamond headings | Match the university's own site |
| 2026-11-04 | No public landing page; light mode only | Product decision by Amal |
| 2026-11-04 | Every finished change is pushed to `main` | Keep the QA site current |
| 2026-11-04 | Local test logins use Clerk sign-in tickets, not hardcoded passwords | The repo is public and `main` deploys live |
| 2026-11-04 | Self-host Cormorant Garamond | Turbopack couldn't load it from Google |
| 2026-11-04 | Coordinators get every faculty power | Product decision by Amal |
| 2026-11-04 | Faculty onboarding asks only for name and department | Registration numbers are a student concept |
| 2026-11-04 | Only students join teams; class codes only for students | Faculty have no semester |
| 2026-11-04 | User-facing errors use ConvexError | Production hides plain error messages |
| 2026-11-04 | Linear for tasks, Notion for docs, GitHub Issues for QA bugs | Team can manage its own work |
| 2026-11-04 | The roles fix waits on branch `fix/roles-and-onboarding` until the browser walkthrough | Only `main` deploys; don't ship untested role changes to testers |
| 2026-11-04 | Sprint 1 (to 11 November): Tags and Top students by field, built by volunteers from specs | Amal's call: the team builds, specs give the rules |
| 2026-11-04 | Tags go in an `achievementTags` table, not an array on the achievement | Convex can't index inside arrays; filtering and counting need an index |
| 2026-11-04 | Generic fields: AI & ML, Web, Mobile, IoT & Embedded, Cloud & DevOps, Data, Security, Design & UX, Competitive Programming, Research, Other | Amal accepted the proposal; covers the work the three sections do, with Other as a catch-all |
| 2026-11-04 | Field scores are recomputed, not incremented | Recomputing can't drift if an update is missed or repeated |
