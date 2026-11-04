/**
 * Role rules shared by Convex functions and the frontend.
 *
 * - student: the default. Needs a registration number and admission year,
 *   which give the semester and class code used for event eligibility.
 * - faculty_pending: asked for faculty access at onboarding; has student
 *   features until a coordinator approves.
 * - faculty: verifies achievements and hosts official events. Gives only a
 *   name and department (section); no student fields.
 * - coordinator: everything faculty can do, plus the coordinator dashboard.
 *   Only ever granted from Convex (admin:setRole) or by another coordinator.
 */
export type Role = "student" | "faculty_pending" | "faculty" | "coordinator";

/** Faculty powers: verifying achievements, the faculty dashboard, faculty-hosted events. */
export function hasFacultyAccess(role: Role | undefined | null): boolean {
  return role === "faculty" || role === "coordinator";
}

/** Only students have semesters and class codes, and only students join teams. */
export function isStudent(role: Role | undefined | null): boolean {
  return role === "student";
}

/** Roles that show student details (registration no., semester, class code). */
export function hasStudentDetails(role: Role | undefined | null): boolean {
  return role === "student" || role === "faculty_pending";
}

/**
 * Whether a signed-in user still has to finish onboarding. Only students do,
 * until they give a registration number and admission year. faculty_pending is
 * only reached by finishing onboarding, and faculty and coordinators are set
 * from Convex, so none of them are sent back.
 */
export function needsOnboarding(user: {
  role: Role;
  registrationNumber?: string;
  admissionYear?: number;
}): boolean {
  return user.role === "student" && (!user.registrationNumber || !user.admissionYear);
}

export const ROLE_META: Record<Role, { label: string; chip: string }> = {
  student: { label: "Student", chip: "chip-neutral" },
  faculty_pending: { label: "Faculty pending", chip: "chip-gold" },
  faculty: { label: "Faculty", chip: "chip-royal" },
  coordinator: { label: "Coordinator", chip: "chip-navy" },
};
