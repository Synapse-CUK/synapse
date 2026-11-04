# Backend Reference

Every Convex function, who may call it and what it does. "Signed in" means the caller has a Clerk session. Functions marked **internal** can only be run from the Convex dashboard or command line.

Before changing anything here, read `convex/_generated/ai/guidelines.md`.

## users.ts

| Function | Type | Who | What it does |
| --- | --- | --- | --- |
| current | query | Anyone | Your own record plus `effectiveSemester` and `classCode` (null for non-students). Null when signed out |
| ensureUser | mutation | Signed in | Creates a student record from your token if none exists. Safe to repeat; never changes an existing record |
| completeOnboarding | mutation | Signed in | Saves name, section and email. Students must give registration no. and admission year. Choosing faculty gives `faculty_pending`. Approved faculty and coordinators keep their role |
| updateProfile | mutation | Signed in, own profile | Section, email, bio, skills. Registration no., admission year and semester override (1 to 8) only for students |
| getUserProfile | query | Signed in | A profile with achievement counts. Email and registration no. only for the owner and coordinators |
| syncUser | internal | Clerk webhook | Updates name and email; creates a student record for a new user |

## achievements.ts

| Function | Type | Who | What it does |
| --- | --- | --- | --- |
| createAchievement | mutation | Signed in | New pending achievement with an upload or a link. +10 XP |
| listFeed | query | Signed in | Pending and verified achievements, newest first, with author summary |
| listByUser | query | Signed in | One user's achievements |
| listPending | query | Faculty, coordinators | The verification queue. Empty for everyone else |
| updateAchievementStatus | mutation | Faculty, coordinators | Verify or reject once; never your own. Verify gives +50 XP |

## events.ts

| Function | Type | Who | What it does |
| --- | --- | --- | --- |
| createEvent | mutation | Signed in | New event in "recruiting". The host joins as "Faculty Mentor" (faculty and coordinators) or "Project Lead" |
| listEvents | query | Signed in | All events with host summary and member counts |
| getEvent | query | Signed in | One event with members and requests. No contact details |
| updateEventStatus | mutation | Host | recruiting, in_progress or completed |

## teamMembers.ts

| Function | Type | Who | What it does |
| --- | --- | --- | --- |
| requestToJoin | mutation | Students | Ask to join a "Students apply" event that is recruiting, if the section, semester and capacity allow |
| respondToJoinRequest | mutation | Host | Accept (checks capacity) or reject (deletes the request) |
| sendJoinRequestMessage | mutation | Host, applicant | Chat on a pending request |
| listJoinRequestMessages | query | Host, applicant | Read that chat |
| assignStudent | mutation | Host | Add an eligible student directly in "Host assigns" mode |
| listEligibleStudents | query | Host, coordinators | Students who fit the event. Registration numbers only for faculty and coordinators |
| listMyTeams | query | Signed in | Events you host or are an accepted member of |
| updateGithubUsername | mutation | That member | Set your own GitHub username on a team |

## coordinator.ts

All coordinator only.

| Function | Type | What it does |
| --- | --- | --- |
| listPendingFacultyRequests | query | Users waiting for faculty approval |
| approveFacultyRequest | mutation | faculty_pending becomes faculty |
| rejectFacultyRequest | mutation | faculty_pending becomes student |
| listAllUsers | query | Every user, filtered by role, section and search |
| updateUserRole | mutation | Set anyone's role except your own |
| listAllEvents | query | Every event with host and counts |
| deleteEvent | mutation | Deletes an event and its messages, members, cards, chat and activity |
| forceUpdateEventStatus | mutation | Change any event's status |
| listAllAchievements | query | Every achievement with author |
| deleteAchievement | mutation | Deletes an achievement (XP and the proof file are not yet undone; see Linear) |
| getPlatformStats | query | Counts for the overview tab |

## files.ts

| Function | Type | Who | What it does |
| --- | --- | --- | --- |
| generateUploadUrl | mutation | Signed in | Short-lived URL for uploading a proof file |

## admin.ts (internal)

| Function | What it does | Example |
| --- | --- | --- |
| setRole | Set a role by email | `npx convex run --prod admin:setRole '{"email":"a@b.c","role":"coordinator"}'` |
| seedQaUser | Create or update a QA account's record | Used by `scripts/seed-qa-users.mjs` |
| resetAllData | Delete everything. Refuses unless `ALLOW_DATA_RESET=true` (dev only) | `npx convex run admin:resetAllData` |

## http.ts

| Route | What it does |
| --- | --- |
| POST /clerk-users-webhook | Verifies the Svix signature, then calls `syncUser` for `user.created` and `user.updated`. `ALLOWED_EMAIL_DOMAIN` currently only logs a warning |

## Shared helpers (convex/lib)

| File | Exports |
| --- | --- |
| auth.ts | `getCurrentUser(ctx)` |
| roles.ts | `hasFacultyAccess`, `isStudent`, `hasStudentDetails`, `needsOnboarding`, `ROLE_META`, `Role` |
| semester.ts | `computeCurrentSemester`, `getEffectiveSemester`, `getClassCode`, `getAcademicInfo` |
| validators.ts | `SECTIONS`, `sectionValidator`, `roleValidator` |

## Conventions

- Throw `ConvexError("message")` for anything a user can fix. Show it with `errorMessage(err)` from `lib/errors.ts`.
- Look the caller up from the token, never from arguments.
- Add a test to `convex/security.test.ts` for every new permission rule.
