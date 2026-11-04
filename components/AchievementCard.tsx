"use client";

import Link from "next/link";
import { Icons } from "./Icons";
import { SectionIcon, sectionBadgeClass } from "./sectionUi";
import { Avatar } from "./ui";

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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function StatusChip({ status }: { status: AchievementItem["status"] }) {
  if (status === "verified") {
    return (
      <span className="chip-success">
        <Icons.Verified className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="chip-gold">
        <Icons.Pending className="h-3.5 w-3.5" />
        In review
      </span>
    );
  }
  return (
    <span className="chip-danger">
      <Icons.Rejected className="h-3.5 w-3.5" />
      Rejected
    </span>
  );
}

export default function AchievementCard({ item }: { item: AchievementItem }) {
  const authorName = item.author?.name || "Student";
  const isImage = item.proofUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(item.proofUrl);

  return (
    <article className="panel p-6 transition hover:border-line-strong">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {item.author?._id ? (
            <Link href={`/profile/${item.author._id}`} className="rounded-xl" aria-label={`${authorName}'s profile`}>
              <Avatar name={authorName} />
            </Link>
          ) : (
            <Avatar name={authorName} />
          )}

          <div className="min-w-0">
            {item.author?._id ? (
              <Link
                href={`/profile/${item.author._id}`}
                className="block truncate font-semibold text-ink transition hover:text-royal"
              >
                {authorName}
              </Link>
            ) : (
              <span className="block truncate font-semibold text-ink">{authorName}</span>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
              {item.author?.section && (
                <span className={sectionBadgeClass(item.author.section)}>
                  <SectionIcon section={item.author.section} className="h-3 w-3" />
                  {item.author.section}
                  {item.author.year ? ` Year ${item.author.year}` : ""}
                </span>
              )}
              <time dateTime={new Date(item.createdAt).toISOString()}>{timeAgo(item.createdAt)}</time>
            </div>
          </div>
        </div>

        <StatusChip status={item.status} />
      </header>

      <h3 className="mt-5 text-lg font-semibold leading-snug text-ink">{item.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-body">{item.description}</p>

      {item.proofUrl && (
        <div className="mt-5 overflow-hidden rounded-xl border border-line">
          {isImage ? (
            <a href={item.proofUrl} target="_blank" rel="noopener noreferrer" className="group relative block">
              {/* Proof images come from Convex storage, so next/image would need a remote pattern per deployment. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.proofUrl}
                alt={`Proof for ${item.title}`}
                loading="lazy"
                className="max-h-80 w-full object-cover transition duration-300 group-hover:scale-[1.01]"
              />
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-navy/80 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                Open full image
                <Icons.ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </a>
          ) : (
            <a
              href={item.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-sunken/60 p-4 transition hover:bg-sunken"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-surface text-royal">
                <Icons.Certificate className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">Certificate or proof</span>
                <span className="block text-xs text-muted">Opens in a new tab</span>
              </span>
              <Icons.ArrowUpRight className="ml-auto h-4 w-4 text-muted transition group-hover:text-ink" />
            </a>
          )}
        </div>
      )}
    </article>
  );
}
