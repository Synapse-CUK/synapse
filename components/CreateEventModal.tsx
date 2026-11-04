"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";
import { Alert, Modal, Spinner } from "@/components/ui";
import type { Section } from "@/convex/lib/validators";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const router = useRouter();
  const createEvent = useMutation(api.events.createEvent);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStackInput, setTechStackInput] = useState("");
  const [formationMode, setFormationMode] = useState<"student_choice" | "faculty_assign">("student_choice");
  const [eligibilityFilter, setEligibilityFilter] = useState<"all" | Section>("all");
  const [semesterMode, setSemesterMode] = useState<"all" | "specific">("all");
  const [selectedSemesters, setSelectedSemesters] = useState<number[]>([3, 5]);
  const [teamSizeCap, setTeamSizeCap] = useState(4);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [githubRepoUrl, setGithubRepoUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleSemester(sem: number) {
    if (selectedSemesters.includes(sem)) {
      if (selectedSemesters.length === 1) return; // keep at least one
      setSelectedSemesters(selectedSemesters.filter((s) => s !== sem));
    } else {
      setSelectedSemesters([...selectedSemesters, sem].sort());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both the title and description.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const techStack = techStackInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const deadlineTimestamp = deadlineDate
        ? new Date(deadlineDate).getTime()
        : Date.now() + 14 * 24 * 60 * 60 * 1000;

      const eligibleSemestersParam = semesterMode === "all" ? "all" : selectedSemesters;

      const eventId = await createEvent({
        title: title.trim(),
        description: description.trim(),
        techStack: techStack.length > 0 ? techStack : ["FullStack", "React"],
        formationMode,
        eligibilityFilter,
        eligibleSemesters: eligibleSemestersParam,
        teamSizeCap: Number(teamSizeCap),
        deadline: deadlineTimestamp,
        githubRepoUrl: githubRepoUrl.trim() || undefined,
      });

      onClose();
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      console.error("Error creating event:", err);
      setError(err.message || "Failed to create event workspace.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const modes = [
    {
      id: "student_choice" as const,
      icon: Icons.Student,
      title: "Students apply",
      body: "Students ask to join with a role, and you approve each request.",
    },
    {
      id: "faculty_assign" as const,
      icon: Icons.Faculty,
      title: "Host assigns",
      body: "You place eligible students into roles yourself.",
    },
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      title="Host an event"
      description="Set the rules for who can join and how the team forms."
      icon={<Icons.Rocket className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
        {error && <Alert tone="error">{error}</Alert>}

        <div>
          <label htmlFor="event-title" className="field-label">
            Title
          </label>
          <input
            id="event-title"
            type="text"
            placeholder="e.g. Smart Energy IoT Hackathon"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="event-description" className="field-label">
            Description
          </label>
          <textarea
            id="event-description"
            rows={3}
            placeholder="Goals, deliverables and the roles you need."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
            required
          />
        </div>

        <div>
          <label htmlFor="event-tech" className="field-label">
            Tech stack <span className="field-hint ml-1">Separate with commas</span>
          </label>
          <input
            id="event-tech"
            type="text"
            placeholder="React, Raspberry Pi, MQTT, Python"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
            className="input-field"
          />
        </div>

        <fieldset>
          <legend className="field-label">How the team forms</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {modes.map((mode) => {
              const selected = formationMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setFormationMode(mode.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-ink bg-navy-tint ring-1 ring-ink"
                      : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <mode.icon className={`h-4 w-4 ${selected ? "text-gold-ink" : "text-muted"}`} />
                    {mode.title}
                  </span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-muted">{mode.body}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-eligibility" className="field-label">
              Who can join
            </label>
            <select
              id="event-eligibility"
              value={eligibilityFilter}
              onChange={(e) => setEligibilityFilter(e.target.value as "all" | Section)}
              className="input-field"
            >
              <option value="all">All sections</option>
              <option value="CSE">CSE only</option>
              <option value="IT">IT only</option>
              <option value="IoT">IoT only</option>
            </select>
          </div>

          <div>
            <label htmlFor="event-cap" className="field-label">
              Team size
            </label>
            <input
              id="event-cap"
              type="number"
              min={2}
              max={10}
              value={teamSizeCap}
              onChange={(e) => setTeamSizeCap(Number(e.target.value))}
              className="input-field"
            />
          </div>
        </div>

        <div role="group" aria-labelledby="event-semesters" className="rounded-xl border border-line bg-sunken/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span id="event-semesters" className="text-sm font-semibold text-ink">
              Semesters
            </span>
            <div className="segmented">
              <button
                type="button"
                onClick={() => setSemesterMode("all")}
                className={`segment h-7 text-xs ${semesterMode === "all" ? "segment-active" : ""}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSemesterMode("specific")}
                className={`segment h-7 text-xs ${semesterMode === "specific" ? "segment-active" : ""}`}
              >
                Choose
              </button>
            </div>
          </div>

          {semesterMode === "specific" && (
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const isSelected = selectedSemesters.includes(sem);
                return (
                  <button
                    key={sem}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Semester ${sem}`}
                    onClick={() => toggleSemester(sem)}
                    className={`h-10 rounded-lg border text-sm font-semibold tabular-nums transition ${
                      isSelected
                        ? "border-primary bg-primary text-primary-ink"
                        : "border-line bg-surface text-body hover:border-line-strong"
                    }`}
                  >
                    {sem}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-deadline" className="field-label">
              Deadline <span className="field-hint ml-1">Defaults to 2 weeks</span>
            </label>
            <input
              id="event-deadline"
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="event-repo" className="field-label">
              GitHub repository <span className="field-hint ml-1">Optional</span>
            </label>
            <input
              id="event-repo"
              type="url"
              placeholder="https://github.com/org/repo"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <button type="button" onClick={onClose} className="btn-ghost" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <Spinner />
                Creating
              </>
            ) : (
              "Create event"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
