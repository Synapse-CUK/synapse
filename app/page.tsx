import Link from "next/link";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <header className="absolute top-0 right-0 p-6 flex gap-4 items-center">
        <SignedIn>
          <Link
            href="/feed"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition text-white"
          >
            Go to Feed
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition text-white">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
      </header>

      <main className="max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent mb-6">
          Synapse
        </h1>
        <p className="text-xl text-slate-400 mb-8 leading-relaxed">
          The official LinkedIn-style network and hackathon collaboration platform
          for CSE, IT & IoT students and faculty. Share achievements, form teams, and verify accomplishments.
        </p>

        <div className="flex gap-4 justify-center">
          <SignedIn>
            <Link
              href="/feed"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition"
            >
              Explore Student Feed
            </Link>
          </SignedIn>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/20 transition">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <Link
            href="/events"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold transition"
          >
            Browse Hackathons & Projects
          </Link>
        </div>
      </main>
    </div>
  );
}
