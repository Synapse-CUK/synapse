# Architecture

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 3 | Almost every page is a client component that reads live data |
| Backend and database | Convex | Queries, mutations, file storage, one HTTP route |
| Auth | Clerk | Development instance, shared by the live QA site and local dev |
| Hosting | Vercel (Hobby) | Deploys from `main` |
| Tests | Vitest + convex-test | `convex/security.test.ts`, 36 tests |

## System context

Who and what Synapse talks to.

```mermaid
flowchart LR
  subgraph People
    S[Student]
    F[Faculty]
    C[Coordinator]
  end
  S & F & C -->|browser| Web[Next.js app on Vercel]
  Web <-->|sign-in, JWT| Clerk[Clerk: accounts and sign-in]
  Web <-->|live queries and mutations over WebSocket| Convex[Convex: database, functions, file storage]
  Clerk -->|webhook: user.created, user.updated| Convex
  GitHub[GitHub repo] -->|push to main| Vercel[Vercel build]
  Vercel -->|npx convex deploy| Convex
  Vercel -->|next build| Web
```

## How the pieces connect

1. The visitor signs in with Clerk, which issues a JWT from its `convex` template.
2. The browser talks **directly** to Convex (`ConvexProviderWithClerk` in `app/ConvexClientProvider.tsx`). The Next.js server doesn't proxy data.
3. Every Convex function finds the caller from the token: `ctx.auth.getUserIdentity().subject` is the Clerk user ID, looked up with `getCurrentUser` in `convex/lib/auth.ts`. **Identity never comes from function arguments.**
4. On first sign-in, `users.ensureUser` creates a student record if the webhook hasn't yet.
5. The Clerk webhook (`convex/http.ts`, verified with Svix) keeps names and emails in sync. It never touches roles.

## Components

Which pages use which backend modules, and which tables those modules own.

```mermaid
flowchart TB
  subgraph Frontend [Next.js app: app/ and components/]
    Guard[OnboardingGuard]
    Onb["/onboarding"]
    Feed["/feed"]
    Prof["/profile/id"]
    Events["/events and /events/id"]
    FacD["/faculty/dashboard"]
    CoD["/coordinator/dashboard"]
  end
  subgraph Backend [Convex functions: convex/]
    U[users.ts]
    A[achievements.ts]
    E[events.ts]
    T[teamMembers.ts]
    Co[coordinator.ts]
    Fi[files.ts]
    Ad[admin.ts: internal only]
    H[http.ts: Clerk webhook]
    Lib[lib/: auth, roles, semester, validators]
  end
  subgraph Tables
    tU[(users)]
    tA[(achievements)]
    tE[(events)]
    tT[(teamMembers)]
    tJ[(joinRequestMessages)]
    tS[(_storage files)]
  end
  Guard --> U
  Onb --> U
  Feed --> A
  Feed --> Fi
  Prof --> U
  Prof --> A
  Events --> E
  Events --> T
  FacD --> A
  CoD --> Co
  U --> tU
  A --> tA
  A --> tU
  E --> tE
  T --> tT
  T --> tJ
  Co --> tU & tA & tE & tT
  Fi --> tS
  H --> U
  Ad --> tU
  U & A & E & T & Co -.-> Lib
```

`convex/lib/` is imported by both the backend and the frontend, so role rules (`roles.ts`) and class codes (`semester.ts`) are worked out the same way everywhere.

## Sign-in and first load

```mermaid
sequenceDiagram
  actor User
  participant Clerk
  participant App as Next.js app
  participant Guard as OnboardingGuard
  participant Convex
  User->>Clerk: Sign in
  Clerk-->>App: Session + JWT (template "convex")
  App->>Convex: users.current (with JWT)
  alt No record yet
    Convex-->>Guard: null
    Guard->>Convex: users.ensureUser
    Convex-->>Convex: Insert user as student (from the token, never from arguments)
    Convex-->>Guard: users.current now returns the record
  else Record exists
    Convex-->>Guard: user
  end
  alt Student missing registration number or admission year
    Guard->>App: Go to /onboarding
  else Everyone else
    Guard->>App: Stay on the page
  end
  Clerk--)Convex: Webhook user.created / user.updated (names and emails only)
```

## Onboarding by role

```mermaid
flowchart TD
  Start[Signed in] --> Need{needsOnboarding?<br/>student without reg. no. or admission year}
  Need -->|No: faculty, faculty pending, coordinator, finished student| Feed["/feed"]
  Need -->|Yes| Form["/onboarding"]
  Form --> Pick{I am a}
  Pick -->|Student| SF[Name, registration no., admission year, section]
  SF --> SC[completeOnboarding: role student, class code worked out]
  Pick -->|Faculty| FF[Name and department only]
  FF --> FP[completeOnboarding: role faculty_pending]
  FP --> Wait[Pending banner until a coordinator approves]
  SC --> Feed
  Wait --> Feed
```

