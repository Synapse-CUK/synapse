import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Local-development helper for the one-click test logins on /sign-in.
 *
 * Returns a single-use Clerk sign-in ticket for one of the qa01 accounts made
 * by scripts/seed-qa-users.mjs. The browser still signs in through Clerk, so
 * Convex sees a normal Clerk session and every role check still applies. No
 * password is stored or sent.
 *
 * Disabled everywhere except `next dev` on localhost with a Clerk development
 * key. Production builds return 404.
 */
const DEV_ACCOUNTS = {
  student: "qa01-student+clerk_test@example.com",
  faculty: "qa01-faculty+clerk_test@example.com",
  coordinator: "qa01-coordinator+clerk_test@example.com",
} as const;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

function notFound() {
  return new NextResponse(null, { status: 404 });
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") return notFound();
  if (!LOCAL_HOSTS.has(req.nextUrl.hostname)) return notFound();
  if (!process.env.CLERK_SECRET_KEY?.startsWith("sk_test_")) return notFound();

  const body = (await req.json().catch(() => null)) as { role?: string } | null;
  const role = body?.role;
  if (!role || !(role in DEV_ACCOUNTS)) {
    return NextResponse.json({ error: "Unknown role." }, { status: 400 });
  }
  const email = DEV_ACCOUNTS[role as keyof typeof DEV_ACCOUNTS];

  const clerk = await clerkClient();
  const { data: users } = await clerk.users.getUserList({ emailAddress: [email] });
  const user = users[0];
  if (!user) {
    return NextResponse.json(
      { error: `${email} doesn't exist in Clerk. Run: node scripts/seed-qa-users.mjs --testers 1 --deployment dev` },
      { status: 404 },
    );
  }

  const { token } = await clerk.signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 60 });
  return NextResponse.json({ ticket: token });
}
