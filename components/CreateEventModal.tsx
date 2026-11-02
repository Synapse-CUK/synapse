"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";
import type { Section } from "@/convex/lib/validators";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
}: CreateEventModalProps) {
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

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center text-white font-bold">
              <Icons.Rocket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Host Event / Hackathon</h2>
              <p className="text-xs text-slate-400">Set project criteria and team formation rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <Icons.X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">
              Event Title <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Campus IoT & Smart Energy Hackathon 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">
              Project Description <span className="text-teal-600">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe hackathon objectives, deliverables, and roles needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700">
              Tech Stack Tags <span className="text-slate-400 font-normal">comma separated</span>
            </label>
            <input
              type="text"
              placeholder="React, Raspberry Pi, MQTT, Python, Convex"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Formation Mode Selector */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Team Formation Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormationMode("student_choice")}
                className={`p-3.5 rounded-2xl border-2 text-left transition ${
                  formationMode === "student_choice"
                    ? "border-teal-500 bg-teal-50/60 text-teal-900 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <Icons.Student className="w-4 h-4 text-teal-600" />
                  Student Choice
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-normal font-normal">
                  Students request to join with a role; host reviews & approves.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormationMode("faculty_assign")}
                className={`p-3.5 rounded-2xl border-2 text-left transition ${
                  formationMode === "faculty_assign"
                    ? "border-purple-500 bg-purple-50/60 text-purple-900 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <Icons.Faculty className="w-4 h-4 text-purple-600" />
                  Faculty Assignment
                </div>
                <div className="text-xs text-slate-500 mt-1 leading-normal font-normal">
                  Host directly selects eligible section students into roles.
                </div>
              </button>
            </div>
          </div>

          {/* Section Eligibility & Team Cap */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Section Eligibility</label>
              <select
                value={eligibilityFilter}
                onChange={(e) => setEligibilityFilter(e.target.value as "all" | Section)}
                className="input-field"
              >
                <option value="all">🌐 All Sections Eligible</option>
                <option value="CSE">🧠 CSE Section Only</option>
                <option value="IT">💻 IT Section Only</option>
                <option value="IoT">📡 IoT Section Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Team Size Cap</label>
              <input
                type="number"
                min={2}
                max={10}
                value={teamSizeCap}
                onChange={(e) => setTeamSizeCap(Number(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          {/* Semester Eligibility Filter */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                <Icons.Sparkles className="w-4 h-4 text-indigo-600" />
                Semester Eligibility
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSemesterMode("all")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    semesterMode === "all"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  All Semesters
                </button>
                <button
                  type="button"
                  onClick={() => setSemesterMode("specific")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    semesterMode === "specific"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  Specific Semesters
                </button>
              </div>
            </div>

            {semesterMode === "specific" && (
              <div className="pt-2">
                <p className="text-xs text-slate-500 mb-2">Select eligible semester numbers (1 to 8):</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                    const isSelected = selectedSemesters.includes(sem);
                    return (
                      <button
                        key={sem}
                        type="button"
                        onClick={() => toggleSemester(sem)}
                        className={`w-9 h-9 rounded-xl font-bold text-xs transition ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        Sem {sem}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">Deadline</label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-bold text-slate-700">GitHub Repo URL</label>
              <input
                type="url"
                placeholder="https://github.com/org/repo"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl gradient-teal text-white text-sm font-bold shadow-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? "Creating Event..." : "Create Event & Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
