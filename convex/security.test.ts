/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import * as users from "./users";

const modules = import.meta.glob("./**/*.ts");

type Role = "student" | "faculty_pending" | "faculty" | "coordinator";

function setup() {
  return convexTest(schema, modules);
}

type T = ReturnType<typeof setup>;

async function addUser(t: T, clerkId: string, role: Role = "student") {
  return await t.run(async (ctx) =>
    ctx.db.insert("users", {
      clerkId,
      name: `User ${clerkId}`,
      email: `${clerkId}@example.com`,
      universityEmail: `${clerkId}@college.edu`,
      registrationNumber: `REG-${clerkId}`,
      section: "IT",
      role,
      skills: ["TypeScript"],
      xp: 0,
      bio: "Original bio",
      admissionYear: 2024,
      createdAt: Date.now(),
    })
  );
}

const as = (t: T, clerkId: string) => t.withIdentity({ subject: clerkId });

async function roleOf(t: T, userId: Id<"users">) {
  return await t.run(async (ctx) => (await ctx.db.get(userId))?.role);
}

describe("role changes", () => {
  test("unsafe public user functions are gone or internal", () => {
    const exported = users as Record<string, unknown>;
    expect(exported.updateRole).toBeUndefined();
    expect(exported.getById).toBeUndefined();
    expect(exported.getByClerkId).toBeUndefined();

    const syncUser = users.syncUser as unknown as Record<string, unknown>;
    expect(syncUser.isInternal).toBe(true);
    expect(syncUser.isPublic).toBeUndefined();
  });

  test("onboarding rejects a coordinator role request", async () => {
    const t = setup();
    const id = await addUser(t, "student1");

    await expect(
      as(t, "student1").mutation(api.users.completeOnboarding, {
        name: "Sneaky",
        registrationNumber: "R1",
        section: "IT",
        admissionYear: 2024,
        role: "coordinator" as never,
      })
    ).rejects.toThrow();

    expect(await roleOf(t, id)).toBe("student");
  });

  test("requesting faculty only reaches faculty_pending", async () => {
    const t = setup();
    const id = await addUser(t, "student1");

    await as(t, "student1").mutation(api.users.completeOnboarding, {
      name: "Prof",
      registrationNumber: "R1",
      section: "CSE",
      admissionYear: 2024,
      role: "faculty",
    });

    expect(await roleOf(t, id)).toBe("faculty_pending");
  });

  test.each(["coordinator", "faculty"] as const)(
    "onboarding as a student never demotes a %s",
    async (role) => {
      const t = setup();
      const id = await addUser(t, "staff1", role);

      await as(t, "staff1").mutation(api.users.completeOnboarding, {
        name: "Staff",
        registrationNumber: "R1",
        section: "IT",
        admissionYear: 2024,
        role: "student",
      });

      expect(await roleOf(t, id)).toBe(role);
    }
  );

  test("students can't use coordinator role tools", async () => {
    const t = setup();
    const id = await addUser(t, "student1");

    await expect(
      as(t, "student1").mutation(api.coordinator.updateUserRole, {
        userId: id,
        role: "coordinator",
      })
    ).rejects.toThrow(/coordinator/i);

    expect(await roleOf(t, id)).toBe("student");
  });

  test("rejecting a faculty request can't demote a coordinator", async () => {
    const t = setup();
    await addUser(t, "coord1", "coordinator");
    const other = await addUser(t, "coord2", "coordinator");

    await expect(
      as(t, "coord1").mutation(api.coordinator.rejectFacultyRequest, { userId: other })
    ).rejects.toThrow(/pending/i);

    expect(await roleOf(t, other)).toBe("coordinator");
  });

  test("a coordinator can approve a pending faculty request", async () => {
    const t = setup();
    await addUser(t, "coord1", "coordinator");
    const pending = await addUser(t, "pending1", "faculty_pending");

    await as(t, "coord1").mutation(api.coordinator.approveFacultyRequest, { userId: pending });

    expect(await roleOf(t, pending)).toBe("faculty");
  });
});

