"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionBadgeClass } from "@/components/sectionUi";
import EventStatusChip from "@/components/EventStatusChip";
import { Alert, Avatar, LoadingScreen, SeatMeter, StatusScreen } from "@/components/ui";

function JoinRequestChatThread({ teamMemberId }: { teamMemberId: Id<"teamMembers"> }) {
  const messages = useQuery(api.teamMembers.listJoinRequestMessages, { teamMemberId });
  const sendMessage = useMutation(api.teamMembers.sendJoinRequestMessage);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) return;
    try {
      setIsSending(true);
      await sendMessage({ teamMemberId, message: inputText.trim() });
      setInputText("");
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-line bg-sunken/50 p-3">
      <div className="flex items-center justify-between text-xs font-semibold text-body">
        <span className="flex items-center gap-1.5">
          <Icons.Chat className="h-4 w-4 text-royal" />
          Messages
        </span>
        <span className="tabular-nums text-muted">{messages?.length || 0}</span>
      </div>

      <div className="max-h-56 space-y-2 overflow-y-auto pr-1 text-sm">
        {messages === undefined ? (
          <div className="skeleton h-10 w-full" aria-hidden />
        ) : messages.length === 0 ? (
          <p className="py-2 text-xs text-muted">No messages yet. Ask a question before the request is decided.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="rounded-lg border border-line bg-surface px-3 py-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate font-semibold text-ink">
                  {msg.sender?.name || "User"}{" "}
                  <span className="font-mono font-normal text-muted">
                    {msg.sender?.classCode || msg.sender?.section}
                  </span>
                </span>
                <time className="shrink-0 tabular-nums text-muted">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </time>
              </div>
              <p className="mt-1 text-sm text-body">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <label htmlFor={`chat-${teamMemberId}`} className="sr-only">
          Message
        </label>
        <input
          id={`chat-${teamMemberId}`}
          type="text"
          placeholder="Write a message"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="input-field h-9 flex-1 text-sm"
        />
        <button type="submit" disabled={isSending || !inputText.trim()} className="btn-primary btn-sm h-9">
          Send
        </button>
      </form>
    </div>
  );
}

const STATUS_OPTIONS = [
  { id: "recruiting", label: "Recruiting" },
  { id: "in_progress", label: "In progress" },
  { id: "completed", label: "Completed" },
] as const;

export default function EventWorkspacePage({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.eventId as Id<"events">;

  const dbUser = useQuery(api.users.current);
  const event = useQuery(api.events.getEvent, { eventId });
  const eligibleStudents = useQuery(api.teamMembers.listEligibleStudents, { eventId });

  const updateEventStatus = useMutation(api.events.updateEventStatus);
  const requestToJoin = useMutation(api.teamMembers.requestToJoin);
  const respondToJoinRequest = useMutation(api.teamMembers.respondToJoinRequest);
  const assignStudent = useMutation(api.teamMembers.assignStudent);
  const updateGithubUsername = useMutation(api.teamMembers.updateGithubUsername);

  const [desiredRole, setDesiredRole] = useState("");
  const [selectedAssignStudentId, setSelectedAssignStudentId] = useState<Id<"users"> | "">("");
  const [assignRole, setAssignRole] = useState("");
  const [editingGithubMemberId, setEditingGithubMemberId] = useState<string | null>(null);
  const [githubInput, setGithubInput] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (event === undefined || dbUser === undefined) {
    return <LoadingScreen label="Loading workspace" />;
  }

  if (event === null) {
    return (
      <StatusScreen
        icon={<Icons.Rocket className="h-7 w-7" />}
        title="Event not found"
        action={
          <Link href="/events" className="btn-primary">
            Back to events
          </Link>
        }
      >
        It may have been removed by its host or a coordinator.
      </StatusScreen>
    );
  }

  const isHost = dbUser?._id === event.hostId;
  const acceptedMembers = (event.members || []).filter((m) => m.status === "accepted");
  const pendingRequests = (event.members || []).filter((m) => m.status === "requested");
  const myMemberRecord = (event.members || []).find((m) => m.userId === dbUser?._id);
  const isAcceptedMember = myMemberRecord?.status === "accepted";
  const isPendingMember = myMemberRecord?.status === "requested";

  // Section & Semester Eligibility Checks
  const isSectionEligible = event.eligibilityFilter === "all" || event.eligibilityFilter === dbUser?.section;

  const userEffectiveSem = dbUser?.effectiveSemester || 1;
  const isSemesterEligible =
    !event.eligibleSemesters ||
    event.eligibleSemesters === "all" ||
    (Array.isArray(event.eligibleSemesters) && event.eligibleSemesters.includes(userEffectiveSem));

  const isEligible = isSectionEligible && isSemesterEligible;
  const isTeamFull = acceptedMembers.length >= event.teamSizeCap;

  const semesterLabel =
    event.eligibleSemesters === "all" || !event.eligibleSemesters
      ? "All semesters"
      : `Sem ${Array.isArray(event.eligibleSemesters) ? event.eligibleSemesters.join(", ") : event.eligibleSemesters}`;

  async function handleStatusChange(status: "recruiting" | "in_progress" | "completed") {
    try {
      setFeedback(null);
      await updateEventStatus({ eventId, status });
      setFeedback({ text: `Status updated to ${status.replace("_", " ")}.`, type: "success" });
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    }
  }

  async function handleRequestJoin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await requestToJoin({ eventId, role: desiredRole.trim() });
      setFeedback({ text: "Request sent. The host will review it.", type: "success" });
      setDesiredRole("");
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRespondRequest(teamMemberId: Id<"teamMembers">, response: "accept" | "reject") {
    try {
      await respondToJoinRequest({ teamMemberId, response });
      setFeedback({
        text: response === "accept" ? "Student accepted." : "Request rejected.",
        type: response === "accept" ? "success" : "error",
      });
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    }
  }

  async function handleAssignStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAssignStudentId) return;
    try {
      setIsSubmitting(true);
      await assignStudent({
        eventId,
        userId: selectedAssignStudentId as Id<"users">,
        role: assignRole || "Contributor",
      });
      setFeedback({ text: "Student assigned.", type: "success" });
      setSelectedAssignStudentId("");
      setAssignRole("");
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveGithub(teamMemberId: Id<"teamMembers">) {
    try {
      await updateGithubUsername({ teamMemberId, githubUsername: githubInput });
      setEditingGithubMemberId(null);
      setFeedback({ text: "GitHub username saved.", type: "success" });
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:py-12">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink">
        <Icons.ChevronRight className="h-4 w-4 rotate-180" />
        All events
      </Link>

      {/* Header */}
      <header className="panel relative overflow-hidden p-6 sm:p-10">
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy via-royal to-gold" />

        <div className="flex flex-wrap items-center gap-2">
          <EventStatusChip status={event.status} />
          <span className={sectionBadgeClass(event.eligibilityFilter)}>
            <SectionIcon section={event.eligibilityFilter} className="h-3.5 w-3.5" />
            {event.eligibilityFilter === "all" ? "All sections" : `${event.eligibilityFilter} only`}
          </span>
          <span className="chip-neutral">{semesterLabel}</span>
          <span className="chip-neutral">
            {event.formationMode === "student_choice" ? (
              <Icons.Student className="h-3.5 w-3.5" />
            ) : (
              <Icons.Faculty className="h-3.5 w-3.5" />
            )}
            {event.formationMode === "student_choice" ? "Students apply" : "Host assigns"}
          </span>
        </div>

        <h1 className="display mt-6 max-w-4xl text-4xl md:text-5xl">{event.title}</h1>
        <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-body">{event.description}</p>

        {event.techStack.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {event.techStack.map((tech, i) => (
              <span key={i} className="rounded-md bg-sunken px-2.5 py-1 font-mono text-xs font-medium text-body">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-5 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
            <span className="flex items-center gap-2">
              <Avatar name={event.host?.name} size="sm" />
              <span>
                Hosted by <span className="font-semibold text-ink">{event.host?.name}</span>
                {event.host?.classCode && <span className="ml-1.5 font-mono text-xs">{event.host.classCode}</span>}
              </span>
            </span>
            <span className="flex items-center gap-1.5 tabular-nums">
              <Icons.Users className="h-4 w-4" />
              {acceptedMembers.length} of {event.teamSizeCap} members
            </span>
            {event.githubRepoUrl && (
              <a
                href={event.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-semibold text-royal hover:underline"
              >
                <Icons.Github className="h-4 w-4" />
                Repository
              </a>
            )}
          </div>

          {isHost && (
            <div className="segmented self-start" role="group" aria-label="Event status">
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleStatusChange(st.id)}
                  aria-pressed={event.status === st.id}
                  className={`segment ${event.status === st.id ? "segment-active" : ""}`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {feedback && (
          <Alert tone={feedback.type === "success" ? "success" : "error"} className="mt-6">
            {feedback.text}
          </Alert>
        )}
      </header>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Team */}
        <div className="space-y-6 lg:col-span-2">
          <section className="panel p-6" aria-labelledby="team-heading">
            <div className="flex items-center justify-between gap-4">
              <h2 id="team-heading" className="text-lg font-semibold text-ink">
                Team
              </h2>
              <span className="text-sm tabular-nums text-muted">
                {acceptedMembers.length} of {event.teamSizeCap}
              </span>
            </div>
            <div className="mt-4">
              <SeatMeter filled={acceptedMembers.length} total={event.teamSizeCap} />
            </div>

            <ul className="mt-6 divide-y divide-line">
              {acceptedMembers.map((member) => {
                const isSelf = member.userId === dbUser?._id;
                const isEditing = editingGithubMemberId === member._id;

                return (
                  <li key={member._id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={member.user?.name} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate font-semibold text-ink">{member.user?.name || "Student"}</span>
                          {member.user?.classCode && (
                            <span className="chip-neutral h-5 px-2 font-mono text-[11px]">{member.user.classCode}</span>
                          )}
                        </div>
                        <p className="text-sm text-muted">{member.role}</p>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <label htmlFor={`gh-${member._id}`} className="sr-only">
                          GitHub username
                        </label>
                        <input
                          id={`gh-${member._id}`}
                          type="text"
                          placeholder="github-username"
                          value={githubInput}
                          onChange={(e) => setGithubInput(e.target.value)}
                          className="input-field h-9 w-40 text-sm"
                        />
                        <button onClick={() => handleSaveGithub(member._id)} className="btn-primary btn-sm h-9">
                          Save
                        </button>
                        <button
                          onClick={() => setEditingGithubMemberId(null)}
                          aria-label="Cancel"
                          className="btn-ghost btn-sm h-9 w-9 px-0"
                        >
                          <Icons.X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex shrink-0 items-center gap-2 text-sm">
                        {member.githubUsername ? (
                          <a
                            href={`https://github.com/${member.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chip-neutral h-7 hover:border-line-strong"
                          >
                            <Icons.Github className="h-3.5 w-3.5" />@{member.githubUsername}
                          </a>
                        ) : (
                          <span className="text-xs text-muted">No GitHub linked</span>
                        )}
                        {isSelf && (
                          <button
                            onClick={() => {
                              setEditingGithubMemberId(member._id);
                              setGithubInput(member.githubUsername || "");
                            }}
                            className="btn-ghost btn-sm"
                          >
                            <Icons.Edit className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}

              {acceptedMembers.length === 0 && (
                <li className="py-6 text-center text-sm text-muted">No one has joined yet.</li>
              )}
            </ul>
          </section>

          {/* Student applies */}
          {event.formationMode === "student_choice" && !isAcceptedMember && !isHost && (
            <section className="panel p-6" aria-labelledby="join-heading">
              <h2 id="join-heading" className="text-lg font-semibold text-ink">
                Ask to join
              </h2>
              <div className="mt-4">
                {!isEligible ? (
                  <Alert tone="warning" title="You aren't eligible for this event">
                    It is open to{" "}
                    <strong className="text-ink">
                      {event.eligibilityFilter === "all" ? "all sections" : event.eligibilityFilter}
                    </strong>
                    , {semesterLabel.toLowerCase()}. Your class code is{" "}
                    <strong className="font-mono text-ink">
                      {dbUser?.classCode || `${dbUser?.section} Sem ${dbUser?.effectiveSemester}`}
                    </strong>
                    .
                  </Alert>
                ) : isPendingMember ? (
                  <div className="space-y-4">
                    <Alert tone="info">
                      Your request to join as <strong className="text-ink">{myMemberRecord?.role}</strong> is waiting for
                      the host.
                    </Alert>
                    {myMemberRecord && <JoinRequestChatThread teamMemberId={myMemberRecord._id} />}
                  </div>
                ) : isTeamFull ? (
                  <Alert tone="info">This team is full ({event.teamSizeCap} members).</Alert>
                ) : (
                  <form onSubmit={handleRequestJoin} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label htmlFor="desired-role" className="field-label">
                        The role you want
                      </label>
                      <input
                        id="desired-role"
                        type="text"
                        placeholder="e.g. Frontend, ML research, Embedded firmware"
                        value={desiredRole}
                        onChange={(e) => setDesiredRole(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="btn-primary h-11">
                      {isSubmitting ? "Sending" : "Send request"}
                    </button>
                  </form>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {isHost && event.formationMode === "student_choice" && (
            <section className="panel p-5" aria-labelledby="requests-heading">
              <div className="flex items-center justify-between">
                <h2 id="requests-heading" className="font-semibold text-ink">
                  Join requests
                </h2>
                <span className={pendingRequests.length > 0 ? "chip-gold tabular-nums" : "chip-neutral tabular-nums"}>
                  {pendingRequests.length}
                </span>
              </div>
              {pendingRequests.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No requests waiting.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {pendingRequests.map((req) => (
                    <div key={req._id} className="space-y-3 rounded-xl border border-line p-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={req.user?.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{req.user?.name || "Student"}</p>
                          <p className="text-xs text-muted">
                            {req.role}
                            {req.user && (
                              <span className="ml-1.5 font-mono">
                                {req.user.classCode || `${req.user.section} Sem ${req.user.effectiveSemester}`}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <JoinRequestChatThread teamMemberId={req._id} />

                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleRespondRequest(req._id, "accept")} className="btn-success btn-sm h-9">
                          <Icons.Check className="h-3.5 w-3.5" />
                          Accept
                        </button>
                        <button onClick={() => handleRespondRequest(req._id, "reject")} className="btn-danger btn-sm h-9">
                          <Icons.X className="h-3.5 w-3.5" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {isHost && event.formationMode === "faculty_assign" && (
            <section className="panel p-5" aria-labelledby="assign-heading">
              <h2 id="assign-heading" className="flex items-center gap-2 font-semibold text-ink">
                <Icons.Faculty className="h-4 w-4 text-royal" />
                Assign a student
              </h2>
              <form onSubmit={handleAssignStudent} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="assign-student" className="field-label">
                    Student
                  </label>
                  <select
                    id="assign-student"
                    value={selectedAssignStudentId}
                    onChange={(e) => setSelectedAssignStudentId(e.target.value as Id<"users">)}
                    className="input-field text-sm"
                    required
                  >
                    <option value="">Choose a student</option>
                    {(eligibleStudents || []).map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name} ({st.registrationNumber || st.section})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="assign-role" className="field-label">
                    Role
                  </label>
                  <input
                    id="assign-role"
                    type="text"
                    placeholder="e.g. Hardware lead"
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value)}
                    className="input-field text-sm"
                    required
                  />
                </div>
                <button type="submit" disabled={isSubmitting || !selectedAssignStudentId} className="btn-primary w-full">
                  Add to team
                </button>
              </form>
            </section>
          )}

          <section className="panel p-5">
            <h2 className="label-caps">Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Status</dt>
                <dd className="font-semibold capitalize text-ink">{event.status.replace("_", " ")}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Open to</dt>
                <dd className="text-right font-semibold text-ink">
                  {event.eligibilityFilter === "all" ? "All sections" : event.eligibilityFilter}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Semesters</dt>
                <dd className="text-right font-semibold text-ink">{semesterLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Team size</dt>
                <dd className="font-semibold tabular-nums text-ink">{event.teamSizeCap}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
