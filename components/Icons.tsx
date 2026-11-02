// Centralized SVG icon system — no OS emoji dependency

export const Icons = {
  // Section Icons
  IT: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="2" y="3" width="16" height="11" rx="2" strokeLinejoin="round" />
      <path d="M7 18h6M10 14v4" strokeLinecap="round" />
      <path d="M6 7l2 2-2 2M10 11h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  IoT: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M5.5 5.5a6.5 6.5 0 0 0 0 9M14.5 5.5a6.5 6.5 0 0 1 0 9" strokeLinecap="round" />
      <path d="M3 3a10 10 0 0 0 0 14M17 3a10 10 0 0 1 0 14" strokeLinecap="round" />
    </svg>
  ),
  CSE: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M6.5 6L2.5 10l4 4M13.5 6l4 4-4 4M11.5 4l-3 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // Status Icons
  Verified: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M10 1.5l2.4 3.4 4-.8-1.4 3.8 2.5 3.1-4.1.5L10 15l-3.4-3.5-4.1-.5 2.5-3.1L3.6 4.1l4 .8L10 1.5z" strokeLinejoin="round" />
      <path d="M7.5 10l1.8 1.8L12.5 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Pending: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Rejected: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="10" cy="10" r="8" />
      <path d="M7 7l6 6M13 7l-6 6" strokeLinecap="round" />
    </svg>
  ),

  // Role Icons
  Student: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M10 2l9 4-9 4-9-4 9-4z" strokeLinejoin="round" />
      <path d="M4 8.5V14c0 2 2.7 3.5 6 3.5s6-1.5 6-3.5V8.5" strokeLinecap="round" />
      <path d="M19 6v5" strokeLinecap="round" />
    </svg>
  ),
  Faculty: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="10" cy="6" r="3" />
      <path d="M4 17v-1a6 6 0 0 1 12 0v1" strokeLinecap="round" />
      <path d="M15 3l1.5 1.5L19 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),

  // Action Icons
  Lightning: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M11.3 1L3 11h7l-1.3 8L17 9h-7l1.3-8z" strokeLinejoin="round" />
    </svg>
  ),
  Trophy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M5 3h10v7a5 5 0 0 1-10 0V3z" strokeLinejoin="round" />
      <path d="M2 5h3M15 5h3M10 15v3M7 18h6" strokeLinecap="round" />
    </svg>
  ),
  Rocket: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M10 2c0 0 4.5 2 4.5 8L12 13H8l-2.5-3C5.5 4 10 2 10 2z" strokeLinejoin="round" />
      <path d="M8 13l-1.5 4h7L12 13" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  Users: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="8" cy="6" r="3" />
      <path d="M2 18v-2a6 6 0 0 1 8.4-5.5" strokeLinecap="round" />
      <circle cx="15" cy="11" r="2.5" />
      <path d="M10 18v-1a5 5 0 0 1 10 0v1" strokeLinecap="round" />
    </svg>
  ),
  Edit: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M3 17h4l9.5-9.5a2.12 2.12 0 0 0-3-3L4 14v3z" strokeLinejoin="round" />
      <path d="M14 5l1 1" strokeLinecap="round" />
    </svg>
  ),
  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path d="M10 4v12M4 10h12" strokeLinecap="round" />
    </svg>
  ),
  Star: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 1.5l2.4 3.4 4-.8-1.4 3.8 2.5 3.1-4.1.5L10 15l-3.4-3.5-4.1-.5 2.5-3.1L3.6 4.1l4 .8L10 1.5z" />
    </svg>
  ),
  Github: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path d="M4 10l5 5L16 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  X: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
    </svg>
  ),
  Search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="M20 20l-4.35-4.35" strokeLinecap="round" />
    </svg>
  ),
  Paperclip: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M18 1l-8 8a4 4 0 0 0 5.66 5.66L19 11M2 18l6-6M11 5l-7 7a7 7 0 0 0 9.9 9.9l7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 2l1.5 4.5L16 8l-4.5 1.5L10 14l-1.5-4.5L4 8l4.5-1.5L10 2zM16.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2L13.5 17l2.2-.8.8-2.2zM3.5 1l.6 1.9L6 3.5l-1.9.6L3.5 6l-.6-1.9L1 3.5l1.9-.6L3.5 1z" />
    </svg>
  ),
  Globe: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="10" cy="10" r="8" />
      <path d="M2 10h16M10 2c-2 3-3 5-3 8s1 5 3 8M10 2c2 3 3 5 3 8s-1 5-3 8" strokeLinecap="round" />
    </svg>
  ),
  Activity: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <path d="M1 10h3l3-7 4 14 3-10 2 3h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Shield: (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M10 1.5l7 3v5c0 4-3 7-7 9-4-2-7-5-7-9v-5l7-3z" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};
