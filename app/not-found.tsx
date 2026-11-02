import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="text-slate-500">This page doesn&apos;t exist or has moved.</p>
      <Link
        href="/feed"
        className="inline-block px-6 py-3 gradient-teal text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition"
      >
        Back to feed
      </Link>
    </div>
  );
}
