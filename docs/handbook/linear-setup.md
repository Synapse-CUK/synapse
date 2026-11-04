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
| Roadmap (after QA) | Kanban, team chat, GitHub activity, notifications, social features |

## Labels

| Group | Labels |
| --- | --- |
| Area | Backend, Frontend, Onboarding, Roles, Events |
| Type | Bug, Feature, Docs, Process, Release |
| Concern | Security, Performance, Infra, Tooling, QA |
| Status | Blocker, Good first issue |

## Cycles

One-week cycles, starting Monday. At the start of each cycle, pull the Todo issues you'll finish that week into it.

## Linking to GitHub

Install Linear's GitHub integration. Then a branch or pull request with `SYN-12` in its name links to the issue, and merging moves it to Done.
