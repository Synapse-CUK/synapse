import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { roleValidator, sectionValidator } from "./lib/validators";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    section: sectionValidator,
    year: v.optional(v.number()), // Deprecated in favor of calculated semester
    registrationNumber: v.optional(v.string()),
    universityEmail: v.optional(v.string()),
    admissionYear: v.optional(v.number()),
    semesterOverride: v.optional(v.number()),
    role: roleValidator,
    requestedRole: v.optional(v.string()),
    skills: v.array(v.string()),
    xp: v.number(), // Default 0
    bio: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_section", ["section"]),

  achievements: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    proofFileUrl: v.optional(v.string()),
    proofStorageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("rejected")
    ),
    verifiedBy: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_status", ["status"])
    .index("by_userId_status", ["userId", "status"]),

  events: defineTable({
    hostId: v.id("users"),
    hostType: v.union(v.literal("student"), v.literal("faculty")),
    title: v.string(),
    description: v.string(),
    techStack: v.array(v.string()),
    formationMode: v.union(
      v.literal("student_choice"),
      v.literal("faculty_assign")
    ),
    eligibilityFilter: v.union(v.literal("all"), sectionValidator),
    eligibleSemesters: v.optional(v.union(v.literal("all"), v.array(v.number()))),
    teamSizeCap: v.number(),
    deadline: v.number(),
    status: v.union(
      v.literal("recruiting"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    githubRepoUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_hostId", ["hostId"])
    .index("by_status", ["status"])
    .index("by_eligibilityFilter", ["eligibilityFilter"]),

  teamMembers: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    role: v.string(), // e.g. "UI", "backend", "fullstack"
    status: v.union(v.literal("requested"), v.literal("accepted")),
    githubUsername: v.optional(v.string()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_userId", ["userId"])
    .index("by_eventId_userId", ["eventId", "userId"]),

  joinRequestMessages: defineTable({
    teamMemberId: v.id("teamMembers"),
    senderId: v.id("users"),
    message: v.string(),
    createdAt: v.number(),
  }).index("by_teamMemberId", ["teamMemberId"]),

  kanbanCards: defineTable({
    eventId: v.id("events"),
    title: v.string(),
    assignedTo: v.optional(v.id("users")),
    status: v.union(
      v.literal("todo"),
      v.literal("inprogress"),
      v.literal("done")
    ),
    createdAt: v.number(),
  })
    .index("by_eventId", ["eventId"])
    .index("by_status", ["status"])
    .index("by_eventId_status", ["eventId", "status"]),

  teamChat: defineTable({
    eventId: v.id("events"),
    senderId: v.optional(v.id("users")), // null/undefined if sent by AI assistant
    message: v.string(),
    isAiMessage: v.boolean(), // Default false
    createdAt: v.number(),
  }).index("by_eventId", ["eventId"]),

  commitActivity: defineTable({
    eventId: v.id("events"),
    githubUsername: v.string(),
    commitSha: v.string(),
    filesChanged: v.array(v.string()),
    additions: v.number(),
    deletions: v.number(),
    message: v.string(),
    timestamp: v.number(),
  }).index("by_eventId", ["eventId"]),
});
