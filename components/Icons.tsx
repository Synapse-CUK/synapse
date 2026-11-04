// Project icon set. Every glyph shares one 20px grid, a 1.75 stroke and round
// caps so icons look consistent next to each other.

type IconProps = React.SVGProps<SVGSVGElement>;

const stroke = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const Icons = {
  // Sections
  IT: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <rect x="2.5" y="3.5" width="15" height="10" rx="2" />
      <path d="M7 17h6M10 13.5V17M6.5 7l2 1.75-2 1.75M10.5 10.5h3" />
    </svg>
  ),
  IoT: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <circle cx="10" cy="10" r="2" />
      <path d="M6.2 6.2a5.4 5.4 0 0 0 0 7.6M13.8 6.2a5.4 5.4 0 0 1 0 7.6M3.6 3.6a9 9 0 0 0 0 12.8M16.4 3.6a9 9 0 0 1 0 12.8" />
    </svg>
  ),
  CSE: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M6.5 6 2.5 10l4 4M13.5 6l4 4-4 4M11.5 4l-3 12" />
    </svg>
  ),

  // Status
  Verified: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M10 2l2.1 1.6 2.6-.1.8 2.5 2.1 1.5-.8 2.5.8 2.5-2.1 1.5-.8 2.5-2.6-.1L10 18l-2.1-1.6-2.6.1-.8-2.5-2.1-1.5.8-2.5-.8-2.5 2.1-1.5.8-2.5 2.6.1L10 2z" />
      <path d="M7.25 10.25l1.85 1.85 3.65-3.85" />
    </svg>
  ),
  Pending: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v4l2.5 2" />
    </svg>
  ),
  Hourglass: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M5 2.5h10M5 17.5h10M6 2.5v2.2a4 4 0 0 0 1.6 3.2L10 10l2.4-2.1A4 4 0 0 0 14 4.7V2.5M6 17.5v-2.2a4 4 0 0 1 1.6-3.2L10 10l2.4 2.1a4 4 0 0 1 1.6 3.2v2.2" />
    </svg>
  ),
  Rejected: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" />
    </svg>
  ),
  Warning: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M8.7 3.3 2 15a1.5 1.5 0 0 0 1.3 2.25h13.4A1.5 1.5 0 0 0 18 15L11.3 3.3a1.5 1.5 0 0 0-2.6 0z" />
      <path d="M10 8v3.5M10 14.25v.01" />
    </svg>
  ),

  // Roles
  Student: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M10 3l8 3.75-8 3.75-8-3.75L10 3z" />
      <path d="M5 8.75v4.5c0 1.5 2.25 2.75 5 2.75s5-1.25 5-2.75v-4.5M18 6.75v4.5" />
    </svg>
  ),
  Faculty: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <circle cx="8" cy="6.5" r="3" />
      <path d="M2.5 17v-.5a5.5 5.5 0 0 1 11 0v.5M14 6.5l1.5 1.5 3-3" />
    </svg>
  ),
  Crown: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M3 6.5l3.5 3L10 4l3.5 5.5L17 6.5l-1.5 8h-11L3 6.5zM4.5 17h11" />
    </svg>
  ),

  // Objects and actions
  Lightning: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M11 2 4 11h5.5L9 18l7-9h-5.5L11 2z" />
    </svg>
  ),
  Trophy: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M6 3h8v5.5a4 4 0 0 1-8 0V3zM6 5H3.5v1A2.5 2.5 0 0 0 6 8.5M14 5h2.5v1A2.5 2.5 0 0 1 14 8.5M10 12.5V15M7 17.5h6M8 15h4" />
    </svg>
  ),
  Rocket: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M11.5 14.5 8 11l1-2.5C10.8 4 14 2.5 17.5 2.5 17.5 6 16 9.2 11.5 11l-.5 3.5z" />
      <path d="M8 11 5 10.5l2-3 3 .5M11.5 14.5l-.5 3 3-2 0-3M4.5 15.5c-1 1-1 2-1 2s1 0 2-1" />
      <circle cx="13" cy="7" r="1.25" />
    </svg>
  ),
  Users: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <circle cx="7.5" cy="7" r="3" />
      <path d="M2 16.5a5.5 5.5 0 0 1 11 0M13 4.25a3 3 0 0 1 0 5.5M15.5 12a5.5 5.5 0 0 1 2.5 4.5" />
    </svg>
  ),
  Edit: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M3.5 16.5h3.25l8.6-8.6a2.3 2.3 0 0 0-3.25-3.25L3.5 13.25v3.25zM11 5.75l3.25 3.25" />
    </svg>
  ),
  Plus: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  ),
  Check: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  ),
  X: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </svg>
  ),
  Search: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <circle cx="9" cy="9" r="5.5" />
      <path d="M17 17l-4-4" />
    </svg>
  ),
  Paperclip: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M16 9.5l-5.9 5.9a3.75 3.75 0 0 1-5.3-5.3l6.2-6.2a2.5 2.5 0 0 1 3.55 3.55L8.3 13.7a1.25 1.25 0 0 1-1.77-1.77L12 6.5" />
    </svg>
  ),
  ChevronRight: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M8 5l5 5-5 5" />
    </svg>
  ),
  ArrowRight: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M3.5 10h13M11.5 5l5 5-5 5" />
    </svg>
  ),
  ArrowUpRight: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M6 14l8-8M7 6h7v7" />
    </svg>
  ),
  Sparkles: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M9 3l1.4 4.1L14.5 8.5l-4.1 1.4L9 14l-1.4-4.1L3.5 8.5l4.1-1.4L9 3zM15 12.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z" />
    </svg>
  ),
  Globe: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15M10 2.5c-2 2.2-3 4.7-3 7.5s1 5.3 3 7.5M10 2.5c2 2.2 3 4.7 3 7.5s-1 5.3-3 7.5" />
    </svg>
  ),
  Activity: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M2 10h3l2.5-5.5 4 11L14 10h4" />
    </svg>
  ),
  Shield: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M10 2.5l6 2.5v4.5c0 3.7-2.6 6.6-6 8-3.4-1.4-6-4.3-6-8V5l6-2.5z" />
      <path d="M7.5 10l1.75 1.75L12.75 8.5" />
    </svg>
  ),
  Chat: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M4 15.5 2.75 18l3.5-1.5A7.5 7.5 0 1 0 4 15.5z" />
      <path d="M7 9h6M7 12h4" />
    </svg>
  ),
  Trash: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5 5.5l.8 10.6A1.5 1.5 0 0 0 7.3 17.5h5.4a1.5 1.5 0 0 0 1.5-1.4L15 5.5M8.5 9v5M11.5 9v5" />
    </svg>
  ),
  Chart: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <path d="M3 3v14h14M7 13.5V10M10.5 13.5V6.5M14 13.5V9" />
    </svg>
  ),
  Certificate: (props: IconProps) => (
    <svg {...stroke} {...props}>
      <rect x="2.5" y="3.5" width="15" height="10.5" rx="1.5" />
      <path d="M6 7h8M6 10h4M13 12.5l-.5 4.5 1.5-1 1.5 1-.5-4.5" />
    </svg>
  ),
  Github: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  ),
};
