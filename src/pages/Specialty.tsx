import { Link } from "../lib/router";
import { PaperFold } from "../components/Logo";
import { CTA, Card, PageHero, Reveal, SectionLabel, Shell } from "../components/ui";
import { specialties } from "../data/site";

export default function Specialty({ slug }: { slug: string }) {
  const s = specialties.find((x) => x.slug === slug);
  if (!s) return null;
  const others = specialties.filter((x) => x.slug !== slug);

  return (
    <>
      <PageHero
        eyebrow={`Specialty ${s.n}`}
        title={s.title}
        lede={s.short}
        meta={["Virtual across South Carolina", "In-person in Mount Pleasant", "Free 15-minute consultation"]}
      />

      {/* Quote banner */}
      <section className="border-b border-navy/10 bg-mist py-14 md:py-20">
        <Shell>
          <Reveal>
            <blockquote className="display mx-auto max-w-3xl text-center text-[clamp(1.3rem,3vw,2.2rem)] leading-snug text-navy italic balance">
              &ldquo;{s.quote}&rdquo;
            </blockquote>
            <p className="mt-4 text-center text-[0.7rem] tracking-[0.1em] text-navy/40 uppercase">&mdash; Rebekah P. Tozer, LISW-CP</p>
          </Reveal>
        </Shell>
      </section>

      {/* Narrative */}
      <section className="bg-paper py-20 md:py-28">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <p className="text-[1.1rem] leading-[1.8] text-navy/72 pretty">{s.intro}</p>
              </Reveal>
              {s.vision && (
                <Reveal delay={60}>
                  <h2 className="display mt-12 text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.1] text-navy balance">
                    {slug === "/trauma" ? "You can\u2019t outrun the shadow, but you can turn around and face it." : slug === "/neurodivergent" ? "I\u2019ve got you." : "The upside of sorting it out."}
                  </h2>
                  <p className="mt-6 text-[1.0625rem] leading-[1.8] text-navy/72 pretty">{s.vision}</p>
                </Reveal>
              )}
              {s.approach && (
                <Reveal delay={80}>
                  <p className="mt-6 text-[1.0625rem] leading-[1.8] text-navy/72 pretty">{s.approach}</p>
                </Reveal>
              )}
            </div>
            <Reveal delay={100} className="lg:col-span-4 lg:col-start-9">
              <div className="sticky top-32 rounded-[4px] border border-navy/12 bg-mist/60 p-8">
                <div className="mb-6 h-14 w-20 text-sage/40">
                  <PaperFold className="h-full w-full" seed={Number(s.n)} />
                </div>
                <p className="eyebrow text-sage">Who this therapy is for</p>
                <ul className="mt-5 space-y-3.5">
                  {s.whoFor.map((w) => (
                    <li key={w} className="flex items-start gap-3 text-[0.9rem] leading-snug text-navy/68">
                      <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </Shell>
      </section>

      {/* Techniques */}
      {s.techniques.length > 0 && (
        <section className="border-y border-navy/10 bg-mist py-20 md:py-28">
          <Shell>
            <Reveal>
              <SectionLabel n="II">My therapy techniques</SectionLabel>
              <h2 className="display mt-7 max-w-2xl text-[clamp(1.9rem,4vw,3rem)] text-navy balance">
                The specific tools, explained.
              </h2>
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {s.techniques.map((t, i) => (
                <Reveal key={t.name} delay={i * 80}>
                  <Card className="h-full">
                    <span className="display text-[0.8rem] text-sage">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="display mt-5 text-[1.4rem] text-navy">{t.name}</h3>
                    <p className="mt-4 text-[0.9375rem] leading-relaxed text-navy/62 pretty">{t.body}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </Shell>
        </section>
      )}

      {/* CTA statement */}
      <section className="bg-paper py-16 md:py-20">
        <Shell>
          <Reveal>
            <h2 className="display mx-auto max-w-2xl text-center text-[clamp(2rem,4vw,3.2rem)] text-navy balance">
              {s.cta}
            </h2>
          </Reveal>
        </Shell>
      </section>

      {/* Related specialties */}
      <section className="border-t border-navy/10 bg-mist/50 py-16 md:py-20">
        <Shell>
          <Reveal>
            <p className="eyebrow text-navy/40">Other specialties</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to={o.slug}
                  className="group rounded-[4px] border border-navy/10 bg-paper p-8 transition-all duration-500 hover:border-sage/40 hover:shadow-lg hover:shadow-navy/8"
                >
                  <span className="display text-[0.8rem] text-sage">{o.n}</span>
                  <p className="display mt-4 text-[1.4rem] text-navy transition-colors duration-500 group-hover:text-sage">
                    {o.title}
                  </p>
                  <p className="mt-3 text-[0.875rem] leading-relaxed text-navy/55">{o.short}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        </Shell>
      </section>

      <CTA />
    </>
  );
}
