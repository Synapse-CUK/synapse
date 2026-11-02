"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CreateEventModal from "@/components/CreateEventModal";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionBadgeClass } from "@/components/sectionUi";

export default function EventsPage() {
  const dbUser = useQuery(api.users.current);
  const events = useQuery(api.events.listEvents, {});
  const myTeams = useQuery(api.teamMembers.listMyTeams);

  const [activeTab, setActiveTab] = useState<"browse" | "my_teams">("browse");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredEvents = (events || []).filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.techStack.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="social-card card-shadow p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 gradient-teal rounded-full opacity-10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-600">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Team Formation Hub</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Events & Hackathons
            </h1>
            <p className="text-slate-500 text-sm max-w-lg">
              Host projects, form cross-section teams, join hackathons, and collaborate with CSE, IT & IoT students.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 gradient-teal text-white font-bold rounded-2xl shadow-sm hover:opacity-90 transition shrink-0 text-sm"
          >
            <Icons.Plus className="w-5 h-5" />
            Host Event
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="social-card card-shadow p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-100/80 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("browse")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "browse"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Browse All ({events?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("my_teams")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "my_teams"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            My Teams ({myTeams?.length || 0})
          </button>
        </div>

        {/* Search & Filter */}
        {activeTab === "browse" && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:border-teal-500"
            >
              <option value="all">All Status</option>
              <option value="recruiting">Recruiting</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {activeTab === "browse" ? (
        events === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="social-card p-6 animate-pulse space-y-4">
                <div className="w-1/2 h-5 bg-slate-100 rounded-lg" />
                <div className="w-full h-16 bg-slate-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="social-card p-16 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Icons.Rocket className="w-10 h-10 text-teal-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">No Events Found</h3>
              <p className="text-slate-400 text-sm mt-1">Host the first hackathon to start forming student teams!</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 gradient-teal text-white font-bold rounded-xl text-sm shadow-sm hover:opacity-90 transition"
            >
              <Icons.Plus className="w-4 h-4" />
              Host First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const isFull = event.acceptedCount >= event.teamSizeCap;
              const slotsLeft = event.teamSizeCap - event.acceptedCount;
              const pct = Math.round((event.acceptedCount / event.teamSizeCap) * 100);

              return (
                <article key={event._id} className="social-card card-shadow hover:card-shadow-md flex flex-col p-0 overflow-hidden">
                  {/* Card Header */}
                  <div className="p-5 flex-1 space-y-3">
                    {/* Badges Row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.status === "recruiting" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold badge-recruiting">
                          <Icons.Rocket className="w-3.5 h-3.5" />
                          Recruiting
                        </span>
                      ) : event.status === "in_progress" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                          <Icons.Activity className="w-3.5 h-3.5" />
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600">
                          <Icons.Check className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${sectionBadgeClass(event.eligibilityFilter)}`}>
                        <SectionIcon section={event.eligibilityFilter} className="w-3 h-3" />
                        {event.eligibilityFilter === "all" ? "All Sections" : `${event.eligibilityFilter} Only`}
                        {event.eligibleSemesters && event.eligibleSemesters !== "all" && Array.isArray(event.eligibleSemesters)
                          ? ` · Sem ${event.eligibleSemesters.join(", ")}`
                          : ""}
                      </span>
                    </div>

                    {/* Host */}
                    <p className="text-xs text-slate-400">
                      by <span className="text-slate-700 font-semibold">{event.host?.name || "Faculty Lead"}</span>
                      {event.hostType === "faculty" && (
                        <span className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold badge-faculty">
                          <Icons.Faculty className="w-3 h-3" />
                          Faculty
                        </span>
                      )}
                    </p>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug">{event.title}</h3>

                    {/* Description */}
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{event.description}</p>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1">
                      {event.techStack.slice(0, 4).map((tech, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-teal-700 border border-slate-200">
                          {tech}
                        </span>
                      ))}
                      {event.techStack.length > 4 && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-500">+{event.techStack.length - 4}</span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 space-y-3">
                    {/* Capacity */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
                        <span className="flex items-center gap-1">
                          <Icons.Users className="w-3.5 h-3.5" />
                          {event.acceptedCount} / {event.teamSizeCap} members
                        </span>
                        <span className={isFull ? "text-amber-600 font-bold" : ""}>{isFull ? "Full" : `${slotsLeft} open`}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isFull ? "bg-amber-400" : "gradient-teal"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/events/${event._id}`}
                      className="block w-full py-2.5 text-center rounded-xl border-2 border-slate-200 text-slate-800 text-sm font-bold hover:border-teal-500 hover:text-teal-700 transition"
                    >
                      {isFull ? "View Workspace" : "View & Apply"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        /* My Teams Tab */
        myTeams === undefined ? (
          <div className="social-card p-12 text-center text-slate-400">Loading...</div>
        ) : myTeams.length === 0 ? (
          <div className="social-card p-16 text-center space-y-5">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Icons.Users className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">No Teams Yet</h3>
              <p className="text-slate-400 text-sm mt-1">Browse events and request to join a hackathon team!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myTeams.map((event: any) => (
              <article key={event._id} className="social-card card-shadow p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                    {event.userRole}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                    event.status === "recruiting" ? "badge-recruiting"
                      : event.status === "in_progress" ? "bg-blue-50 border border-blue-200 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>{event.status}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{event.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2">{event.description}</p>
                <Link
                  href={`/events/${event._id}`}
                  className="block w-full py-2.5 text-center rounded-xl gradient-teal text-white text-sm font-bold hover:opacity-90 transition"
                >
                  Open Workspace
                </Link>
              </article>
            ))}
          </div>
        )
      )}

      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