describe("Clerk webhook sync", () => {
  test("keeps role, skills, bio and section on update", async () => {
    const t = setup();
    const id = await addUser(t, "coord1", "coordinator");
    await t.run((ctx) => ctx.db.patch(id, { section: "IoT" }));

    await t.mutation(internal.users.syncUser, {
      clerkId: "coord1",
      name: "New Name",
      email: "new@example.com",
    });

    const user = await t.run((ctx) => ctx.db.get(id));
    expect(user).toMatchObject({
      name: "New Name",
      email: "new@example.com",
      role: "coordinator",
      section: "IoT",
      skills: ["TypeScript"],
      bio: "Original bio",
    });
  });

  test("a blank Clerk name doesn't overwrite the saved name", async () => {
    const t = setup();
    const id = await addUser(t, "student1");

    await t.mutation(internal.users.syncUser, { clerkId: "student1", email: "s@example.com" });

    expect((await t.run((ctx) => ctx.db.get(id)))?.name).toBe("User student1");
  });

  test("new users always start as students", async () => {
    const t = setup();

    const id = await t.mutation(internal.users.syncUser, {
      clerkId: "brandnew",
      name: "New",
      email: "n@example.com",
    });

    expect(await roleOf(t, id)).toBe("student");
  });
});

describe("signed-out callers get no data", () => {
  test("every data query comes back empty", async () => {
    const t = setup();
    const userId = await addUser(t, "student1");
    const eventId = await as(t, "student1").mutation(api.events.createEvent, {
      title: "Hack",
      description: "d",
      techStack: [],
      formationMode: "faculty_assign",
      eligibilityFilter: "all",
      teamSizeCap: 4,
      deadline: 1,
    });
    await as(t, "student1").mutation(api.achievements.createAchievement, {
      title: "Win",
      description: "d",
    });

    expect(await t.query(api.users.current, {})).toBeNull();
    expect(await t.query(api.users.getUserProfile, { userId })).toBeNull();
    expect(await t.query(api.events.listEvents, {})).toEqual([]);
    expect(await t.query(api.events.getEvent, { eventId })).toBeNull();
    expect(await t.query(api.teamMembers.listEligibleStudents, { eventId })).toEqual([]);
    expect(await t.query(api.achievements.listFeed, {})).toEqual([]);
    expect(await t.query(api.achievements.listByUser, { userId })).toEqual([]);
    expect(await t.query(api.achievements.listPending, {})).toEqual([]);
  });
});

