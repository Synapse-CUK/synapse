# Roadmap

Dates are targets, not promises. The live list is in Linear.

## Now: finish the roles and onboarding fix

- Unblock the Convex command line on Amal's machine
- Reset the dev database, walk through every role in the browser
- Ship: coordinator powers, faculty onboarding, readable errors, students-only teams
- Fix: achievement deletion (XP and files), link validation, server-side limits

## Next: QA rollout

- Make Amal coordinator on the live site
- Update the tester guide and test plan
- Seed accounts for 3 to 5 testers and run a full test round
- Triage, fix and verify what they find

## Then: hardening

- Decide on college-email-only sign-up and enforce it
- Bound large queries; counters for stats
- Pull-request workflow with CI before every deploy

## Later: features

| Feature | Notes |
| --- | --- |
| Kanban board per team | Table exists (`kanbanCards`) |
| Team chat | Table exists (`teamChat`), with room for an AI assistant |
| GitHub commit activity | Table exists (`commitActivity`); members already save GitHub usernames |
| Notifications | Verified or rejected, join requests, accepted |
| Social features | Following, endorsements, richer profiles. Deferred until after QA |
