"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionSelectedClass } from "@/components/sectionUi";
import { Alert, Modal, Spinner } from "@/components/ui";
import { SECTIONS, type Section } from "@/convex/lib/validators";
import { isStudent, type Role } from "@/convex/lib/roles";
import { errorMessage } from "@/lib/errors";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
    role: Role;
    section: Section;
    registrationNumber?: string;
    universityEmail?: string;
    admissionYear?: number;
    semesterOverride?: number;
    bio?: string;
    skills?: string[];
  };
}

export default function EditProfileModal({ isOpen, onClose, initialData }: EditProfileModalProps) {
  const [section, setSection] = useState<Section>(initialData.section || "IT");
  const [registrationNumber, setRegistrationNumber] = useState<string>(initialData.registrationNumber || "");
  const [universityEmail, setUniversityEmail] = useState<string>(initialData.universityEmail || "");
  const [admissionYear, setAdmissionYear] = useState<number>(initialData.admissionYear || 2024);
  const [semesterOverride, setSemesterOverride] = useState<string>(
    initialData.semesterOverride ? String(initialData.semesterOverride) : "",
  );
  const [bio, setBio] = useState<string>(initialData.bio || "");
  const [skillsInput, setSkillsInput] = useState<string>((initialData.skills || []).join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateProfile = useMutation(api.users.updateProfile);
  const student = isStudent(initialData.role);

  // The parent builds initialData on every render, and live profile updates
  // re-render it. Reset the form only when the dialog opens, so a background
  // update never wipes what the user is typing.
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  useEffect(() => {
    if (!isOpen) return;
    const data = initialDataRef.current;
    setSection(data.section || "IT");
    setRegistrationNumber(data.registrationNumber || "");
    setUniversityEmail(data.universityEmail || "");
    setAdmissionYear(data.admissionYear || 2024);
    setSemesterOverride(data.semesterOverride ? String(data.semesterOverride) : "");
    setBio(data.bio || "");
    setSkillsInput((data.skills || []).join(", "));
    setError("");
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError("");

      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const semOverrideNum = semesterOverride.trim() ? Number(semesterOverride) : undefined;

      if (student && !registrationNumber.trim()) {
        setError("Registration number can't be empty.");
        return;
      }

      await updateProfile({
        section,
        universityEmail: universityEmail.trim(),
        bio: bio.trim(),
        skills,
        ...(student
          ? {
              registrationNumber: registrationNumber.trim(),
              admissionYear: Number(admissionYear),
              semesterOverride: semOverrideNum,
            }
          : {}),
      });
      onClose();
    } catch (err) {
      setError(errorMessage(err, "Failed to update profile."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Edit profile"
      description={student ? "Academic details, bio and skills." : "Department, bio and skills."}
      icon={<Icons.Edit className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
        {error && <Alert tone="error">{error}</Alert>}

        <div className={`grid gap-4 ${student ? "sm:grid-cols-2" : ""}`}>
          {student && (
          <div>
            <label htmlFor="edit-reg" className="field-label">
              Registration no.
            </label>
            <input
              id="edit-reg"
              type="text"
              placeholder="2024BTIT042"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              className="input-field font-mono uppercase"
            />
          </div>
          )}
          <div>
            <label htmlFor="edit-email" className="field-label">
              University email
            </label>
            <input
              id="edit-email"
              type="email"
              placeholder="you@college.edu"
              value={universityEmail}
              onChange={(e) => setUniversityEmail(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div role="group" aria-labelledby="edit-section-label">
          <span id="edit-section-label" className="field-label">
            {student ? "Section" : "Department"}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                type="button"
                aria-pressed={section === sec}
                onClick={() => setSection(sec)}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                  section === sec ? sectionSelectedClass(sec) : "border-line text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                <SectionIcon section={sec} className="h-4 w-4" />
                {sec}
              </button>
            ))}
          </div>
        </div>

        {student && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-year" className="field-label">
              Admission year
            </label>
            <select
              id="edit-year"
              value={admissionYear}
              onChange={(e) => setAdmissionYear(Number(e.target.value))}
              className="input-field"
            >
              {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-sem" className="field-label">
              Semester override <span className="field-hint ml-1">Optional</span>
            </label>
            <input
              id="edit-sem"
              type="number"
              min={1}
              max={8}
              placeholder="Worked out automatically"
              value={semesterOverride}
              onChange={(e) => setSemesterOverride(e.target.value)}
              className="input-field"
            />
            <p className="field-hint mt-1.5">Only for a late entry or a repeated semester.</p>
          </div>
        </div>
        )}

        <div>
          <label htmlFor="edit-bio" className="field-label">
            Bio
          </label>
          <textarea
            id="edit-bio"
            rows={3}
            placeholder="What you work on, and what you'd like to build next."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label htmlFor="edit-skills" className="field-label">
            Skills <span className="field-hint ml-1">Separate with commas</span>
          </label>
          <input
            id="edit-skills"
            type="text"
            placeholder="React, Python, Raspberry Pi, TensorFlow"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="input-field"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <>
                <Spinner />
                Saving
              </>
            ) : (
              "Save profile"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
