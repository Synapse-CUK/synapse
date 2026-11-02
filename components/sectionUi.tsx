import { Icons } from "@/components/Icons";

/** Badge colours for a section, or the neutral style for "all sections". */
export function sectionBadgeClass(section: string | undefined): string {
  switch (section) {
    case "IT":
      return "badge-it";
    case "IoT":
      return "badge-iot";
    case "CSE":
      return "badge-cse";
    default:
      return "bg-slate-100 border border-slate-200 text-slate-600";
  }
}

/** Border and fill for a selected section button in a form. */
export function sectionSelectedClass(section: string): string {
  switch (section) {
    case "IT":
      return "border-blue-500 bg-blue-50 text-blue-700";
    case "IoT":
      return "border-amber-500 bg-amber-50 text-amber-700";
    default:
      return "border-violet-500 bg-violet-50 text-violet-700";
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
