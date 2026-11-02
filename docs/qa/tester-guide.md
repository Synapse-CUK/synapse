# Tester guide

Thanks for testing Synapse. Your job is to use it the way real students and faculty would, try to break it, and report what you find clearly enough that someone else can repeat it.

## Getting started

1. Accept the GitHub invitation to the organisation.
2. Get your logins from the project lead. They're private, so don't share them or post them anywhere.
3. Open the QA site: **`<QA_SITE_URL>`**
4. Follow the [test plan](test-plan.md).

## Your accounts

| Account | Use it to test |
| --- | --- |
| `qaNN-student` | Posting achievements, joining events, profiles |
| `qaNN-faculty` | Verifying achievements, hosting as faculty |
| `qaNN-fresh` | First-time onboarding |
| `qaNN-coordinator` | Admin panel. Lead testers only. |

**These are fake addresses, so no real email arrives.** Sign in with the email and password you were given. If it asks for a verification code, enter `424242`.

Use a private window for your second account, so you can be signed in as a student and faculty at once.

## Ground rules

- This is a test site, so its data can be wiped at any time. Don't enter real personal details.
- Other testers share this site. Coordinators can delete things, so don't delete other people's test data unless you're testing that.
- Never paste passwords into issues. The repo is public.
- Found a way to see private data or get a role you shouldn't have? Don't file a public issue. Follow [SECURITY.md](../../SECURITY.md).
- Stick to testing the app itself, using your own accounts.

## Reporting a bug

1. Search [the issues](../../../../issues), so we don't get duplicates.
2. Go to **Issues**, then **New issue**, then **Bug report**.
3. Fill in every field. A good report lets someone else repeat the bug without asking you anything.

**Good title:** `[Bug] Join button does nothing on phone for CSE-only events`

**Bad title:** `events broken`

### Choosing a severity

| Level | Meaning | Example |
| --- | --- | --- |
| S1 Blocker | Data loss, a security problem, or a main flow can't be used | Can't sign in, or you can see another student's private data |
| S2 Major | A feature is broken, but there's a workaround | Search fails, but you can still scroll to the event |
| S3 Minor | It works, but it's wrong or confusing | Wrong count, or an unclear error |
| S4 Cosmetic | Spelling, layout or styling | Text overflows a card |

## What happens next

The board has five columns: **Reported**, **Confirmed**, **In progress**, **Fixed** and **Verified**.

As a tester you can label, assign and close issues. When something reaches **Fixed**, please retest it on the QA site. If it works, move it to **Verified**. If not, comment with what you saw and move it back to **Confirmed**.

The project lead decides priorities.
