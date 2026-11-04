# Frontend and Design

## Pages

| Route | Page | Who |
| --- | --- | --- |
| `/` | Redirects to `/feed` (there's no landing page) | |
| `/sign-in`, `/sign-up` | Clerk forms beside a photo panel (`components/AuthShell.tsx`). On localhost, one-click test logins appear under the form | Signed out |
| `/onboarding` | Student or faculty setup with a live class-code preview | New users |
| `/feed` | Profile summary, "share an achievement" composer, feed | Everyone |
| `/events` | Projects and hackathons: All or My teams, search, status filter, "Host an event" | Everyone |
| `/events/[eventId]` | Event workspace: team, join form or note, requests with chat, assign panel, details, host status control | Everyone |
| `/profile/[userId]` | Profile, stats, skills, achievements, Edit profile (owner) | Everyone |
| `/faculty/dashboard` | Verification queue and XP explainer | Faculty, coordinators |
| `/coordinator/dashboard` | Overview, Faculty approvals, Users, Events, Achievements | Coordinators |

## Key components

| File | What's in it |
| --- | --- |
| `components/ui.tsx` | BrandMark, Avatar, Spinner, Alert, EmptyState, StatusScreen, LoadingScreen, PageHeader, SeatMeter, Modal |
| `components/Icons.tsx` | The project's icon set (20px grid, 1.75 stroke) |
| `components/sectionUi.tsx` | Section colours, SectionIcon, RoleIcon |
| `components/Navbar.tsx` | Links by role, role and class-code chips, XP, account menu |
| `components/OnboardingGuard.tsx` | Creates missing records, sends students to onboarding |
| `components/AchievementCard.tsx` | A feed card with status chip and proof |
| `components/PostAchievementModal.tsx`, `CreateEventModal.tsx`, `EditProfileModal.tsx` | The three main forms |
| `components/DevQuickSignIn.tsx` | Localhost-only test logins |
| `lib/errors.ts` | `errorMessage(err)` for showing Convex errors |

## Design system

**Palette** (from christuniversity.in). Light mode only.

| Token | Colour | Used for |
| --- | --- | --- |
| navy | #0b1f3a | Text, primary buttons, bands |
| royal | #0c4d8b | Links, IT section |
| gold | #d98600 | The one accent: highlights, IoT section |
| gold-soft | #ddae68 | Accents on navy |

**Sections:** CSE is navy, IT is royal blue, IoT is gold.

**Type:** Plus Jakarta Sans for text, Cormorant Garamond for headings (self-hosted in `app/fonts/`), JetBrains Mono for class codes and registration numbers.

**Corners:** cards and panels `rounded-2xl`, buttons and inputs `rounded-xl`, chips fully round, controls inside a group `rounded-lg`.

**Where it lives:** colour tokens in `app/globals.css` (as "R G B"), mapped in `tailwind.config.ts`. Component classes: `.panel`, `.btn-primary` and friends, `.input-field`, `.chip-*`, `.segmented`, `.skeleton`.

**Copy rules**
- No emoji and no em-dashes in visible text.
- Name things the way users would. Buttons say exactly what they do.
- Errors say what went wrong and how to fix it.

**States:** every list has a skeleton while loading, an empty state that says how to add the first item, and inline errors.
