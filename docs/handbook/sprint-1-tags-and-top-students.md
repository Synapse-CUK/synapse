# Sprint 1: Tags and Top Students

**Wednesday 4 November to Wednesday 11 November 2026.** Demo on Wednesday 11 November.

Two features, built by the volunteers. The specs say *what* to build and the rules it must follow; how you build it is up to you.

| | Task 1: Tags | Task 2: Top students by field |
| --- | --- | --- |
| Spec | **Spec: Tags** | **Spec: Top Students by Field** |
| In one line | Students tag an achievement with skills ("React", "TensorFlow"); every tag belongs to one generic field ("Web", "AI & ML") | For any field, list the students with the most verified work in it |
| Team | Team A (2 people suggested) | Team B (2 people suggested) |
| Linear | Project **Sprint 1: Tags and Top Students**, issues T1.x | Same project, issues T2.x |
| Depends on | The roles fix being on `main` | T1.1 (the fields list and the `achievementTags` table) |

## Before you start

- [ ] Read **Start Here**, **Architecture**, **Data Model** and **How We Work**
- [ ] Read `convex/_generated/ai/guidelines.md`
- [ ] Get the app running locally (**Local Development**) and sign in with each of the dev buttons
- [ ] Read your team's spec end to end and ask questions in the Linear issue, not in DMs
- [ ] Put your name in the **Owner** column below and assign yourself in Linear

**Branching:** until the roles fix is merged, branch from `fix/roles-and-onboarding`, not `main`. Once Amal merges it, rebase onto `main`. One branch and one pull request per Linear issue, named with the issue ID (`SYN-40-tags-schema`).

## Day by day

Owner: write your name. Done: tick it when the pull request is merged, not when the code is written.

### Wednesday 4 November: kickoff

| Done | Task | Owner | Linear |
| --- | --- | --- | --- |
| [ ] | Invite volunteers to GitHub (Write), Linear and Notion | Amal | S0.1 |
| [ ] | Kickoff call: walk through the app, this page and both specs; form Team A and Team B | Amal + all | S0.1 |
| [ ] | Everyone: app running locally, both specs read | All | - |

### Thursday 5 November: decisions and schema

| Done | Task | Owner | Linear |
| --- | --- | --- | --- |
| [x] | Decide the field list: **the proposed 11 fields** (decided 4 Nov) | Amal | S0.2 |
| [ ] | Decide tag rules: can students create tags, and the most per achievement | Amal | S0.5 |
| [ ] | Decide what counts for Top students and who can see it | Amal | S0.3 |
| [ ] | Merge the roles fix to `main` | Amal | S0.4 |
| [ ] | T1.1 Fields list and the `tags` and `achievementTags` tables | Team A | T1.1 |
| [ ] | T2.1 `studentFieldStats` table and the recompute helper (start on a branch from T1.1) | Team B | T2.1 |

### Friday 6 November: backend

| Done | Task | Owner | Linear |
| --- | --- | --- | --- |
| [ ] | T1.2 `tags.search`, `tags.listByField`, `tags.create` | Team A | T1.2 |
| [ ] | T1.3 Tags on `createAchievement`, `achievements.setTags`, tags returned with achievements | Team A | T1.3 |
| [ ] | T2.2 Keep stats current on verify, reject, delete and tag changes | Team B | T2.2 |
| [ ] | T2.3 `leaderboard.topStudentsByField` query | Team B | T2.3 |

### Saturday 7 and Sunday 8 November: optional

Catch up, review each other's pull requests, write tests.

### Monday 9 November: frontend

| Done | Task | Owner | Linear |
| --- | --- | --- | --- |
| [ ] | T1.4 Tag picker in the Post achievement dialog | Team A | T1.4 |
| [ ] | T1.5 Tag chips on achievement cards; filter the feed by tag | Team A | T1.5 |
| [ ] | T2.4 Backfill function for existing achievements | Team B | T2.4 |
| [ ] | T2.5 Top students page | Team B | T2.5 |

### Tuesday 10 November: admin, tests, walkthrough

| Done | Task | Owner | Linear |
| --- | --- | --- | --- |
| [ ] | T1.6 Coordinator **Tags** tab: rename, change field, merge | Team A | T1.6 |
| [ ] | T1.7 Tests for tags | Team A | T1.7 |
| [ ] | T2.6 Tests for top students | Team B | T2.6 |
| [ ] | Cross-team walkthrough on localhost: student posts with tags, faculty verifies, the student appears on Top students | Team A + B | S1.1 |

### Wednesday 11 November: demo

| Done | Task | Owner | Linear |
| --- | --- | --- | --- |
| [ ] | Merge everything that's done; Amal checks the live site after the deploy | Amal | S1.1 |
| [ ] | Run the backfill on prod (Amal only: `npx convex run leaderboard:backfill --prod`) | Amal | T2.4 |
| [ ] | Demo and retro: what shipped, what didn't, what to change | All | S1.2 |
| [ ] | Update the wiki: Data Model, Backend Reference, Decision Log, Roadmap | Both teams | S1.3 |

## Definition of done for this sprint

- [ ] A student can add up to 5 tags when posting, and create a new tag if it doesn't exist
- [ ] Tags show on achievement cards; clicking one filters the feed
- [ ] Coordinators can rename, move and merge tags
- [ ] `/top-students` lists the top students for any field, and updates live when an achievement is verified or rejected
- [ ] No private details (email, registration number) on the Top students page
- [ ] New tests in `convex/` pass along with the existing 36; typecheck, lint and build pass
- [ ] Checked at phone width and with every role

## Rules that catch people out

- Never take a user ID from function arguments to decide who is calling. Use `getCurrentUser(ctx)`.
- Throw `ConvexError("message")` for anything a user should read. A plain `Error` shows as "Server Error" on the live site.
- No `.collect()` on a table that can grow; use an index with `.take(n)` or pagination.
- Name indexes after all their fields: `by_field_and_count`, not `by_field`.
- Don't run anything with `--prod`. Only Amal touches the live database.
- Don't build what isn't in the spec. Put ideas in Linear as new issues.

## Stuck?

Write in the Linear issue what you tried and what happened, then ping Amal. Blocked for more than half a day counts as stuck.
