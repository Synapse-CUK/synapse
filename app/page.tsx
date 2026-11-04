import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Icons } from "@/components/Icons";
import { BrandMark, Reveal, Avatar } from "@/components/ui";
import { getClassCode } from "@/convex/lib/semester";
import heroImage from "@/public/landing/hero-laptop.jpg";
import notesImage from "@/public/landing/notes.jpg";
import hackathonImage from "@/public/landing/hackathon.jpg";
import workspaceImage from "@/public/landing/workspace.jpg";

// Photos: Alejandro Escamilla and others via Unsplash (Unsplash License), self-hosted.

function PrimaryCta({ size = "btn-lg", tone = "btn-primary" }: { size?: string; tone?: string }) {
  return (
    <>
      <SignedOut>
        <Link href="/sign-up" className={`${tone} ${size} group`}>
          Join Synapse
          <Icons.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </SignedOut>
      <SignedIn>
        <Link href="/feed" className={`${tone} ${size} group`}>
          Open your feed
          <Icons.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </SignedIn>
    </>
  );
}

const flow = [
  {
    icon: Icons.Certificate,
    title: "Post",
    body: "Share a win with a photo or PDF of the certificate. Posting earns 10 XP.",
  },
  {
    icon: Icons.Verified,
    title: "Verify",
    body: "Faculty check the proof. Approved posts get a Verified mark and 50 more XP.",
  },
  {
    icon: Icons.Trophy,
    title: "Grow",
    body: "Your profile gathers verified work, skills and XP in one place.",
  },
];

