import { v } from "convex/values";

/** Academic sections. Add new ones here and in `sectionValidator`. */
export const SECTIONS = ["IT", "IoT", "CSE"] as const;
export type Section = (typeof SECTIONS)[number];

export const sectionValidator = v.union(
  v.literal("IT"),
  v.literal("IoT"),
  v.literal("CSE")
);

export const roleValidator = v.union(
  v.literal("student"),
  v.literal("faculty_pending"),
  v.literal("faculty"),
  v.literal("coordinator")
);
