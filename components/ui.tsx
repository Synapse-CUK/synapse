"use client";

import { ReactNode, useEffect, useId, useRef } from "react";
import { Icons } from "./Icons";

/* ------------------------------------------------------------------ */
/* Brand                                                               */
/* ------------------------------------------------------------------ */

/** The Synapse monogram: a navy tile with a gold serif "S". */
export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 items-center justify-center rounded-lg bg-navy font-display text-[1.35em] font-bold leading-none text-gold-soft ring-1 ring-inset ring-white/10 ${className}`}
    >
      S
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* People                                                              */
/* ------------------------------------------------------------------ */

export function initialsOf(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

const avatarSizes = {
  sm: "h-8 w-8 text-xs rounded-lg",
  md: "h-10 w-10 text-sm rounded-xl",
  lg: "h-14 w-14 text-lg rounded-xl",
  xl: "h-24 w-24 text-3xl rounded-2xl",
} as const;

/** Initials on navy with a thin gold ring. */
export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name?: string | null;
  size?: keyof typeof avatarSizes;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 select-none items-center justify-center bg-navy font-semibold tracking-wide text-gold-soft ring-1 ring-gold/40 ${avatarSizes[size]} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

const alertTones = {
  success: { box: "border-success/25 bg-success-tint text-success", icon: Icons.Check },
  error: { box: "border-danger/25 bg-danger-tint text-danger", icon: Icons.Warning },
  warning: { box: "border-gold/35 bg-gold-tint text-gold-ink", icon: Icons.Hourglass },
  info: { box: "border-royal/25 bg-royal-tint text-royal", icon: Icons.Pending },
} as const;

export function Alert({
  tone,
  title,
  children,
  className = "",
}: {
  tone: keyof typeof alertTones;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { box, icon: Icon } = alertTones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${box} ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 space-y-0.5">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? "text-body" : "font-medium"}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`panel flex flex-col items-center px-6 py-14 text-center ${className}`}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/30 bg-gold-tint text-gold-ink">
        {icon}
      </div>
      <h3 className="display text-2xl">{title}</h3>
      {children && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{children}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/** Centred status screen for loading, not-found and access-denied states. */
export function StatusScreen({
  icon,
  title,
  children,
  action,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface text-gold-ink shadow-soft">
        {icon}
      </div>
      <h1 className="display text-4xl">{title}</h1>
      {children && <div className="mt-3 text-[15px] leading-relaxed text-muted">{children}</div>}
      {action && <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}

export function LoadingScreen({ label }: { label: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm font-medium text-muted">
        <Spinner className="h-5 w-5 text-gold" />
        <span>{label}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function PageHeader({
  title,
  description,
  actions,
  meta,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-line pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl space-y-3">
        {meta}
        <h1 className="display text-4xl md:text-5xl">{title}</h1>
        {description && <p className="text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

/** Team capacity drawn as one seat per member slot. */
export function SeatMeter({ filled, total }: { filled: number; total: number }) {
  const seats = Math.max(total, 1);
  return (
    <div className="flex items-center gap-1" aria-label={`${filled} of ${total} seats filled`}>
      {Array.from({ length: seats }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 flex-1 rounded-full ${i < filled ? (filled >= total ? "bg-gold" : "bg-ink") : "bg-line"}`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Parents often pass a new onClose each render (live Convex data re-renders
  // them). Keep the latest in a ref so the effect below only runs on open/close
  // and never pulls focus out of a field the user is typing in.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const width = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close dialog"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-navy/55 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full ${width} animate-modal-in flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-modal outline-none sm:rounded-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold-tint text-gold-ink">
                {icon}
              </span>
            )}
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-ink">
                {title}
              </h2>
              {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-ghost h-9 w-9 shrink-0 px-0">
            <Icons.X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
