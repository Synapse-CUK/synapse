"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionSelectedClass } from "@/components/sectionUi";
import { computeCurrentSemester, getClassCode } from "@/convex/lib/semester";
import { SECTIONS, type Section } from "@/convex/lib/validators";

export default function OnboardingPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const dbUser = useQuery(api.users.current);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [universityEmail, setUniversityEmail] = useState("");
  const [section, setSection] = useState<Section>("IT");
  const [admissionYear, setAdmissionYear] = useState<number>(2024);
  const [role, setRole] = useState<"student" | "faculty">("student");
  const [showPendingNotice, setShowPendingNotice] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (clerkUser) {
      setName(clerkUser.fullName || clerkUser.firstName || "");
      if (clerkUser.primaryEmailAddress?.emailAddress) {
        setUniversityEmail(clerkUser.primaryEmailAddress.emailAddress);
      }
    }
  }, [clerkUser]);

  useEffect(() => {
    if (dbUser) {
      if (dbUser.name) setName(dbUser.name);
      if (dbUser.registrationNumber) setRegistrationNumber(dbUser.registrationNumber);
      if (dbUser.universityEmail) setUniversityEmail(dbUser.universityEmail);
      if (dbUser.section) setSection(dbUser.section);
      if (dbUser.admissionYear) setAdmissionYear(dbUser.admissionYear);
      if (dbUser.role === "student" || dbUser.role === "faculty" || dbUser.role === "faculty_pending" || dbUser.role === "coordinator") {
        setRole(dbUser.role === "faculty_pending" ? "faculty" : (dbUser.role === "coordinator" ? "student" : dbUser.role));
      }

      // If user already completed onboarding, redirect to feed
      if (dbUser.registrationNumber && dbUser.admissionYear) {
        router.push("/feed");
      }
    }
  }, [dbUser, router]);

  if (!isClerkLoaded || dbUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying academic record...</span>
        </div>
      </div>
    );
  }

  const computedSem = computeCurrentSemester(admissionYear);
  const previewClassCode = getClassCode(computedSem, section);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !registrationNumber.trim()) {
      setError("Please enter your full name and registration number.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await completeOnboarding({
        name: name.trim(),
        registrationNumber: registrationNumber.trim(),
        universityEmail: universityEmail.trim() || undefined,
        section,
        admissionYear: Number(admissionYear),
        role,
      });

      router.push("/feed");
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Failed to complete onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl social-card card-shadow-md p-6 sm:p-8 space-y-6 bg-white rounded-3xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl gradient-teal flex items-center justify-center text-white shadow-md">
            <Icons.Student className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Your Academic Profile
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Synapse uses your academic registration and admission year to calculate your class code and enforce event eligibility.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <Icons.X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Choice */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 font-bold text-sm transition ${
                  role === "student"
                    ? "border-teal-500 bg-teal-50 text-teal-800"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icons.Student className="w-4 h-4" />
                Student
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("faculty");
                  setShowPendingNotice(true);
                }}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 font-bold text-sm transition ${
                  role === "faculty"
                    ? "border-purple-500 bg-purple-50 text-purple-800"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icons.Faculty className="w-4 h-4" />
                  Faculty Member
                </div>
                {role === "faculty" && (
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                    ⏳ Requires Coordinator Approval
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Faculty Pending Notice */}
          {role === "faculty" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">⏳</span>
              <div>
                <div className="font-bold text-amber-900 mb-1">Faculty Account — Pending Coordinator Approval</div>
                <div className="text-amber-700 leading-relaxed">
                  Your account will be created with <strong>faculty_pending</strong> status. A department coordinator will review and approve your request before you gain faculty-level permissions (achievement verification, dashboard, official event hosting). You will have full student access in the meantime.
                </div>
              </div>
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
              Full Name <span className="text-teal-600">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Amal Tom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Registration Number & University Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Registration / Roll No. <span className="text-teal-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2024BTIT042"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="input-field uppercase font-mono"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">
                University Email <span className="text-slate-400 font-normal">Optional</span>
              </label>
              <input
                type="email"
                placeholder="e.g. student@college.edu"
                value={universityEmail}
                onChange={(e) => setUniversityEmail(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Program & Admission Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Section / Program</label>
              <div className="grid grid-cols-3 gap-2">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSection(sec)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 text-sm font-bold transition ${
                      section === sec
                        ? sectionSelectedClass(sec)
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <SectionIcon section={sec} className="w-4 h-4" />
                    {sec}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-bold text-slate-700">Admission Year</label>
              <select
                value={admissionYear}
                onChange={(e) => setAdmissionYear(Number(e.target.value))}
                className="input-field"
              >
                {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr} Admission
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Computed Class Code Preview Card */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
                <Icons.Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Computed Class Code</p>
                <p className="text-xs text-indigo-600">Calculated for Semester {computedSem}</p>
              </div>
            </div>

            <span className="px-4 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-mono font-black text-lg shadow-sm">
              {previewClassCode}
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl gradient-teal text-white font-bold text-base shadow-md hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                Complete Setup & Enter Synapse
                <Icons.ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
