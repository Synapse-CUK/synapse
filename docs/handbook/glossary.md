# Glossary

| Term | Meaning |
| --- | --- |
| Achievement | A post about something a student did, with proof. Pending, verified or rejected |
| Class code | Semester + BT + section, for example `3BTCSE`. Students only |
| Coordinator | Platform admin. Has every faculty power plus the coordinator dashboard |
| Department | A faculty member's section (CSE, IT or IoT) |
| Effective semester | The semester override if set, otherwise worked out from the admission year |
| Event / project / hackathon | Something a team forms around. Shown under "Projects" |
| Field | One of the fixed generic areas a tag belongs to (Web, AI & ML, IoT & Embedded...). Defined in `convex/lib/fields.ts` (Sprint 1) |
| Faculty pending | Someone who asked for faculty access and is waiting for a coordinator |
| Formation mode | How a team forms: "Students apply" (student_choice) or "Host assigns" (faculty_assign) |
| Host | The person who created an event |
| QA site | The live site, https://synapse-cuk.vercel.app, used by testers |
| Section | CSE, IT or IoT |
| Slug | A tag's normalised name used to stop duplicates: `"Next JS"` becomes `next-js` |
| Tag | A skill or tool on an achievement, such as React or Arduino. Max 5 per achievement (Sprint 1) |
| Top students | The ranking of students by verified achievements per field (Sprint 1) |
| XP | Points: +10 for posting, +50 when verified |
| Convex | The backend: database, server functions and file storage |
| Clerk | The sign-in service |
| Deployment (Convex) | A copy of the backend with its own data: dev or prod |
| `admin:setRole` | The command-line tool that grants roles, including coordinator |
| `+clerk_test` | Clerk's test-address format; no real email is sent and the code is 424242 |
| ConvexError | The error type whose message reaches users on the live site |
