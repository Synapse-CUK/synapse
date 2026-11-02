"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionBadgeClass } from "@/components/sectionUi";

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
    <div className="pt-3 border-t border-slate-200/80 space-y-3 font-sans">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
        <span className="flex items-center gap-1.5">
          <Icons.Activity className="w-3.5 h-3.5 text-teal-600" />
          Pre-Accept Chat
        </span>
        <span className="text-[10px] text-slate-400">{messages?.length || 0} msgs</span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
        {messages === undefined ? (
          <p className="text-slate-400 italic">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-slate-400 italic">No messages yet. Chat with the host/applicant below!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between font-mono text-[10px]">
                <span className="font-bold text-slate-900">
                  {msg.sender?.name || "User"} ({msg.sender?.classCode || msg.sender?.section})
                </span>
                <span className="text-slate-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-slate-700 font-sans">{msg.message}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          placeholder="Type message to host/applicant..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:border-teal-500"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="px-3.5 py-1.5 rounded-xl gradient-teal text-white font-bold text-xs shadow-sm hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}

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
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (event === null) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Event Not Found</h1>
        <Link href="/events" className="inline-block px-6 py-3 gradient-teal text-white font-bold rounded-xl">Back to Events</Link>
      </div>
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

  async function handleStatusChange(status: "recruiting" | "in_progress" | "completed") {
    try {
      setFeedback(null);
      await updateEventStatus({ eventId, status });
      setFeedback({ text: `Status updated to ${status}`, type: "success" });
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    }
  }

  async function handleRequestJoin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await requestToJoin({ eventId, role: desiredRole.trim() });
      setFeedback({ text: "Join request submitted! Awaiting host review.", type: "success" });
      setDesiredRole("");
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    } finally { setIsSubmitting(false); }
  }

  async function handleRespondRequest(teamMemberId: Id<"teamMembers">, response: "accept" | "reject") {
    try {
      await respondToJoinRequest({ teamMemberId, response });
      setFeedback({ text: response === "accept" ? "Student accepted!" : "Request rejected.", type: response === "accept" ? "success" : "error" });
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    }
  }

  async function handleAssignStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAssignStudentId) return;
    try {
      setIsSubmitting(true);
      await assignStudent({ eventId, userId: selectedAssignStudentId as Id<"users">, role: assignRole || "Contributor" });
      setFeedback({ text: "Student assigned!", type: "success" });
      setSelectedAssignStudentId("");
      setAssignRole("");
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    } finally { setIsSubmitting(false); }
  }

  async function handleSaveGithub(teamMemberId: Id<"teamMembers">) {
    try {
      await updateGithubUsername({ teamMemberId, githubUsername: githubInput });
      setEditingGithubMemberId(null);
      setFeedback({ text: "GitHub username saved!", type: "success" });
    } catch (err: any) {
      setFeedback({ text: err.message, type: "error" });
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header Card */}
      <div className="social-card card-shadow-md overflow-hidden">
        <div className="h-3 gradient-teal" />

        <div className="p-6 sm:p-8">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {event.status === "recruiting" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold badge-recruiting">
                <Icons.Rocket className="w-3.5 h-3.5" /> Recruiting
              </span>
            ) : event.status === "in_progress" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                <Icons.Activity className="w-3.5 h-3.5" /> In Progress
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600">
                <Icons.Check className="w-3.5 h-3.5" /> Completed
              </span>
            )}

            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${sectionBadgeClass(event.eligibilityFilter)}`}>
              <SectionIcon section={event.eligibilityFilter} className="w-3.5 h-3.5" />
              {event.eligibilityFilter === "all" ? "All Sections" : `${event.eligibilityFilter} Only`}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
              <Icons.Sparkles className="w-3.5 h-3.5" />
              {event.eligibleSemesters === "all" || !event.eligibleSemesters
                ? "All Semesters Eligible"
                : `Eligible: Sem ${Array.isArray(event.eligibleSemesters) ? event.eligibleSemesters.join(", ") : event.eligibleSemesters}`}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-700">
              {event.formationMode === "student_choice" ? "Student Choice" : "Faculty Assignment"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            {event.title}
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-5">{event.description}</p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {event.techStack.map((tech, i) => (
              <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-teal-700">
                [{tech}]
              </span>
            ))}
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Icons.Faculty className="w-4 h-4" />
              <span className="font-medium">{event.host?.name} ({event.host?.classCode})</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Icons.Users className="w-4 h-4" />
              <span>{acceptedMembers.length}/{event.teamSizeCap} members</span>
            </span>

            {event.githubRepoUrl && (
              <a href={event.githubRepoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-teal-600 font-semibold hover:underline">
                <Icons.Github className="w-4 h-4" />
                Repository
              </a>
            )}

            {/* Host Status Toggle */}
            {isHost && (
              <div className="flex items-center gap-1 ml-auto bg-slate-100 rounded-xl p-1">
                {(["recruiting", "in_progress", "completed"] as const).map((st) => (
                  <button key={st} onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      event.status === st ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                    }`}>
                    {st === "in_progress" ? "In Progress" : st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`mt-5 p-4 rounded-xl text-sm font-medium border ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>{feedback.text}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Team Roster */}
        <div className="lg:col-span-2 space-y-5">
          <div className="social-card card-shadow p-6 space-y-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Icons.Users className="w-5 h-5 text-slate-600" />
              Team Members
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-sm font-semibold">
                {acceptedMembers.length}/{event.teamSizeCap}
              </span>
            </h2>

            {/* Capacity Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isTeamFull ? "bg-amber-400" : "gradient-teal"}`}
                style={{ width: `${(acceptedMembers.length / event.teamSizeCap) * 100}%` }}
              />
            </div>

            {/* Members List */}
            <div className="space-y-3">
              {acceptedMembers.map((member) => {
                const isSelf = member.userId === dbUser?._id;
                const isEditing = editingGithubMemberId === member._id;
                const initials = member.user?.name?.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase() || "?";

                return (
                  <div key={member._id} className="flex items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{member.user?.name || "Student"}</span>
                          {member.user?.classCode && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                              {member.user.classCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-teal-600 font-semibold">{member.role}</p>
                      </div>
                    </div>

                    {/* GitHub */}
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="github_user" value={githubInput}
                          onChange={(e) => setGithubInput(e.target.value)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-teal-500 w-32" />
                        <button onClick={() => handleSaveGithub(member._id)}
                          className="px-3 py-1.5 rounded-lg gradient-teal text-white text-xs font-bold">Save</button>
                        <button onClick={() => setEditingGithubMemberId(null)} className="text-slate-400 hover:text-slate-600">
                          <Icons.X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs shrink-0">
                        {member.githubUsername ? (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                            <Icons.Github className="w-3.5 h-3.5" /> @{member.githubUsername}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No GitHub</span>
                        )}
                        {isSelf && (
                          <button onClick={() => { setEditingGithubMemberId(member._id); setGithubInput(member.githubUsername || ""); }}
                            className="text-teal-600 hover:text-teal-700 font-semibold text-xs">
                            Edit
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {acceptedMembers.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-4">No team members yet.</p>
              )}
            </div>
          </div>

          {/* Student Choice: Join Form & Pending Pre-Accept Chat */}
          {event.formationMode === "student_choice" && !isAcceptedMember && !isHost && (
            <div className="social-card card-shadow p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Request to Join</h3>
              {!isEligible ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium flex items-start gap-3">
                  <Icons.Shield className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Academic Eligibility Restricted</p>
                    <p className="text-sm mt-0.5 font-normal">
                      This event requires <strong>{event.eligibilityFilter}</strong> section & Semesters{" "}
                      <strong>
                        {event.eligibleSemesters === "all" || !event.eligibleSemesters
                          ? "All"
                          : Array.isArray(event.eligibleSemesters)
                          ? event.eligibleSemesters.join(", ")
                          : event.eligibleSemesters}
                      </strong>. Your current class code is <strong>{dbUser?.classCode || `${dbUser?.section} · Sem ${dbUser?.effectiveSemester}`}</strong>.
                    </p>
                  </div>
                </div>
              ) : isPendingMember ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium flex items-center gap-3">
                    <Icons.Pending className="w-5 h-5 shrink-0" />
                    <span>Your join request is pending host review for role: <strong>{myMemberRecord?.role}</strong></span>
                  </div>

                  {myMemberRecord && (
                    <JoinRequestChatThread teamMemberId={myMemberRecord._id} />
                  )}
                </div>
              ) : isTeamFull ? (
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-sm">
                  Team capacity has been reached ({event.teamSizeCap} members).
                </div>
              ) : (
                <form onSubmit={handleRequestJoin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-slate-700">Your Desired Role <span className="text-teal-600">*</span></label>
                    <input type="text" placeholder="e.g. Frontend Engineer, ML Researcher, Embedded Dev" value={desiredRole}
                      onChange={(e) => setDesiredRole(e.target.value)} className="input-field" required />
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 gradient-teal text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition disabled:opacity-50">
                    {isSubmitting ? "Submitting..." : "Submit Join Request"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Host: Pending Requests with Pre-Accept Chat */}
          {isHost && event.formationMode === "student_choice" && (
            <div className="social-card card-shadow p-5 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center justify-between">
                Pending Requests
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </h3>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No pending requests.</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div key={req._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-slate-900">{req.user?.name || "Student"}</p>
                          <p className="text-xs text-teal-600 font-semibold">Role: {req.role}</p>
                          {req.user && (
                            <span className="inline-block mt-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                              {req.user.classCode || `${req.user.section} · Sem ${req.user.effectiveSemester}`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pre-accept chat component for host */}
                      <JoinRequestChatThread teamMemberId={req._id} />

                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                        <button onClick={() => handleRespondRequest(req._id, "accept")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm">
                          <Icons.Check className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button onClick={() => handleRespondRequest(req._id, "reject")}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition">
                          <Icons.X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Host: Assign Student */}
          {isHost && event.formationMode === "faculty_assign" && (
            <div className="social-card card-shadow p-5 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Icons.Faculty className="w-5 h-5 text-purple-600" />
                Assign Student
              </h3>
              <form onSubmit={handleAssignStudent} className="space-y-3">
                <select value={selectedAssignStudentId}
                  onChange={(e) => setSelectedAssignStudentId(e.target.value as Id<"users">)}
                  className="input-field text-sm" required>
                  <option value="">Select Student...</option>
                  {(eligibleStudents || []).map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.registrationNumber || st.section})
                    </option>
                  ))}
                </select>
                <input type="text" placeholder="Assigned role..." value={assignRole}
                  onChange={(e) => setAssignRole(e.target.value)} className="input-field text-sm" required />
                <button type="submit" disabled={isSubmitting || !selectedAssignStudentId}
                  className="w-full py-2.5 rounded-xl gradient-indigo text-white font-bold text-sm hover:opacity-90 transition disabled:opacity-50">
                  Assign to Team
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