## Roles over time

```mermaid
stateDiagram-v2
  [*] --> student: ensureUser or webhook
  student --> faculty_pending: onboarding, chose Faculty
  faculty_pending --> faculty: coordinator approves
  faculty_pending --> student: coordinator rejects
  student --> coordinator: admin setRole or another coordinator
  faculty --> coordinator: admin setRole or another coordinator
  coordinator --> faculty: another coordinator
  note right of coordinator: Nobody can change their own role
```

## Post and verify an achievement

```mermaid
sequenceDiagram
  actor Student
  actor Reviewer as Faculty or coordinator
  participant Convex
  Student->>Convex: files.generateUploadUrl
  Student->>Convex: Upload proof file to the URL
  Student->>Convex: achievements.createAchievement (title, description, proof)
  Convex-->>Convex: Insert as pending, author +10 XP
  Reviewer->>Convex: achievements.listPending
  Reviewer->>Convex: achievements.updateAchievementStatus (verified or rejected)
  Note over Convex: Refused if the reviewer is the author
  alt Verified
    Convex-->>Convex: Status verified, author +50 XP
  else Rejected
    Convex-->>Convex: Status rejected
  end
```

## Join a team

```mermaid
sequenceDiagram
  actor Student
  actor Host
  participant Convex
  Student->>Convex: teamMembers.requestToJoin(eventId)
  Note over Convex: Students only, event recruiting, "Students apply" mode,<br/>section and semester eligible, team not full, not already in
  Convex-->>Convex: Insert teamMembers as requested
  Student->>Convex: sendJoinRequestMessage
  Host->>Convex: sendJoinRequestMessage
  Note over Student,Host: Only the host and that student can read the thread
  Host->>Convex: respondToJoinRequest(accept or reject)
  alt Accept and room in the team
    Convex-->>Convex: Status accepted
  else Reject
    Convex-->>Convex: Request deleted
  end
```

In "Host assigns" mode, students can't ask. The host picks from `listEligibleStudents` and calls `assignStudent`.

## Planned for Sprint 1 (not built yet)

See **Spec: Tags** and **Spec: Top Students by Field**. New tables `tags`, `achievementTags` and `studentFieldStats`, new modules `tags.ts` and `leaderboard.ts`, and a `/top-students` page.

```mermaid
flowchart LR
  Post[PostAchievementModal: tag picker] --> TagsTs[tags.ts]
  TagsTs --> tTags[(tags)]
  Post --> Ach[achievements.ts]
  Ach --> tAT[(achievementTags)]
  Ach -->|on verify, reject, delete| Stats[lib/fieldStats.ts]
  Stats --> tSFS[(studentFieldStats)]
  Top["/top-students"] --> Lb[leaderboard.ts]
  Lb --> tSFS
```

## Guards

| Where | What it does |
| --- | --- |
| `middleware.ts` (Clerk) | Sends signed-out visitors to `/sign-in`. Public: `/sign-in`, `/sign-up`, `/api/dev-login` (404 outside local dev) |
| `components/OnboardingGuard.tsx` | Creates a missing record, and sends students without academic details to `/onboarding` |
| Each page | Shows a "not for you" screen when the role doesn't fit |
| Each Convex function | The real check. Pages only hide things; the server refuses them |

## Security rules

- Role checks happen in Convex functions, using `convex/lib/roles.ts`.
- Private details (email, registration number) only go to the owner and coordinators. Feeds and events never include emails or Clerk IDs.
- Operator tools (`admin:*`) are internal functions, callable only from the Convex dashboard or command line.
- Errors meant for users are `ConvexError`. Production hides the text of any other error.
- Security bugs are reported privately (`SECURITY.md`), never in a public issue.

## Repo layout

| Path | Contents |
| --- | --- |
| `app/` | Pages (App Router) and `api/dev-login` |
| `components/` | Shared UI |
| `convex/` | Schema and server functions |
| `convex/lib/` | Shared auth, roles, semester and validators (also imported by the frontend) |
| `lib/errors.ts` | Turns Convex errors into user-facing messages |
| `scripts/seed-qa-users.mjs` | Creates QA accounts in Clerk and Convex |
| `docs/qa/` | Tester guide and test plan |
| `public/landing/` | The sign-in page photo |
| `app/fonts/` | Self-hosted Cormorant Garamond |