describe("private details stay private", () => {
  test("other students can't see contact details", async () => {
    const t = setup();
    const target = await addUser(t, "target");
    await addUser(t, "viewer");

    const profile = await as(t, "viewer").query(api.users.getUserProfile, { userId: target });

    expect(profile?.name).toBe("User target");
    expect(profile?.email).toBeUndefined();
    expect(profile?.universityEmail).toBeUndefined();
    expect(profile?.registrationNumber).toBeUndefined();
    expect(JSON.stringify(profile)).not.toContain("target@");
    expect(JSON.stringify(profile)).not.toContain("REG-target");
  });

  test("owners and coordinators can see contact details", async () => {
    const t = setup();
    const target = await addUser(t, "target");
    await addUser(t, "coord1", "coordinator");

    const own = await as(t, "target").query(api.users.getUserProfile, { userId: target });
    const coord = await as(t, "coord1").query(api.users.getUserProfile, { userId: target });

    expect(own?.registrationNumber).toBe("REG-target");
    expect(coord?.email).toBe("target@example.com");
  });

  test("feed and event data never include emails or Clerk IDs", async () => {
    const t = setup();
    await addUser(t, "host");
    await addUser(t, "viewer");
    const eventId = await as(t, "host").mutation(api.events.createEvent, {
      title: "Hack",
      description: "d",
      techStack: [],
      formationMode: "student_choice",
      eligibilityFilter: "all",
      teamSizeCap: 4,
      deadline: 1,
    });
    await as(t, "host").mutation(api.achievements.createAchievement, {
      title: "Win",
      description: "d",
    });

    const viewer = as(t, "viewer");
    const payload = JSON.stringify([
      await viewer.query(api.achievements.listFeed, {}),
      await viewer.query(api.events.getEvent, { eventId }),
      await viewer.query(api.events.listEvents, {}),
    ]);

    expect(payload).not.toContain("@example.com");
    expect(payload).not.toContain("@college.edu");
    expect(payload).not.toContain("REG-host");
    expect(payload).not.toContain("clerkId");
  });

  test("eligible students are only listed for the host", async () => {
    const t = setup();
    await addUser(t, "host");
    await addUser(t, "other");
    await addUser(t, "candidate");
    const eventId = await as(t, "host").mutation(api.events.createEvent, {
      title: "Hack",
      description: "d",
      techStack: [],
      formationMode: "faculty_assign",
      eligibilityFilter: "all",
      teamSizeCap: 4,
      deadline: 1,
    });

    const forOther = await as(t, "other").query(api.teamMembers.listEligibleStudents, { eventId });
    const forHost = await as(t, "host").query(api.teamMembers.listEligibleStudents, { eventId });

    expect(forOther).toEqual([]);
    expect(forHost.map((s) => s.name).sort()).toEqual(["User candidate", "User other"]);
    expect(JSON.stringify(forHost)).not.toContain("REG-");
    expect(JSON.stringify(forHost)).not.toContain("@");
  });

  test("the verification queue is for faculty and coordinators only", async () => {
    const t = setup();
    await addUser(t, "student1");
    await addUser(t, "pending1", "faculty_pending");
    await addUser(t, "faculty1", "faculty");
    await addUser(t, "coord1", "coordinator");
    await as(t, "student1").mutation(api.achievements.createAchievement, {
      title: "Win",
      description: "d",
    });

    expect(await as(t, "student1").query(api.achievements.listPending, {})).toEqual([]);
    expect(await as(t, "pending1").query(api.achievements.listPending, {})).toEqual([]);
    expect(await as(t, "faculty1").query(api.achievements.listPending, {})).toHaveLength(1);
    expect(await as(t, "coord1").query(api.achievements.listPending, {})).toHaveLength(1);
  });
});

describe("achievement review", () => {
  async function pendingAchievement(t: T, clerkId: string) {
    return await as(t, clerkId).mutation(api.achievements.createAchievement, {
      title: "Win",
      description: "d",
    });
  }

  test("verifying twice only awards the bonus once", async () => {
    const t = setup();
    const student = await addUser(t, "student1");
    await addUser(t, "faculty1", "faculty");
    const achievementId = await pendingAchievement(t, "student1");

    const faculty = as(t, "faculty1");
    await faculty.mutation(api.achievements.updateAchievementStatus, {
      achievementId,
      status: "verified",
    });
    await expect(
      faculty.mutation(api.achievements.updateAchievementStatus, {
        achievementId,
        status: "verified",
      })
    ).rejects.toThrow(/already/i);

    // 10 for posting plus 50 for verification
    expect((await t.run((ctx) => ctx.db.get(student)))?.xp).toBe(60);
  });

  test("faculty can't verify their own achievement", async () => {
    const t = setup();
    await addUser(t, "faculty1", "faculty");
    const achievementId = await pendingAchievement(t, "faculty1");

    await expect(
      as(t, "faculty1").mutation(api.achievements.updateAchievementStatus, {
        achievementId,
        status: "verified",
      })
    ).rejects.toThrow(/own/i);
  });

  test("students can't verify achievements", async () => {
    const t = setup();
    await addUser(t, "student1");
    await addUser(t, "student2");
    const achievementId = await pendingAchievement(t, "student1");

    await expect(
      as(t, "student2").mutation(api.achievements.updateAchievementStatus, {
        achievementId,
        status: "verified",
      })
    ).rejects.toThrow(/faculty/i);
  });
});

