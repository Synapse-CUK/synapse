# Test plan

Work through each section with the account listed. If a step fails, file a bug and carry on. Try each area on a phone as well as a desktop.

Known problems are already in the issues, so check there before filing.

## 1. Sign-in and onboarding (`fresh` account)

- [ ] Sign in with your email and password
- [ ] You land on onboarding, not the feed
- [ ] Empty name or registration number is refused with a clear message
- [ ] The class code preview changes when you change section or admission year
- [ ] Choose each of CSE, IT and IoT. The code matches (for example `3BTCSE`)
- [ ] Finish as a student. You land on the feed
- [ ] Sign out, then sign back in. You skip onboarding

## 2. Requesting faculty access (`fresh` account of a different tester, or a new sign-up)

- [ ] Choose Faculty Member during onboarding. You see the approval notice
- [ ] You see a pending banner after finishing
- [ ] `/faculty/dashboard` says access is pending
- [ ] A coordinator can approve you, and you then get the dashboard
- [ ] A coordinator can reject another request, and that user becomes a student

## 3. Profile (`student` account)

- [ ] Your profile shows the right name, section, class code and XP
- [ ] Edit your bio and skills. They save and stay after a refresh
- [ ] Change your section to each of CSE, IT and IoT. Badges update everywhere
- [ ] Semester override rejects 0, 9 and 2.5, with a clear message
- [ ] You can see your own email and registration number
- [ ] On **another** user's profile, you can't see their email or registration number
- [ ] A made-up URL like `/profile/abc` shows a friendly error

## 4. Achievements (`student`, then `faculty`)

- [ ] Post an achievement with a title and description. It appears in the feed as pending
- [ ] Your XP goes up by 10
- [ ] Post one with an image and one with a PDF. Both can be opened
- [ ] Try very long text, emoji and an empty title
- [ ] As faculty, the achievement is in the verification queue
- [ ] Verify it. The student's XP goes up by 50, once only
- [ ] Reject a different one. It leaves the feed
- [ ] Post one as faculty. You can't verify your own
- [ ] As a student, `/faculty/dashboard` is refused

## 5. Events and teams (`student` and `faculty`)

- [ ] Host an event in Student Choice mode
- [ ] Host events restricted to CSE, IT and IoT, and to specific semesters
- [ ] Search and filter the events list
- [ ] From another account, request to join. It's shown as pending
- [ ] Exchange messages on the join request as host and applicant
- [ ] A third account can't see those messages
- [ ] Accept one request and reject another
- [ ] The team can't go over its size cap
- [ ] A student outside the section or semester can't join
- [ ] In Faculty Assignment mode, the host can assign a student directly
- [ ] Only the host sees the student list and controls
- [ ] Change the status through recruiting, in progress and completed
- [ ] Add your GitHub username. You can't edit anyone else's
- [ ] A made-up URL like `/events/abc` shows a friendly error

## 6. Coordinator panel (`coordinator` account, lead testers only)

- [ ] The overview stats match what you see elsewhere
- [ ] Approve and reject faculty requests
- [ ] Search and filter users by name, email, role and section
- [ ] Change a test user's role, then change it back
- [ ] Force an event's status, and delete a test event
- [ ] Delete a test achievement
- [ ] As a student, `/coordinator/dashboard` is refused

## 7. Access checks (any account)

- [ ] Signed out, `/feed`, `/events` and `/profile/...` send you to sign-in
- [ ] Editing a URL doesn't reveal someone else's private data
- [ ] Refresh on every page. Nothing breaks or stays stuck on loading

## 8. Phone and general use

- [ ] Every page can be used at phone width, with no sideways scrolling
- [ ] Forms can be filled in with the phone keyboard open
- [ ] Open the same page in two windows. Updates appear without a refresh
- [ ] Try it on slow mobile data
- [ ] Use the browser back button in the middle of a flow
