"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionSelectedClass } from "@/components/sectionUi";
import { SECTIONS, type Section } from "@/convex/lib/validators";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: {
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
    initialData.semesterOverride ? String(initialData.semesterOverride) : ""
  );
  const [bio, setBio] = useState<string>(initialData.bio || "");
  const [skillsInput, setSkillsInput] = useState<string>((initialData.skills || []).join(", "));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateProfile = useMutation(api.users.updateProfile);

  useEffect(() => {
    if (isOpen) {
      setSection(initialData.section || "IT");
      setRegistrationNumber(initialData.registrationNumber || "");
      setUniversityEmail(initialData.universityEmail || "");
      setAdmissionYear(initialData.admissionYear || 2024);
      setSemesterOverride(initialData.semesterOverride ? String(initialData.semesterOverride) : "");
      setBio(initialData.bio || "");
      setSkillsInput((initialData.skills || []).join(", "));
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

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

      await updateProfile({
        section,
        registrationNumber: registrationNumber.trim() || undefined,
        universityEmail: universityEmail.trim() || undefined,
        admissionYear: Number(admissionYear),
        semesterOverride: semOverrideNum,
        bio: bio.trim(),
        skills,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
              <Icons.Edit className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Academic Profile</h2>
              <p className="text-xs text-slate-400">Update registration details, semester, bio, and skills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition"
          >
            <Icons.X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Registration & University Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Reg / Roll No.</label>
              <input
                type="text"
                placeholder="2024BTIT042"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="input-field uppercase font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">University Email</label>
              <input
                type="email"
                placeholder="student@univ.edu"
                value={universityEmail}
                onChange={(e) => setUniversityEmail(e.target.value)}
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* Section & Admission Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Section</label>
              <div className="grid grid-cols-3 gap-2">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSection(sec)}
                    className={`flex items-center justify-center gap-1 py-2 rounded-xl border-2 text-xs font-bold transition ${
                      section === sec
                        ? sectionSelectedClass(sec)
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <SectionIcon section={sec} className="w-3.5 h-3.5" />
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Admission Year</label>
              <select
                value={admissionYear}
                onChange={(e) => setAdmissionYear(Number(e.target.value))}
                className="input-field text-xs"
              >
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((y) => (
                  <option key={y} value={y}>
                    {y} Admission
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Manual Semester Override */}
          <div className="space-y-1 p-3 rounded-xl bg-amber-50/50 border border-amber-200">
            <label className="block text-xs font-bold text-amber-900">
              Semester Override <span className="font-normal text-amber-700">(Optional for backlogs/late entry)</span>
            </label>
            <input
              type="number"
              min={1}
              max={8}
              placeholder="Leave empty for auto-calculated semester"
              value={semesterOverride}
              onChange={(e) => setSemesterOverride(e.target.value)}
              className="input-field text-xs bg-white"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Bio</label>
            <textarea
              rows={3}
              placeholder="Tell the campus community about your focus area or projects..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field resize-none text-xs"
            />
          </div>

          {/* Skills */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Skills <span className="text-slate-400 font-normal ml-1">comma separated</span>
            </label>
            <input
              type="text"
              placeholder="React, Python, Next.js, Raspberry Pi, TensorFlow..."
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="input-field text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl gradient-teal text-white text-xs font-bold shadow-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Academic Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
