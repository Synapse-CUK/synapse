#!/usr/bin/env node
/**
 * Create QA test accounts in Clerk and Convex. Safe to re-run.
 *
 *   node scripts/seed-qa-users.mjs --testers 5
 *   node scripts/seed-qa-users.mjs --testers 5 --leads 1 --deployment prod
 *
 * Each tester gets a student, a faculty and a "fresh" account (fresh goes
 * through onboarding). The first --leads testers also get a coordinator
 * account, because that role can delete data and change roles.
 *
 * Logins are written to qa-credentials.local.csv, which is gitignored. Hand each
 * student only their own rows, privately.
 *
 * Addresses use Clerk's +clerk_test format, so no real email is ever sent. If
 * Clerk asks for a verification code, it is 424242. This only works on a Clerk
 * development instance, so the script refuses to run with a live key.
 */
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const credentialsPath = join(root, "qa-credentials.local.csv");
const convexCli = join(root, "node_modules", "convex", "bin", "main.js");
const CSV_HEADER = "tester,role,email,password";
const SECTIONS = ["CSE", "IT", "IoT"];

function parseArgs(argv) {
  const options = { testers: 0, leads: 1, deployment: "prod" };
  for (let i = 0; i < argv.length; i += 2) {
    const [flag, value] = [argv[i], argv[i + 1]];
    if (flag === "--testers") options.testers = Number(value);
    else if (flag === "--leads") options.leads = Number(value);
    else if (flag === "--deployment") options.deployment = value;
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (!Number.isInteger(options.testers) || options.testers < 1) {
    throw new Error("Pass --testers <number>, for example --testers 5");
  }
  if (!Number.isInteger(options.leads) || options.leads < 0) {
    throw new Error("--leads must be 0 or more");
  }
  if (options.deployment !== "prod" && options.deployment !== "dev") {
    throw new Error("--deployment must be prod or dev");
  }
  return options;
}

function readClerkSecretKey() {
  const envPath = join(root, ".env.local");
  const contents = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const key =
    process.env.CLERK_SECRET_KEY ??
    contents.match(/^CLERK_SECRET_KEY=(.+)$/m)?.[1]?.trim();
  if (!key) {
    throw new Error("CLERK_SECRET_KEY not found in the environment or .env.local");
  }
  if (!key.startsWith("sk_test_")) {
    throw new Error("Refusing to run: QA accounts need a Clerk development (sk_test_) key.");
  }
  return key;
}

async function clerk(secretKey, method, path, body) {
  const response = await fetch(`https://api.clerk.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Clerk ${method} ${path} failed (${response.status}): ${await response.text()}`);
  }
  return await response.json();
}

function runConvex(deployment, fn, args) {
  const cliArgs = [convexCli, "run", ...(deployment === "prod" ? ["--prod"] : []), fn, JSON.stringify(args)];
  execFileSync(process.execPath, cliArgs, { cwd: root, stdio: ["ignore", "ignore", "inherit"] });
}

function loadSavedPasswords() {
  const saved = new Map();
  if (!existsSync(credentialsPath)) return saved;
  for (const line of readFileSync(credentialsPath, "utf8").split(/\r?\n/).slice(1)) {
    const [, , email, password] = line.split(",");
    if (email && password) saved.set(email, password);
  }
  return saved;
}

function buildAccounts({ testers, leads }) {
  const accounts = [];
  for (let n = 1; n <= testers; n++) {
    const id = `qa${String(n).padStart(2, "0")}`;
    const section = SECTIONS[(n - 1) % SECTIONS.length];
    const add = (kind, role, registrationNumber) =>
      accounts.push({
        tester: id,
        kind,
        role,
        section,
        email: `${id}-${kind}+clerk_test@example.com`,
        firstName: id.toUpperCase(),
        lastName: kind[0].toUpperCase() + kind.slice(1),
        registrationNumber,
      });

    add("student", "student", `${id.toUpperCase()}STU`);
    add("faculty", "faculty", `${id.toUpperCase()}FAC`);
    add("fresh", "student", undefined);
    if (n <= leads) add("coordinator", "coordinator", `${id.toUpperCase()}COORD`);
  }
  return accounts;
}

async function ensureClerkUser(secretKey, account, password) {
  const email = encodeURIComponent(account.email);
  const [existing] = await clerk(secretKey, "GET", `/users?email_address=${email}`);
  if (existing) {
    await clerk(secretKey, "PATCH", `/users/${existing.id}`, {
      password,
      skip_password_checks: true,
    });
    return existing.id;
  }
  const created = await clerk(secretKey, "POST", "/users", {
    email_address: [account.email],
    password,
    first_name: account.firstName,
    last_name: account.lastName,
    skip_password_checks: true,
  });
  return created.id;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const secretKey = readClerkSecretKey();
  const saved = loadSavedPasswords();
  const rows = [];

  for (const account of buildAccounts(options)) {
    const password = saved.get(account.email) ?? randomBytes(12).toString("base64url");
    const clerkId = await ensureClerkUser(secretKey, account, password);

    runConvex(options.deployment, "admin:seedQaUser", {
      clerkId,
      name: `${account.firstName} ${account.lastName}`,
      email: account.email,
      role: account.role,
      section: account.section,
      ...(account.registrationNumber
        ? { registrationNumber: account.registrationNumber, admissionYear: 2024 }
        : {}),
    });

    rows.push([account.tester, account.kind, account.email, password].join(","));
    // Save after each account so a failure part-way keeps the passwords already set.
    writeFileSync(credentialsPath, [CSV_HEADER, ...rows, ""].join("\n"));
    console.log(`ok  ${account.email}`);
  }

  console.log(`\nSeeded ${rows.length} accounts on ${options.deployment}.`);
  console.log(`Logins saved to ${credentialsPath} (gitignored).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