describe("profile rules and sections", () => {
  test.each([0, 9, 2.5])("rejects semester override %s", async (semesterOverride) => {
    const t = setup();
    await addUser(t, "student1");

    await expect(
      as(t, "student1").mutation(api.users.updateProfile, { semesterOverride })
    ).rejects.toThrow(/1 to 8/);
  });

  test("CSE students get a CSE class code and CSE events", async () => {
    const t = setup();
    await addUser(t, "student1");
    const student = as(t, "student1");

    await student.mutation(api.users.updateProfile, { section: "CSE", semesterOverride: 3 });
    const eventId = await student.mutation(api.events.createEvent, {
      title: "CSE only",
      description: "d",
      techStack: [],
      formationMode: "student_choice",
      eligibilityFilter: "CSE",
      teamSizeCap: 4,
      deadline: 1,
    });

    expect((await student.query(api.users.current, {}))?.classCode).toBe("3BTCSE");
    expect((await student.query(api.events.getEvent, { eventId }))?.eligibilityFilter).toBe("CSE");
  });
});

describe("operator tools", () => {
  test("setRole makes the first coordinator by email", async () => {
    const t = setup();
    const id = await addUser(t, "lead");

    await t.mutation(internal.admin.setRole, { email: "lead@example.com", role: "coordinator" });

    expect(await roleOf(t, id)).toBe("coordinator");
  });

  test("seedQaUser can be re-run without creating duplicates", async () => {
    const t = setup();
    const seed = {
      clerkId: "qa1",
      name: "QA One",
      email: "qa1@example.com",
      role: "faculty" as const,
      section: "CSE" as const,
      registrationNumber: "QA001",
      admissionYear: 2024,
    };

    const first = await t.mutation(internal.admin.seedQaUser, seed);
    const second = await t.mutation(internal.admin.seedQaUser, seed);

    expect(second).toBe(first);
    const all = await t.run((ctx) => ctx.db.query("users").collect());
    expect(all).toHaveLength(1);
  });
});

describe("coordinators have faculty powers", () => {
  test("a coordinator can verify an achievement and award XP", async () => {
    const t = setup();
    const student = await addUser(t, "student1");
    await addUser(t, "coord1", "coordinator");
    const achievementId = await as(t, "student1").mutation(api.achievements.createAchievement, {
      title: "Win",
      description: "d",
    });

    await as(t, "coord1").mutation(api.achievements.updateAchievementStatus, {
      achievementId,
      status: "verified",
    });

    const xp = await t.run(async (ctx) => (await ctx.db.get(student))?.xp);
    expect(xp).toBe(60);
  });

  test("events hosted by a coordinator count as faculty events", async () => {
    const t = setup();
    await addUser(t, "coord1", "coordinator");
    const eventId = await as(t, "coord1").mutation(api.events.createEvent, {
      title: "Hack",
      description: "d",
      techStack: [],
      formationMode: "faculty_assign",
      eligibilityFilter: "all",
      teamSizeCap: 4,
      deadline: Date.now() + 86_400_000,
    });
    const event = await t.run(async (ctx) => ctx.db.get(eventId));
    expect(event?.hostType).toBe("faculty");
  });

  test("a coordinator can't change their own role", async () => {
    const t = setup();
    const id = await addUser(t, "coord1", "coordinator");
    await expect(
      as(t, "coord1").mutation(api.coordinator.updateUserRole, { userId: id, role: "student" })
    ).rejects.toThrow(/own role/i);
    expect(await roleOf(t, id)).toBe("coordinator");
  });
});

