import { redirect } from "next/navigation";

// There is no public landing page. Signed-in users land on the feed; the
// middleware sends everyone else from /feed to /sign-in.
export default function Home() {
  redirect("/feed");
}