const sections = [
  { code: "CSE", icon: Icons.CSE, chip: "chip-navy", body: "Algorithms, systems and machine learning projects." },
  { code: "IT", icon: Icons.IT, chip: "chip-royal", body: "Web, cloud and networking work." },
  { code: "IoT", icon: Icons.IoT, chip: "chip-gold", body: "Embedded builds, sensors and edge devices." },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* Hero */}
      <section className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_15%_0%,rgb(var(--gold)/0.10),transparent_70%)]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-10 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28 lg:pt-20">
          <div className="lg:col-span-6 xl:col-span-5">
            <p
              className="mb-6 flex animate-rise items-center gap-3 text-sm font-semibold text-gold-ink"
              style={{ animationDelay: "40ms" }}
            >
              <span aria-hidden className="h-px w-8 bg-gold" />
              For CSE, IT and IoT students and faculty
            </p>
            <h1
              className="display animate-rise pb-1 text-5xl leading-[1.04] sm:text-6xl xl:text-[4.5rem]"
              style={{ animationDelay: "120ms" }}
            >
              Campus work, <em className="font-medium italic text-royal">verified.</em>
            </h1>
            <p
              className="mt-6 max-w-md animate-rise text-lg leading-relaxed text-body"
              style={{ animationDelay: "220ms" }}
            >
              Post achievements, get them verified by faculty, and build hackathon teams across sections.
            </p>
            <div className="mt-9 flex animate-rise flex-wrap items-center gap-3" style={{ animationDelay: "320ms" }}>
              <PrimaryCta />
              <Link href="/events" className="btn-secondary btn-lg">
                Browse projects
              </Link>
            </div>
          </div>

          <div className="relative animate-rise lg:col-span-6 xl:col-span-7" style={{ animationDelay: "260ms" }}>
            <div className="relative overflow-hidden rounded-2xl border border-line shadow-lift">
              <Image
                src={heroImage}
                alt="A student typing on a laptop at a wooden desk"
                priority
                placeholder="blur"
                sizes="(min-width: 1280px) 720px, (min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/3] h-auto w-full object-cover object-[62%_center] lg:aspect-[5/4]"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy/35 via-transparent to-transparent" />
            </div>

            {/* A real achievement card, as it appears in the feed */}
            <div className="panel relative -mt-16 ml-4 mr-10 max-w-sm p-5 shadow-lift sm:ml-8 lg:absolute lg:-bottom-10 lg:-left-10 lg:m-0">
              <div className="flex items-center gap-3">
                <Avatar name="Neha Varghese" size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">Neha Varghese</p>
                  <span className="chip-navy mt-1 font-mono">
                    <Icons.CSE className="h-3 w-3" />
                    {getClassCode(5, "CSE")}
                  </span>
                </div>
                <span className="chip-success ml-auto">
                  <Icons.Verified className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
              <p className="mt-4 text-[15px] font-semibold leading-snug text-ink">
                Second place in the inter-department robotics challenge
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                <span className="chip-gold">
                  <Icons.Lightning className="h-3 w-3" />
                  +50 XP
                </span>
                Approved by faculty
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line bg-surface/60">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-32">
          <Reveal className="lg:col-span-5">
            <h2 className="display text-4xl md:text-5xl">From a certificate to a verified record.</h2>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-body">
              Every post goes to faculty for review, so what shows on a profile is work someone has checked.
            </p>
            <div className="mt-10 overflow-hidden rounded-2xl border border-line">
              <Image
                src={notesImage}
                alt="Hands writing notes in a notebook beside a laptop"
                placeholder="blur"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-[16/10] h-auto w-full object-cover"
              />
            </div>
          </Reveal>

          <ol className="self-center lg:col-span-6 lg:col-start-7">
            {flow.map((step, i) => (
              <li key={step.title}>
                <Reveal
                  delay={i * 90}
                  className={`flex gap-6 py-9 ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold-tint text-gold-ink">
                    <step.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="display text-3xl">{step.title}</h3>
                    <p className="mt-2 max-w-md leading-relaxed text-body">{step.body}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <Reveal>
          <h2 className="display max-w-2xl text-4xl md:text-5xl">Everything a project team needs, in one place.</h2>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3 md:grid-rows-[auto_auto_auto]">
          {/* Verification */}
          <Reveal className="relative overflow-hidden rounded-2xl bg-band p-8 text-band-ink md:col-span-2 md:row-span-2 md:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgb(var(--gold)/0.35),transparent_65%)]"
            />
            <div className="relative flex h-full flex-col">
              <Icons.Shield className="h-8 w-8 text-gold-soft" />
              <h3 className="mt-8 font-display text-4xl font-semibold leading-tight text-band-ink md:text-5xl">
                Faculty verification
              </h3>
              <p className="mt-4 max-w-md leading-relaxed text-band-ink/75">
                Teachers see a queue of new posts with the proof attached, and approve or reject each one.
              </p>
              <div className="mt-auto flex flex-wrap items-center gap-3 pt-12">
                <span className="inline-flex h-9 items-center gap-2 rounded-full border border-gold-soft/40 bg-white/5 px-4 text-sm font-semibold text-gold-soft">
                  <Icons.Pending className="h-4 w-4" />
                  Pending review
                </span>
                <Icons.ArrowRight className="h-4 w-4 text-band-ink/50" />
                <span className="inline-flex h-9 items-center gap-2 rounded-full bg-gold-soft px-4 text-sm font-semibold text-navy">
                  <Icons.Verified className="h-4 w-4" />
                  Verified, +50 XP
                </span>
              </div>
            </div>
          </Reveal>

          {/* Hackathons */}
          <Reveal delay={80} className="relative min-h-[280px] overflow-hidden rounded-2xl">
            <Image
              src={hackathonImage}
              alt="A crowd with raised hands under stage lights"
              placeholder="blur"
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-navy/10" />
            <div className="relative flex h-full flex-col justify-end p-7">
              <h3 className="font-display text-3xl font-semibold text-white">Hackathon teams</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/80">
                Set section and semester rules, then review who asks to join.
              </p>
            </div>
          </Reveal>

          {/* Class codes */}
          <Reveal delay={140} className="rounded-2xl border border-gold/30 bg-gold-tint p-7">
            <div className="flex flex-wrap gap-2">
              <span className="chip-navy bg-surface font-mono">{getClassCode(5, "CSE")}</span>
              <span className="chip-royal bg-surface font-mono">{getClassCode(3, "IT")}</span>
              <span className="chip-gold bg-surface font-mono">{getClassCode(7, "IoT")}</span>
            </div>
            <h3 className="display mt-7 text-3xl">Class codes</h3>
            <p className="mt-2 text-sm leading-relaxed text-body">
              Worked out from your admission year, so event eligibility checks itself.
            </p>
          </Reveal>

          {/* Chat */}
          <Reveal className="panel p-7">
            <Icons.Chat className="h-7 w-7 text-royal" />
            <h3 className="display mt-7 text-3xl">Talk before you accept</h3>
            <p className="mt-2 text-sm leading-relaxed text-body">
              Hosts and applicants can message on a join request before anyone commits.
            </p>
          </Reveal>

          {/* Coordinator */}
          <Reveal
            delay={80}
            className="flex flex-col justify-between gap-8 rounded-2xl border border-royal/20 bg-royal-tint p-7 md:col-span-2 md:flex-row md:items-end"
          >
            <div>
              <Icons.Crown className="h-7 w-7 text-royal" />
              <h3 className="display mt-7 text-3xl">Coordinator controls</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-body">
                Approve faculty accounts, moderate posts and keep events tidy from one dashboard.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <span className="chip-navy bg-surface">
                <Icons.Faculty className="h-3.5 w-3.5" />
                Faculty approvals
              </span>
              <span className="chip-navy bg-surface">
                <Icons.Users className="h-3.5 w-3.5" />
                Roles
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Sections */}
      <section className="border-y border-line bg-surface/60">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-32">
          <Reveal className="order-2 lg:order-1 lg:col-span-5">
            <div className="overflow-hidden rounded-2xl border border-line">
              <Image
                src={workspaceImage}
                alt="An open laptop beside a notebook and a camera on a wooden table"
                placeholder="blur"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="aspect-square h-auto w-full object-cover"
              />
            </div>
          </Reveal>

          <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
            <Reveal>
              <h2 className="display text-4xl md:text-5xl">Three sections, one network.</h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-body">
                Teams can mix sections, or an event can stay open to one section and chosen semesters.
              </p>
            </Reveal>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {sections.map((s, i) => (
                <li key={s.code} className={i === 0 ? "sm:col-span-2" : ""}>
                  <Reveal delay={i * 80} className="panel flex h-full items-start gap-4 p-5">
                    <span className={`${s.chip} h-10 w-10 justify-center px-0`}>
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-ink">{s.code}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
        <Reveal className="relative overflow-hidden rounded-2xl bg-band px-8 py-16 text-center md:px-16 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-40 mx-auto h-80 w-[48rem] max-w-full rounded-full bg-[radial-gradient(closest-side,rgb(var(--gold)/0.28),transparent)]"
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-tight text-band-ink md:text-6xl">
              Put your next project on the record.
            </h2>
            <div className="mt-10 flex justify-center">
              <PrimaryCta tone="btn-accent" />
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <BrandMark className="h-7 w-7" />
            <p className="text-sm text-muted">A student-built network for the CSE, IT and IoT sections.</p>
          </div>
          <nav aria-label="Footer" className="flex gap-6 text-sm font-semibold text-muted">
            <Link href="/feed" className="hover:text-ink">
              Feed
            </Link>
            <Link href="/events" className="hover:text-ink">
              Projects
            </Link>
            <Link href="/sign-in" className="hover:text-ink">
              Sign in
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