describe("onboarding by role", () => {
  test("faculty don't need a registration number or admission year", async () => {
    const t = setup();
    await t.run(async (ctx) =>
      ctx.db.insert("users", {
        clerkId: "new1",
        name: "New user",
        email: "new1@example.com",
        section: "IT",
        role: "student",
        skills: [],
        xp: 0,
        createdAt: Date.now(),
      })
    );

    await as(t, "new1").mutation(api.users.completeOnboarding, {
      name: "Dr. Iyer",
      section: "CSE",
      role: "faculty",
    });

    const me = await as(t, "new1").query(api.users.current, {});
    expect(me?.role).toBe("faculty_pending");
    expect(me?.section).toBe("CSE");
    expect(me?.registrationNumber).toBeUndefined();
    expect(me?.classCode).toBeNull();
  });

  test("students still need a registration number", async () => {
    const t = setup();
    await addUser(t, "student1");
    await expect(
      as(t, "student1").mutation(api.users.completeOnboarding, {
        name: "Ana",
        section: "IT",
        admissionYear: 2024,
        role: "student",
      })
    ).rejects.toThrow(/registration number/i);
  });

  test("ensureUser creates one student record and is safe to repeat", async () => {
    const t = setup();
    const caller = t.withIdentity({ subject: "fresh1", name: "Fresh", email: "fresh1@example.com" });
    const first = await caller.mutation(api.users.ensureUser, {});
    const second = await caller.mutation(api.users.ensureUser, {});
    expect(second).toBe(first);
    expect(await roleOf(t, first)).toBe("student");
    const count = await t.run(async (ctx) => (await ctx.db.query("users").collect()).length);
    expect(count).toBe(1);
  });

  test("ensureUser never promotes or changes an existing record", async () => {
    const t = setup();
    const id = await addUser(t, "coord1", "coordinator");
    expect(await as(t, "coord1").mutation(api.users.ensureUser, {})).toBe(id);
    expect(await roleOf(t, id)).toBe("coordinator");
  });
});

describe("teams are for students", () => {
  test("faculty and coordinators can't ask to join a team", async () => {
    const t = setup();
    await addUser(t, "host1");
    await addUser(t, "faculty1", "faculty");
    const eventId = await as(t, "host1").mutation(api.events.createEvent, {
      title: "Team",
      description: "d",
      techStack: [],
      formationMode: "student_choice",
      eligibilityFilter: "all",
      teamSizeCap: 4,
      deadline: Date.now() + 86_400_000,
    });
    await expect(
      as(t, "faculty1").mutation(api.teamMembers.requestToJoin, { eventId, role: "Mentor" })
    ).rejects.toThrow(/only students/i);
  });
});

describe("data reset", () => {
  test("resetAllData refuses to run without ALLOW_DATA_RESET", async () => {
    const t = setup();
    await addUser(t, "student1");
    const previous = process.env.ALLOW_DATA_RESET;
    delete process.env.ALLOW_DATA_RESET;
    try {
      await expect(t.mutation(internal.admin.resetAllData, {})).rejects.toThrow(/ALLOW_DATA_RESET/);
    } finally {
      if (previous !== undefined) process.env.ALLOW_DATA_RESET = previous;
    }
    const count = await t.run(async (ctx) => (await ctx.db.query("users").collect()).length);
    expect(count).toBe(1);
  });

  test("resetAllData empties every table when allowed", async () => {
    const t = setup();
    await addUser(t, "student1");
    await as(t, "student1").mutation(api.achievements.createAchievement, { title: "Win", description: "d" });
    process.env.ALLOW_DATA_RESET = "true";
    try {
      await t.mutation(internal.admin.resetAllData, {});
    } finally {
      delete process.env.ALLOW_DATA_RESET;
    }
    const left = await t.run(async (ctx) => ({
      users: (await ctx.db.query("users").collect()).length,
      achievements: (await ctx.db.query("achievements").collect()).length,
    }));
    expect(left).toEqual({ users: 0, achievements: 0 });
  });
});
