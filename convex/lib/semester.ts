import type { Section } from "./validators";

/**
 * Utility functions for academic semester calculation and class code formatting.
 */

/**
 * Calculates the student's current semester (1 to 8) based on their admission year
 * and academic rollover dates:
 * - Academic Year starts around August (Semester 1).
 * - November 15: Odd Semester -> Even Semester (e.g., Sem 1 -> Sem 2).
 * - April 15: Even Semester -> Next Odd Semester (e.g., Sem 2 -> Sem 3).
 *
 * @param admissionYear The calendar year the student was admitted (e.g., 2024)
 * @param today Date object for comparison (defaults to current date)
 */
export function computeCurrentSemester(admissionYear: number, today: Date = new Date()): number {
  const currentYear = today.getFullYear();
  const month = today.getMonth(); // 0-indexed: 0=Jan, 3=Apr, 10=Nov
  const day = today.getDate();

  const yearsElapsed = currentYear - admissionYear;

  if (yearsElapsed < 0) {
    return 1;
  }

  let computedSem: number;

  // Check rollover bounds:
  // Before April 15: even semester of previous academic year (yearsElapsed * 2)
  const isBeforeApr15 = month < 3 || (month === 3 && day < 15);
  // November 15 or later: even semester of current academic year (yearsElapsed * 2 + 2)
  const isNov15OrLater = month > 10 || (month === 10 && day >= 15);

  if (isBeforeApr15) {
    computedSem = yearsElapsed * 2;
  } else if (isNov15OrLater) {
    computedSem = yearsElapsed * 2 + 2;
  } else {
    // Between April 15 and November 14: odd semester of current academic year
    computedSem = yearsElapsed * 2 + 1;
  }

  // Clamp semester to standard 1 to 8 range
  return Math.min(Math.max(computedSem, 1), 8);
}

/**
 * Formats a class code string from semester and section.
 * Example: 3 + "IT" -> "3BTIT", 5 + "IoT" -> "5BTIOT", 1 + "CSE" -> "1BTCSE"
 */
export function getClassCode(semester: number, section: Section): string {
  return `${semester}BT${section.toUpperCase()}`;
}

/**
 * Returns the effective semester for a user object.
 * Prioritizes `semesterOverride` if set, otherwise computes from `admissionYear`.
 */
export function getEffectiveSemester(user: {
  admissionYear?: number;
  semesterOverride?: number;
  year?: number;
}): number {
  if (user.semesterOverride && user.semesterOverride > 0) {
    return user.semesterOverride;
  }
  if (user.admissionYear && user.admissionYear > 0) {
    return computeCurrentSemester(user.admissionYear);
  }
  if (user.year && user.year > 0) {
    return Math.min(Math.max((user.year * 2) - 1, 1), 8);
  }
  return 1;
}
