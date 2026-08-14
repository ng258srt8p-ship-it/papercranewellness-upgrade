import { useState } from "react";
import { Link } from "../lib/router";
import { CraneMark } from "../components/Logo";
import { PageHero, Reveal, SectionLabel, Shell } from "../components/ui";
import { site, specialties } from "../data/site";
import { cn } from "../utils/cn";

const reasons = ["Trauma / PTSD / EMDR", "Neurodivergent affirming", "General / individual", "Not sure yet"];

function BookingCard() {
  return (
    <div className="relative overflow-hidden rounded-[6px] border border-navy/12 bg-navy p-8 text-mist md:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -bottom-20 h-64 w-64 rounded-full opacity-20 blur-2xl"
        style={{ background: "radial-gradient(circle,#6B7C54 0%,transparent 70%)" }}
      />
      <div className="relative">
        <CraneMark className="h-9 w-9 text-sage-soft" />
        <p className="eyebrow mt-6 text-sage-soft">Preferred route</p>
        <h2 className="display mt-3 text-[1.8rem] leading-tight">Book your free consultation</h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-mist/65 pretty">
          A free 15-minute call or video to see if we&apos;re a good fit. No intake paperwork required.
        </p>
        <Link
          to={site.booking}
          className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-full bg-mist px-7 py-4 text-[0.8125rem] font-medium tracking-wide text-navy transition-colors duration-500 hover:bg-sage hover:text-mist"
        >
          Book Free 15-Minute Consultation
          <span>&rarr;</span>
        </Link>
        <div className="mt-6 grid gap-3 border-t border-white/12 pt-5 text-[0.8125rem] text-mist/55 sm:grid-cols-2">
          <div>
            <p className="text-[0.7rem] tracking-[0.08em] text-mist/35 uppercase">Location</p>
            <p className="mt-1">Mount Pleasant, SC &amp; Virtual</p>
          </div>
          <div>
            <p className="text-[0.7rem] tracking-[0.08em] text-mist/35 uppercase">Insurance</p>
            <p className="mt-1">Cigna &amp; Aetna in-network</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InquiryForm() {
  const [sent, setSent] = useState(false);
  const [reason, setReason] = useState(reasons[0]);

  if (sent) {
    return (
      <div className="rounded-[6px] border border-sage/40 bg-mist/60 p-10">
        <CraneMark className="h-10 w-10 text-sage" />
        <p className="display mt-6 text-[1.7rem] text-navy">Message received!</p>
        <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-navy/62 pretty">
          I&apos;ll get back to you soon. If this is urgent, please call 988 (Suicide &amp; Crisis Lifeline).
        </p>
        <button
          onClick={() => setSent(false)}
          className="link-underline mt-6 text-[0.8125rem] font-medium tracking-[0.04em] text-sage uppercase"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-7"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="grid gap-7 sm:grid-cols-2">
        {[
          { id: "name", label: "Name", type: "text", ph: "Your name" },
          { id: "email", label: "Email", type: "email", ph: "you@example.com" },
        ].map((f) => (
          <div key={f.id}>
            <label htmlFor={f.id} className="eyebrow text-navy/45">
              {f.label}
            </label>
            <input
              id={f.id}
              type={f.type}
              required
              placeholder={f.ph}
              className="mt-3 w-full border-b border-navy/20 bg-transparent pb-3 text-[0.9375rem] text-navy transition-colors duration-300 placeholder:text-navy/25 focus:border-sage focus:outline-none"
            />
          </div>
        ))}
      </div>

      <div>
        <span className="eyebrow text-navy/45">What brings you here</span>
        <div className="mt-4 flex flex-wrap gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReason(r)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.8125rem] transition-all duration-400",
                reason === r
                  ? "border-sage bg-sage text-mist"
                  : "border-navy/12 text-navy/60 hover:border-navy/40 hover:text-navy",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="msg" className="eyebrow text-navy/45">
          Anything else?
        </label>
        <textarea
          id="msg"
          rows={4}
          placeholder="Tell me a little about what's going on. No pressure."
          className="mt-3 w-full resize-none border-b border-navy/20 bg-transparent pb-3 text-[0.9375rem] leading-relaxed text-navy transition-colors duration-300 placeholder:text-navy/25 focus:border-sage focus:outline-none"
        />
      </div>

      <button
        type="submit"
        className="group inline-flex items-center gap-3 rounded-full bg-navy px-8 py-4 text-[0.8125rem] font-medium tracking-wide text-mist transition-colors duration-500 hover:bg-sage"
      >
        Send message
        <span className="transition-transform duration-500 group-hover:translate-x-1">&rarr;</span>
      </button>
    </form>
  );
}

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Step 1:
            <br className="hidden md:block" /> <span className="italic text-sage">Let&apos;s chat.</span>
          </>
        }
        lede="A free 15-minute consultation to see if we're a good match. No strings attached."
        meta={[site.virtual, site.address, site.insurance]}
      />

      <section className="bg-paper py-20 md:py-28">
        <Shell>
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <SectionLabel n="I">Send a message</SectionLabel>
                <p className="display mt-7 max-w-lg text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.12] text-navy balance">
                  Reach out however feels right.
                </p>
              </Reveal>
              <Reveal delay={80} className="mt-10">
                <InquiryForm />
              </Reveal>
            </div>

            <div className="lg:col-span-4 lg:col-start-9">
              <Reveal delay={120}>
                <BookingCard />
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-8 space-y-5 border-t border-navy/12 pt-6">
                  <div>
                    <p className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">Email</p>
                    <a href={`mailto:${site.email}`} className="link-underline mt-1 inline-block text-[0.9375rem] text-navy hover:text-sage">
                      {site.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">Office</p>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-navy/65">{site.address}</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">Hours</p>
                    <p className="mt-1 text-[0.9375rem] text-navy/65">{site.hours}</p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Shell>
      </section>

      <section className="border-y border-navy/10 bg-mist py-16 md:py-20">
        <Shell>
          <Reveal>
            <p className="eyebrow text-navy/40">Or explore a specialty</p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {specialties.map((s) => (
                <Link
                  key={s.slug}
                  to={s.slug}
                  className="group rounded-[4px] border border-navy/10 bg-paper p-6 transition-all duration-500 hover:border-sage/40 hover:shadow-lg hover:shadow-navy/6"
                >
                  <span className="display text-[0.75rem] text-sage">{s.n}</span>
                  <p className="display mt-3 text-[1.2rem] text-navy transition-colors duration-500 group-hover:text-sage">
                    {s.title}
                  </p>
                </Link>
              ))}
            </div>
          </Reveal>
        </Shell>
      </section>
    </>
  );
}
