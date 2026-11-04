"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import CreateEventModal from "@/components/CreateEventModal";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionBadgeClass } from "@/components/sectionUi";
import EventStatusChip from "@/components/EventStatusChip";
import { EmptyState, PageHeader, SeatMeter } from "@/components/ui";

function CardSkeleton() {
  return (
    <div className="panel space-y-4 p-6" aria-hidden>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-24 rounded-full" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton h-6 w-2/3" />
      <div className="skeleton h-12 w-full" />
      <div className="skeleton h-1.5 w-full rounded-full" />
    </div>
  );
}

export default function EventsPage() {
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
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:py-12">
      <PageHeader
        title="Projects and hackathons"
        description="Host an event, set who can join, and build a team across the CSE, IT and IoT sections."
        actions={
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary btn-lg">
            <Icons.Plus className="h-4 w-4" />
            Host an event
          </button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="segmented" role="tablist" aria-label="Event lists">
          <button
            role="tab"
            aria-selected={activeTab === "browse"}
            onClick={() => setActiveTab("browse")}
            className={`segment ${activeTab === "browse" ? "segment-active" : ""}`}
          >
            All events
            <span className="tabular-nums text-muted">{events?.length ?? 0}</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "my_teams"}
            onClick={() => setActiveTab("my_teams")}
            className={`segment ${activeTab === "my_teams" ? "segment-active" : ""}`}
          >
            My teams
            <span className="tabular-nums text-muted">{myTeams?.length ?? 0}</span>
          </button>
        </div>

        {activeTab === "browse" && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Icons.Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <label htmlFor="event-search" className="sr-only">
                Search events
              </label>
              <input
                id="event-search"
                type="search"
                placeholder="Search by title or tech"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field h-10 pl-10 text-sm sm:w-64"
              />
            </div>
            <label htmlFor="event-status" className="sr-only">
              Filter by status
            </label>
            <select
              id="event-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field h-10 text-sm sm:w-40"
            >
              <option value="all">Any status</option>
              <option value="recruiting">Recruiting</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === "browse" ? (
        events === undefined ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={<Icons.Rocket className="h-6 w-6" />}
            title={events.length === 0 ? "No events yet" : "No matches"}
            action={
              events.length === 0 ? (
                <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
                  <Icons.Plus className="h-4 w-4" />
                  Host the first event
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="btn-secondary"
                >
                  Clear filters
                </button>
              )
            }
          >
            {events.length === 0
              ? "Host a hackathon or project to start forming teams."
              : "Try a different search term or status."}
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const isFull = event.acceptedCount >= event.teamSizeCap;
              const slotsLeft = event.teamSizeCap - event.acceptedCount;

              return (
                <Link
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="panel panel-interactive group flex flex-col p-6"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <EventStatusChip status={event.status} />
                    <span className={sectionBadgeClass(event.eligibilityFilter)}>
                      <SectionIcon section={event.eligibilityFilter} className="h-3 w-3" />
                      {event.eligibilityFilter === "all" ? "All sections" : `${event.eligibilityFilter} only`}
                    </span>
                    {event.eligibleSemesters &&
                      event.eligibleSemesters !== "all" &&
                      Array.isArray(event.eligibleSemesters) && (
                        <span className="chip-neutral">Sem {event.eligibleSemesters.join(", ")}</span>
                      )}
                  </div>

                  <h3 className="mt-5 text-lg font-semibold leading-snug text-ink transition group-hover:text-royal">
                    {event.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{event.description}</p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {event.techStack.slice(0, 4).map((tech, i) => (
                      <span key={i} className="rounded-md bg-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-body">
                        {tech}
                      </span>
                    ))}
                    {event.techStack.length > 4 && (
                      <span className="rounded-md bg-sunken px-2 py-0.5 font-mono text-[11px] font-medium text-muted">
                        +{event.techStack.length - 4}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto space-y-3 pt-6">
                    <SeatMeter filled={event.acceptedCount} total={event.teamSizeCap} />
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted">
                        <Icons.Users className="h-3.5 w-3.5" />
                        <span className="tabular-nums">
                          {event.acceptedCount} of {event.teamSizeCap}
                        </span>
                        {isFull ? (
                          <span className="font-semibold text-gold-ink">Team full</span>
                        ) : (
                          <span>{slotsLeft} open</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 truncate pl-3 text-muted">
                        {event.hostType === "faculty" && <Icons.Faculty className="h-3.5 w-3.5 text-royal" />}
                        <span className="truncate">{event.host?.name || "Faculty lead"}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )
      ) : myTeams === undefined ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : myTeams.length === 0 ? (
        <EmptyState
          icon={<Icons.Users className="h-6 w-6" />}
          title="No teams yet"
          action={
            <button onClick={() => setActiveTab("browse")} className="btn-secondary">
              Browse events
            </button>
          }
        >
          Ask to join an event and it will show up here.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {myTeams.map((event: any) => (
            <Link
              key={event._id}
              href={`/events/${event._id}`}
              className="panel panel-interactive group flex flex-col p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="chip-navy">{event.userRole}</span>
                <EventStatusChip status={event.status} />
              </div>
              <h3 className="mt-5 text-lg font-semibold leading-snug text-ink transition group-hover:text-royal">
                {event.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{event.description}</p>
              <span className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-semibold text-ink">
                Open workspace
                <Icons.ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      )}

      <CreateEventModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
}
