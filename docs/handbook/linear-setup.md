# Linear Setup

How the Synapse board in Linear is organised.

## Team

- **Name:** Synapse
- **Key:** SYN (issues are SYN-1, SYN-2, ...)
- **Members:** Amal plus each developer. QA testers stay on GitHub Issues; Amal mirrors confirmed bugs into Linear.

## Workflow states

| State | Means |
| --- | --- |
| Backlog | Known, not planned yet |
| Todo | Planned; ready to pick up |
| In Progress | Someone is on it |
| In Review | Done and waiting for review or for the live check |
| Done | Merged and checked on the live site |
| Canceled | Won't do |

## Projects

| Project | Covers |
| --- | --- |
| Roles & onboarding fix | Coordinator powers, faculty onboarding, readable errors and the related bugs |
| QA rollout | Testers, accounts, test plan, live-site setup |
| Infrastructure & tooling | Local setup, CI, performance, security hardening, repo hygiene |
| Sprint 1: Tags and Top Students | The volunteers' first sprint, 4 to 11 November 2026 (issues S0.x, T1.x, T2.x, S1.x) |
| Roadmap (after QA) | Kanban, team chat, GitHub activity, notifications, social features |

## Labels

| Group | Labels |
| --- | --- |
| Area | Backend, Frontend, Onboarding, Roles, Events, Tags, Leaderboard |
| Type | Bug, Feature, Docs, Process, Release |
| Concern | Security, Performance, Infra, Tooling, QA |
| Status | Blocker, Good first issue |

## Cycles

One-week cycles. At the start of each cycle, pull the Todo issues you'll finish that week into it.

**Sprint 1** is the first cycle and runs Wednesday 4 to Wednesday 11 November 2026. After importing, create the cycle with those dates and add every issue in the project **Sprint 1: Tags and Top Students** to it. Every sprint issue has a due date; the day-by-day list is on the **Sprint 1: Tags and Top Students** page.

## Importing the issues

1. Linear: **Settings → Import / export → CSV**, choose `synapse-linear-issues.csv`, team Synapse.
2. Create the five projects in the table above first, so the Project column matches.
3. Create the labels in the table above, plus **Tags** and **Leaderboard** for the sprint.
4. After import, check a couple of issues: title, description, priority, status, labels, project and due date.

## Linking to GitHub

Install Linear's GitHub integration. Then a branch or pull request with `SYN-12` in its name links to the issue, and merging moves it to Done.
