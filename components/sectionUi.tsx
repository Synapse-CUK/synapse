import { Icons } from "@/components/Icons";

/**
 * Each section gets one colour from the brand palette:
 * CSE is navy, IT is royal blue and IoT is gold.
 */
export function sectionBadgeClass(section: string | undefined): string {
  switch (section) {
    case "IT":
      return "chip-royal";
    case "IoT":
      return "chip-gold";
    case "CSE":
      return "chip-navy";
    default:
      return "chip-neutral";
  }
}

/** Border and fill for a selected section button in a form. */
export function sectionSelectedClass(section: string): string {
  switch (section) {
    case "IT":
      return "border-royal bg-royal-tint text-royal";
    case "IoT":
      return "border-gold bg-gold-tint text-gold-ink";
    default:
      return "border-ink bg-navy-tint text-ink";
  }
}

export function SectionIcon({
  section,
  className,
}: {
  section: string | undefined;
  className?: string;
}) {
  switch (section) {
    case "IT":
      return <Icons.IT className={className} />;
    case "IoT":
      return <Icons.IoT className={className} />;
    case "CSE":
      return <Icons.CSE className={className} />;
    default:
      return <Icons.Globe className={className} />;
  }
}

/** Icon for a role, used next to ROLE_META labels. */
export function RoleIcon({ role, className = "h-3.5 w-3.5" }: { role: string; className?: string }) {
  switch (role) {
    case "coordinator":
      return <Icons.Crown className={className} />;
    case "faculty":
      return <Icons.Faculty className={className} />;
    case "faculty_pending":
      return <Icons.Hourglass className={className} />;
    default:
      return <Icons.Student className={className} />;
  }
}
