"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "@/components/Icons";
import { SectionIcon, sectionBadgeClass, sectionSelectedClass } from "@/components/sectionUi";
import { Alert, LoadingScreen, Spinner } from "@/components/ui";
import { needsOnboarding } from "@/convex/lib/roles";
import { computeCurrentSemester, getClassCode } from "@/convex/lib/semester";
import { SECTIONS, type Section } from "@/convex/lib/validators";
import { errorMessage } from "@/lib/errors";

const THIS_YEAR = new Date().getFullYear();
const ADMISSION_YEARS = Array.from({ length: 7 }, (_, i) => THIS_YEAR - i);

export default function OnboardingPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const dbUser = useQuery(api.users.current);
  const completeOnboarding = useMutation(api.users.completeOnboarding);

  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [universityEmail, setUniversityEmail] = useState("");
  const [section, setSection] = useState<Section>("IT");
  const [admissionYear, setAdmissionYear] = useState<number>(THIS_YEAR - 1);
  const [role, setRole] = useState<"student" | "faculty">("student");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prefill once from Clerk, then once from the Convex record, so live updates
  // never overwrite what the user is typing.
  const prefilledFromClerk = useRef(false);
  const prefilledFromDb = useRef(false);

  useEffect(() => {
    if (!clerkUser || prefilledFromClerk.current) return;
    prefilledFromClerk.current = true;
    setName((current) => current || clerkUser.fullName || clerkUser.firstName || "");
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (email) setUniversityEmail((current) => current || email);
  }, [clerkUser]);

  const alreadyDone = !!dbUser && !needsOnboarding(dbUser);

  useEffect(() => {
    if (alreadyDone) {
      router.replace("/feed");
      return;
    }
    if (!dbUser || prefilledFromDb.current) return;
    prefilledFromDb.current = true;
    if (dbUser.name && dbUser.name !== "New user") setName(dbUser.name);
    if (dbUser.registrationNumber) setRegistrationNumber(dbUser.registrationNumber);
    if (dbUser.universityEmail) setUniversityEmail(dbUser.universityEmail);
    if (dbUser.section) setSection(dbUser.section);
    if (dbUser.admissionYear) setAdmissionYear(dbUser.admissionYear);
  }, [alreadyDone, dbUser, router]);

  if (!isClerkLoaded || dbUser === undefined || alreadyDone) {
    return <LoadingScreen label="Checking your account" />;
  }

  const isFaculty = role === "faculty";
  const computedSem = computeCurrentSemester(admissionYear);
  const previewClassCode = getClassCode(computedSem, section);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!isFaculty && !registrationNumber.trim()) {
      setError("Please enter your registration number.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await completeOnboarding({
        name: name.trim(),
        universityEmail: universityEmail.trim() || undefined,
        section,
        role,
        ...(isFaculty ? {} : { registrationNumber: registrationNumber.trim(), admissionYear }),
      });

      router.push("/feed");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError(errorMessage(err, "Failed to complete onboarding."));
      setIsSubmitting(false);
    }
  }

  const roles = [
    { id: "student" as const, icon: Icons.Student, label: "Student" },
    { id: "faculty" as const, icon: Icons.Faculty, label: "Faculty" },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-14">
      {/* Preview */}
      <aside className="relative overflow-hidden rounded-2xl bg-band p-8 text-band-ink lg:sticky lg:top-24 lg:col-span-5 lg:self-start lg:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgb(var(--gold)/0.32),transparent_65%)]"
        />
        <div className="relative">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] text-band-ink md:text-5xl">
            {isFaculty ? "Set up your faculty profile." : "Set up your academic profile."}
          </h1>
          <p className="mt-4 max-w-sm leading-relaxed text-band-ink/75">
            {isFaculty
              ? "Faculty only need a name and department. A coordinator approves faculty access."
              : "Your section and admission year give you a class code. Events use it to check who can join."}
          </p>

          <div className="mt-10 rounded-xl border border-white/10 bg-white/5 p-5">
            {isFaculty ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-band-ink/60">Department</p>
                <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-gold-soft">{section}</p>
                <p className="mt-2 text-sm text-band-ink/70">Faculty access after coordinator approval</p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-band-ink/60">Your class code</p>
                <p className="mt-2 font-mono text-4xl font-semibold tracking-tight text-gold-soft">{previewClassCode}</p>
                <p className="mt-2 text-sm text-band-ink/70">
                  Semester {computedSem}, {section} section
                </p>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-7 lg:col-span-7" noValidate>
        {error && <Alert tone="error">{error}</Alert>}

        <div role="group" aria-labelledby="role-label">
          <span id="role-label" className="field-label">
            I am a
          </span>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((r) => {
              const selected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRole(r.id)}
                  className={`flex h-14 items-center justify-center gap-2.5 rounded-xl border text-[15px] font-semibold transition ${
                    selected
                      ? "border-ink bg-navy-tint text-ink ring-1 ring-ink"
                      : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  <r.icon className={`h-5 w-5 ${selected ? "text-gold-ink" : ""}`} />
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {isFaculty && (
          <Alert tone="warning" title="Faculty accounts need a coordinator's approval">
            Until a coordinator approves you, you can browse the feed and projects. After approval you can verify
            achievements, use the faculty dashboard and host official events.
          </Alert>
        )}

        <div>
          <label htmlFor="onb-name" className="field-label">
            Full name
          </label>
          <input
            id="onb-name"
            type="text"
            autoComplete="name"
            placeholder={isFaculty ? "e.g. Dr. Meera Iyer" : "e.g. Ananya Krishnan"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            required
          />
        </div>

        <div className={`grid gap-5 ${isFaculty ? "" : "sm:grid-cols-2"}`}>
          {!isFaculty && (
            <div>
              <label htmlFor="onb-reg" className="field-label">
                Registration no.
              </label>
              <input
                id="onb-reg"
                type="text"
                placeholder="e.g. 2024BTIT042"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="input-field font-mono uppercase"
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="onb-email" className="field-label">
              University email <span className="field-hint ml-1">Optional</span>
            </label>
            <input
              id="onb-email"
              type="email"
              autoComplete="email"
              placeholder="you@college.edu"
              value={universityEmail}
              onChange={(e) => setUniversityEmail(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className={`grid gap-5 ${isFaculty ? "" : "sm:grid-cols-2"}`}>
          <div role="group" aria-labelledby="onb-section-label">
            <span id="onb-section-label" className="field-label">
              {isFaculty ? "Department" : "Section"}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SECTIONS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  aria-pressed={section === sec}
                  onClick={() => setSection(sec)}
                  className={`flex h-11 items-center justify-center gap-1.5 rounded-xl border text-sm font-semibold transition ${
                    section === sec ? sectionSelectedClass(sec) : "border-line text-muted hover:border-line-strong hover:text-ink"
                  }`}
                >
                  <SectionIcon section={sec} className="h-4 w-4" />
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {!isFaculty && (
            <div>
              <label htmlFor="onb-year" className="field-label">
                Admission year
              </label>
              <select
                id="onb-year"
                value={admissionYear}
                onChange={(e) => setAdmissionYear(Number(e.target.value))}
                className="input-field"
              >
                {ADMISSION_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Class code on small screens, where the preview panel scrolls away */}
        {!isFaculty && (
          <div className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 lg:hidden">
            <span className="text-sm text-muted">Your class code</span>
            <span className={`${sectionBadgeClass(section)} font-mono text-sm`}>{previewClassCode}</span>
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary btn-lg w-full">
          {isSubmitting ? (
            <>
              <Spinner />
              Saving
            </>
          ) : (
            <>
              {isFaculty ? "Request faculty access" : "Finish setup"}
              <Icons.ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
