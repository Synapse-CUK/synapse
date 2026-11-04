# How We Work

## Where things live

| What | Where |
| --- | --- |
| Tasks, bugs, features, priorities | Linear (team Synapse) |
| Explanations, decisions, how-tos | Notion (this wiki) |
| Code and bugs from QA testers | GitHub `Synapse-CUK/synapse` |
| Secrets (keys, test passwords) | Never in any of these. Ask Amal |

## Picking up work

1. Pick an issue in Linear from **Todo** (or ask Amal). Assign it to yourself.
2. Move it to **In Progress**.
3. Anything new you find goes in Linear as a new issue, not into the current one.

## Doing the work

- **Branch:** `type/short-name`, for example `fix/coordinator-verify` or `feat/kanban`. Put the Linear ID in the branch name (`SYN-12-kanban`) so Linear links it.
- **Commits:** short sentence in the imperative ("Let coordinators verify achievements"). Explain why in the body when it isn't obvious.
- **Convex:** read `convex/_generated/ai/guidelines.md` first. Check the caller in every function; never trust a user ID from arguments. Throw `ConvexError` for user-facing messages.
- **Tests:** every new permission rule gets a test in `convex/security.test.ts`.
- **UI:** use the shared components and tokens (see Frontend and Design). Loading, empty and error states for every list.

## Finishing

Definition of done:

- [ ] `npm run typecheck`, `npm run lint`, `npm test` and `npm run build` pass
- [ ] Tried in the browser on localhost with every role it affects, with the console open
- [ ] Works at phone width
- [ ] Docs updated (this wiki, README, or the QA test plan) if behaviour changed
- [ ] Pull request to `main` with the Linear ID; move the issue to **In Review**
- [ ] After merging and the deploy finishes, check it on the live QA site; move the issue to **Done**

## Releases

Merging to `main` deploys to the live QA site automatically (frontend and Convex functions). There's no separate release step, so only merge finished work.

## Priorities

| Linear priority | Means |
| --- | --- |
| Urgent | Blocks testing or other work, or a security problem. Drop other work |
| High | Needed for the current milestone |
| Medium | Should happen soon |
| Low | Nice to have |
