import { Link } from "../lib/router";
import { CTA, PageHero, Reveal, Shell } from "../components/ui";
import { specialties } from "../data/site";
import { PaperFold } from "../components/Logo";

export default function Specialties() {
  return (
    <>
      <PageHero
        eyebrow="Specialties"
        title={
          <>
            Trauma, neurodivergence,
            <br className="hidden md:block" /> <span className="italic text-sage-deep">and everything in between.</span>
          </>
        }
        lede="Whether it's memories that ambush your peace, feeling like an outsider, or constantly battling self-doubt — these aren't just minor annoyances. Let's work on it together."
        meta={["Virtual across South Carolina", "In-person in Mount Pleasant", "Free 15-minute consult"]}
      />

      <section className="bg-paper py-20 md:py-28">
        <Shell>
          <div className="grid gap-14">
            {specialties.map((s, i) => (
              <Reveal key={s.slug} delay={i * 60}>
                <Link
                  to={s.slug}
                  className="group grid gap-8 border-t border-navy/12 pt-10 lg:grid-cols-12 lg:gap-10"
                >
                  <div className="lg:col-span-1">
                    <span className="display text-[0.85rem] text-sage-deep">{s.n}</span>
                  </div>
                  <div className="lg:col-span-4">
                    <h2 className="display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.05] text-navy transition-colors duration-500 group-hover:text-sage">
                      {s.title}
                    </h2>
                    <div className="mt-5 hidden h-20 w-32 text-sage/25 transition-colors duration-700 group-hover:text-sage/50 lg:block">
                      <PaperFold className="h-full w-full" seed={i} />
                    </div>
                  </div>
                  <div className="lg:col-span-4">
                    <p className="text-[1rem] leading-[1.8] text-navy/68 pretty">{s.short}</p>
                  </div>
                  <div className="lg:col-span-3">
                    <ul className="space-y-2.5">
                      {s.whoFor.slice(0, 3).map((w) => (
                        <li key={w} className="flex items-start gap-3 text-[0.875rem] leading-snug text-navy/60">
                          <span className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-sage" />
                          {w}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-6 inline-flex items-center gap-2 text-[0.75rem] font-medium tracking-[0.06em] text-navy/50 uppercase transition-colors duration-500 group-hover:text-sage-deep">
                      Learn more
                      <span className="transition-transform duration-500 group-hover:translate-x-1">&rarr;</span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Shell>
      </section>

      <CTA />
    </>
  );
}
