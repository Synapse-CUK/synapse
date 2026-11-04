import { Icons } from "./Icons";

export default function EventStatusChip({ status }: { status: string }) {
  if (status === "recruiting") {
    return (
      <span className="chip-success">
        <Icons.Rocket className="h-3.5 w-3.5" />
        Recruiting
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="chip-royal">
        <Icons.Activity className="h-3.5 w-3.5" />
        In progress
      </span>
    );
  }
  return (
    <span className="chip-neutral">
      <Icons.Check className="h-3.5 w-3.5" />
      Completed
    </span>
  );
}
