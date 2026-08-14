import { useEffect, useState } from "react";
import { Link, useRouter } from "../lib/router";
import { nav, site } from "../data/site";
import { Wordmark } from "./Logo";
import { cn } from "../utils/cn";

export default function Nav() {
  const { path } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-navy focus:px-5 focus:py-3 focus:text-sm focus:text-mist"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-700",
          scrolled ? "border-b border-navy/8 bg-paper/90 backdrop-blur-xl" : "border-b border-transparent",
        )}
        onMouseLeave={() => setMenu(null)}
      >
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-6 py-4 md:px-10 lg:px-14">
          <Link to="/" className="text-navy transition-opacity duration-300 hover:opacity-70" ariaLabel="Paper Crane Wellness home">
            <Wordmark markClass={cn("transition-all duration-700", scrolled ? "h-7 w-7" : "h-9 w-9")} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {nav.map((item) => {
              const active = path === item.to || item.children?.some((c) => c.to === path);
              return (
                <div key={item.to} onMouseEnter={() => setMenu(item.children ? item.label : null)} className="relative">
                  <Link
                    to={item.to}
                    className={cn(
                      "relative inline-flex items-center gap-1.5 px-4 py-2 text-[0.8125rem] font-medium tracking-wide transition-colors duration-300",
                      active ? "text-sage" : "text-navy/60 hover:text-navy",
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <svg viewBox="0 0 24 24" className={cn("h-3 w-3 transition-transform duration-300", menu === item.label && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                      </svg>
                    )}
                  </Link>
                </div>
              );
            })}
            <Link
              to="/contact"
              className="ml-4 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-[0.8125rem] font-medium text-mist transition-colors duration-500 hover:bg-sage"
            >
              Free Consult
            </Link>
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-[7px] rounded-full border border-navy/12 lg:hidden"
          >
            <span className={cn("h-px w-4.5 bg-navy transition-all duration-500", open && "translate-y-[4px] rotate-45")} />
            <span className={cn("h-px w-4.5 bg-navy transition-all duration-500", open && "-translate-y-[4px] -rotate-45")} />
          </button>
        </div>

        {/* desktop dropdown */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-full hidden overflow-hidden border-b border-navy/8 bg-paper/95 backdrop-blur-xl transition-all duration-500 lg:block",
            menu ? "pointer-events-auto max-h-[24rem] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="mx-auto grid w-full max-w-[1320px] gap-10 px-14 py-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="eyebrow text-sage">Areas of Focus</p>
              <p className="display mt-4 text-[1.5rem] leading-tight text-navy">
                You&apos;re welcome here. And you&apos;re enough.
              </p>
            </div>
            <div className="grid gap-x-6 gap-y-1 lg:col-span-8 lg:grid-cols-3">
              {nav[1].children?.map((c) => (
                <Link
                  key={c.to}
                  to={c.to}
                  className="group flex items-start gap-3 rounded-[4px] border border-transparent p-4 transition-all duration-500 hover:border-navy/8 hover:bg-mist/70"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage/40 transition-colors duration-500 group-hover:bg-sage" />
                  <span>
                    <span className="block text-[0.9rem] font-medium text-navy">{c.label}</span>
                    <span className="mt-1 block text-[0.8rem] leading-snug text-navy/50">{c.note}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-paper transition-all duration-700 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 pt-24 pb-12">
          <nav className="flex flex-col" aria-label="Mobile">
            {[{ label: "Home", to: "/" }, ...nav].map((item, i) => (
              <div key={item.to} className="border-b border-navy/8">
                <Link
                  to={item.to}
                  className="display block py-5 text-[1.8rem] text-navy"
                  onClick={() => setOpen(false)}
                >
                  <span className="mr-4 align-middle font-sans text-[0.6rem] tracking-widest text-sage">
                    {String(i).padStart(2, "0")}
                  </span>
                  {item.label}
                </Link>
              </div>
            ))}
          </nav>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
            {nav[1].children?.map((c) => (
              <Link key={c.to} to={c.to} className="text-[0.8125rem] text-navy/55" onClick={() => setOpen(false)}>
                {c.label}
              </Link>
            ))}
          </div>
          <div className="mt-auto pt-10">
            <Link
              to="/contact"
              className="flex w-full items-center justify-center rounded-full bg-navy py-4 text-sm font-medium text-mist"
              onClick={() => setOpen(false)}
            >
              Book a Free Consultation
            </Link>
            <p className="mt-5 text-[0.75rem] leading-relaxed text-navy/45">{site.virtual}</p>
          </div>
        </div>
      </div>
    </>
  );
}
