import { useEffect, useRef, useState } from "react";
import { Link } from "../lib/router";
import { openSimplePractice, type WidgetKind } from "../lib/simplepractice";
import { site } from "../data/site";
import { cn } from "../utils/cn";

/* ---------------------------------------------------------------- reveal */
export function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "rise",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: "rise" | "clip";
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(variant === "clip" ? "reveal-clip" : "reveal", seen && "is-visible", className)}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------------- layout */
export function Shell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1320px] px-6 md:px-10 lg:px-14", className)}>{children}</div>;
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("eyebrow inline-flex items-center gap-3 text-sage", className)}>
      <span className="h-px w-8 bg-current opacity-50" />
      {children}
    </span>
  );
}

/* -------------------------------------------------------------- buttons */
/**
 * Booking CTA: opens the SimplePractice OAR/contact modal instead of navigating.
 * Keeps a real href to the booking page as the no-JS fallback.
 */
export function WidgetButton({
  children,
  variant = "primary",
  className = "",
  kind = "appointment",
  onAction,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "light";
  className?: string;
  kind?: WidgetKind;
  onAction?: () => void;
}) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[0.8125rem] font-medium tracking-[0.03em] transition-all duration-500";
  const styles = {
    primary: "bg-navy text-mist hover:bg-sage",
    ghost: "border border-navy/20 text-navy hover:border-navy/60 hover:bg-navy hover:text-mist",
    light: "border border-mist/30 text-mist hover:bg-mist hover:text-navy",
  }[variant];
  return (
    <a
      href={site.booking}
      className={cn(base, styles, className)}
      onClick={(e) => {
        e.preventDefault();
        onAction?.();
        void openSimplePractice(kind);
      }}
    >
      <span className="relative z-10">{children}</span>
      <svg
        viewBox="0 0 24 24"
        className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

export function Button({
  to,
  children,
  variant = "primary",
  className = "",
}: {
  to: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "light";
  className?: string;
}) {
  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 text-[0.8125rem] font-medium tracking-[0.03em] transition-all duration-500";
  const styles = {
    primary: "bg-navy text-mist hover:bg-sage",
    ghost: "border border-navy/20 text-navy hover:border-navy/60 hover:bg-navy hover:text-mist",
    light: "border border-mist/30 text-mist hover:bg-mist hover:text-navy",
  }[variant];
  return (
    <Link to={to} className={cn(base, styles, className)}>
      <span className="relative z-10">{children}</span>
      <svg viewBox="0 0 24 24" className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Link>
  );
}

export function TextLink({ to, children, className = "" }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "link-underline group inline-flex items-center gap-2 text-[0.8125rem] font-medium tracking-[0.04em] uppercase",
        className,
      )}
    >
      {children}
      <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
    </Link>
  );
}

/* ------------------------------------------------------------ page head */
export function PageHero({
  eyebrow,
  title,
  lede,
  meta,
  index,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  meta?: string[];
  index?: string;
}) {
  return (
    <header className="relative overflow-hidden border-b hairline bg-paper pt-40 pb-16 md:pt-48 md:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[38rem] w-[38rem] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(240,244,238,1) 0%, rgba(251,250,246,0) 70%)" }}
      />
      <Shell className="relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Reveal>
              <Eyebrow>{eyebrow}</Eyebrow>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display mt-7 text-[clamp(2.6rem,7.2vw,5.6rem)] text-navy balance">{title}</h1>
            </Reveal>
          </div>
          <div className="lg:col-span-4">
            {lede && (
              <Reveal delay={160}>
                <p className="max-w-sm text-[1.0625rem] leading-relaxed text-navy/70 pretty">{lede}</p>
              </Reveal>
            )}
            {meta && (
              <Reveal delay={220}>
                <ul className="mt-7 space-y-2 border-t hairline pt-5">
                  {meta.map((m) => (
                    <li key={m} className="flex items-start gap-3 text-[0.8125rem] text-navy/60">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sage" />
                      {m}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            {index && <span className="display mt-6 block text-sm text-navy/25">{index}</span>}
          </div>
        </div>
      </Shell>
    </header>
  );
}

/* ----------------------------------------------------------------- misc */
export function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="display text-sm text-sage">{n}</span>
      <span className="eyebrow text-navy/45">{children}</span>
    </div>
  );
}

export function Card({
  children,
  className = "",
  tone = "paper",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "mist" | "navy";
}) {
  const tones = {
    paper: "bg-white border-navy/8 hover:border-sage/40 shadow-[0_1px_2px_rgba(36,54,58,0.03)] hover:shadow-[0_28px_60px_-30px_rgba(36,54,58,0.28)]",
    mist: "bg-mist border-navy/8 hover:border-sage/45 hover:shadow-[0_28px_60px_-30px_rgba(36,54,58,0.3)]",
    navy: "bg-navy text-mist border-white/10 hover:border-white/25",
  }[tone];
  return (
    <div className={cn("group relative rounded-[2px] border p-8 transition-all duration-700 md:p-10", tones, className)}>
      {children}
    </div>
  );
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t hairline">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b hairline">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-8 py-7 text-left transition-colors duration-300 hover:text-sage"
            >
              <span className="display max-w-2xl text-[1.15rem] leading-snug md:text-[1.4rem]">{item.q}</span>
              <span
                className={cn(
                  "mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border hairline transition-all duration-500",
                  isOpen && "rotate-45 border-sage bg-sage text-mist",
                )}
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            <div
              className="grid transition-all duration-700"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-8 text-[0.9375rem] leading-relaxed text-navy/65 pretty">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative flex overflow-hidden border-y hairline bg-mist/60 py-5">
      <div className="flex min-w-full shrink-0 animate-[scroll_38s_linear_infinite] items-center gap-14 pr-14">
        {row.map((t, i) => (
          <span key={i} className="display flex shrink-0 items-center gap-14 text-[1.05rem] whitespace-nowrap text-navy/50">
            {t}
            <span className="h-1 w-1 rounded-full bg-sage/60" />
          </span>
        ))}
      </div>
      <style>{`@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-100%)}}`}</style>
    </div>
  );
}

export function CTA({
  title = "Things don\u2019t have to stay this way forever.",
  body = "A free 15-minute consultation is the simplest first step. No pressure, no paperwork \u2014 just a conversation about what you\u2019re going through and whether we\u2019re a good fit.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy text-mist">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-40 h-[34rem] w-[34rem] rounded-full opacity-[0.12] blur-2xl"
        style={{ background: "radial-gradient(circle,#6B7C54 0%,transparent 70%)" }}
      />
      <Shell className="relative py-24 md:py-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <Eyebrow className="text-sage-soft">Ready?</Eyebrow>
              <h2 className="display mt-8 text-[clamp(2.4rem,5.4vw,4.4rem)] balance">{title}</h2>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal delay={120}>
              <p className="text-[1rem] leading-relaxed text-mist/70 pretty">{body}</p>
              <div className="mt-9 flex flex-wrap gap-4">
                <WidgetButton variant="light">
                  Book a Free Consult
                </WidgetButton>
                <Link
                  to="/faq"
                  className="link-underline inline-flex items-center py-3.5 text-[0.8125rem] font-medium tracking-[0.04em] text-mist/60 uppercase hover:text-mist"
                >
                  View FAQ
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </Shell>
    </section>
  );
}
