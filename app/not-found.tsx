import Link from "next/link";
import { Icons } from "@/components/Icons";
import { StatusScreen } from "@/components/ui";

export default function NotFound() {
  return (
    <StatusScreen
      icon={<Icons.Search className="h-7 w-7" />}
      title="Page not found"
      action={
        <Link href="/feed" className="btn-primary">
          Back to feed
        </Link>
      }
    >
      This page doesn&apos;t exist or has moved.
    </StatusScreen>
  );
}
