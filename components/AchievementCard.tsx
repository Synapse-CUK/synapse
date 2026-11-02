"use client";

import Link from "next/link";
import { Icons } from "./Icons";
import { SectionIcon, sectionBadgeClass } from "./sectionUi";

export type AchievementItem = {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "verified" | "rejected";
  createdAt: number;
  proofUrl?: string | null;
  author?: {
    _id: string;
    name: string;
    section?: string;
    year?: number;
    role?: string;
  } | null;
};

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function AchievementCard({ item }: { item: AchievementItem }) {
  const authorInitials = item.author?.name
    ? item.author.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?";

  const isImage = item.proofUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.proofUrl);

  return (
    <article className="social-card card-shadow hover:card-shadow-md p-6 space-y-4">
      {/* Author Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {item.author?._id ? (
            <Link href={`/profile/${item.author._id}`}>
              <div className="w-11 h-11 rounded-xl gradient-teal flex items-center justify-center text-white font-black text-base shrink-0 hover:opacity-90 transition">
                {authorInitials}
              </div>
            </Link>
          ) : (
            <div className="w-11 h-11 rounded-xl gradient-teal flex items-center justify-center text-white font-black text-base shrink-0">
              {authorInitials}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {item.author?._id ? (
                <Link
                  href={`/profile/${item.author._id}`}
                  className="font-bold text-slate-900 hover:text-teal-700 transition leading-tight"
                >
                  {item.author?.name || "Student"}
                </Link>
              ) : (
                <span className="font-bold text-slate-900">{item.author?.name || "Student"}</span>
              )}

              {/* Section Badge */}
              {item.author?.section && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${sectionBadgeClass(item.author.section)}`}>
                  <SectionIcon section={item.author.section} className="w-3 h-3" />
                  {item.author.section}
                  {item.author.year && ` · Yr ${item.author.year}`}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5">{timeAgo(item.createdAt)}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          {item.status === "verified" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold badge-verified">
              <Icons.Verified className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : item.status === "pending" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold badge-pending">
              <Icons.Pending className="w-3.5 h-3.5" />
              Pending
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-700">
              <Icons.Rejected className="w-3.5 h-3.5" />
              Rejected
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-900 leading-snug">{item.title}</h3>

      {/* Description */}
      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>

      {/* Proof Attachment */}
      {item.proofUrl && (
        <div className="rounded-2xl overflow-hidden border border-slate-200">
          {isImage ? (
            <a href={item.proofUrl} target="_blank" rel="noopener noreferrer" className="block group relative">
              <img
                src={item.proofUrl}
                alt="Achievement proof"
                className="w-full max-h-72 object-cover group-hover:opacity-90 transition"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg">
                  View Full Image
                </span>
              </div>
            </a>
          ) : (
            <a
              href={item.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                <Icons.Paperclip className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">View Certificate / Proof</p>
                <p className="text-xs text-slate-400">Click to open attachment</p>
              </div>
              <Icons.ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
