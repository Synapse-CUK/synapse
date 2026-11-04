import Image from "next/image";
import { ReactNode } from "react";
import { Icons } from "./Icons";
import heroImage from "@/public/landing/hero-laptop.jpg";

const points = [
  { icon: Icons.Verified, text: "Faculty-verified achievements" },
  { icon: Icons.Users, text: "Hackathon teams across sections" },
  { icon: Icons.Lightning, text: "XP for the work you put in" },
];

/** Split layout for the Clerk sign-in and sign-up pages. */
export default function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-12">
      <aside className="relative hidden h-full max-h-[720px] overflow-hidden rounded-2xl lg:block">
        <Image
          src={heroImage}
          alt=""
          placeholder="blur"
          fill
          sizes="50vw"
          className="object-cover object-[62%_center]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/20" />
        <div className="relative flex h-full flex-col justify-end p-10 text-white">
          <h1 className="font-display text-5xl font-semibold leading-[1.05]">{title}</h1>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-[15px] text-white/85">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-gold-soft ring-1 ring-inset ring-white/15">
                  <p.icon className="h-4 w-4" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex flex-col items-center">
        <h1 className="display mb-8 text-center text-4xl lg:hidden">{title}</h1>
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
