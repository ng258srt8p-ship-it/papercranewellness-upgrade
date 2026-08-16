import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { img } from "../assets/images";
import { CTA, Card, Eyebrow, Reveal, SectionLabel, Shell, TextLink, WidgetButton } from "../components/ui";
import { healing, press, specialties, testimonials } from "../data/site";
import { loadCmsContent } from "../lib/content";

/** CMS-driven notice strip above the hero; hidden when no announcement is set. */
function AnnouncementBar() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    void loadCmsContent().then((c) => {
      if (live && c.announcement?.text) setText(c.announcement.text);
    });
    return () => {
      live = false;
    };
  }, []);
  if (!text) return null;
  return (
    <div className="bg-navy text-mist">
      <div className="mx-auto max-w-6xl px-5 py-2.5 text-center text-[0.8125rem] leading-relaxed tracking-wide text-mist/85">
        {text}
      </div>
    </div>
  );
}

function Hero() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative overflow-hidden bg-paper pt-32 pb-20 md:pt-44 md:pb-28">
      {/* Decorative background gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-60 -right-40 h-[48rem] w-[48rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle,#F0F4EE 0%,rgba(251,250,246,0) 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle,#6B7C5420 0%,transparent 70%)" }}
      />

      <Shell className="relative">
        <div className="grid gap-y-14 lg:grid-cols-12 lg:gap-x-12">
          {/* Left column: text */}
          <div className="lg:col-span-7 lg:pt-4">
            <Reveal>
              <Eyebrow>Mount Pleasant, SC &bull; Virtual across South Carolina</Eyebrow>
            </Reveal>

            <h1 className="display mt-8 text-[clamp(2.8rem,8vw,6.8rem)] text-navy">
              <Reveal as="span" variant="clip" className="block">
                Things don&apos;t have
              </Reveal>
              <Reveal as="span" variant="clip" delay={100} className="block pl-[0.04em] italic text-sage">
                to stay this way
              </Reveal>
              <Reveal as="span" variant="clip" delay={190} className="block">
                forever.
              </Reveal>
            </h1>

            <Reveal delay={300}>
              <p className="mt-8 max-w-xl text-[1.1rem] leading-[1.75] text-navy/65 pretty md:text-[1.2rem]">
                It&apos;s like you&apos;re playing the same video game level over and over and over&hellip; And it&apos;s exhausting. Whether it&apos;s memories that ambush your peace, feeling like an outsider in everyday conversations, or constantly battling self-doubt and burnout &mdash; these aren&apos;t just minor annoyances.
              </p>
            </Reveal>

            <Reveal delay={380}>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
                <WidgetButton>Book a Free Consult</WidgetButton>
                <TextLink to="/specialties" className="text-navy/60 hover:text-navy">
                  Explore Specialties
                </TextLink>
              </div>
            </Reveal>
          </div>

          {/* Right column: portrait */}
          <div className="relative lg:col-span-5">
            <Reveal delay={200} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-mist shadow-2xl shadow-navy/10">
                <img
                  src={img.rebekah}
                  alt="Rebekah P. Tozer, LISW-CP, founder of Paper Crane Wellness"
                  className="h-full w-full object-cover object-center"
                  style={{ transform: `translate3d(0,${y * -0.03}px,0) scale(1.06)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/20 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-4 max-w-[14rem] rounded-[4px] border border-navy/10 bg-paper p-5 shadow-lg shadow-navy/8 md:-left-8">
                <p className="display text-[0.95rem] leading-snug text-navy">Rebekah P. Tozer</p>
                <p className="mt-1 text-[0.7rem] tracking-[0.06em] text-navy/50 uppercase">
                  LISW-CP &bull; EMDR &bull; RYT-200
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function ItDoesntHaveToBe() {
  return (
    <section className="relative bg-mist py-24 md:py-32">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionLabel n="I">There is another way</SectionLabel>
            <h2 className="display mt-7 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.08] text-navy balance">
              It doesn&apos;t have to be this way.
            </h2>
          </Reveal>
          <Reveal delay={100} className="lg:col-span-6 lg:col-start-7">
            <p className="text-[1.0625rem] leading-[1.8] text-navy/70 pretty">
              Imagine a day when sudden noises don&apos;t send your heart racing, or when you can chat at a coffee shop without rehearsing every sentence in your head. Picture yourself managing work deadlines with ease, or planning a weekend getaway without the crippling anxiety of &ldquo;what if.&rdquo;
            </p>
            <p className="mt-6 text-[1.0625rem] leading-[1.8] text-navy/70 pretty">
              Therapy is about making these scenarios a reality, turning overwhelming days into manageable, even enjoyable moments.
            </p>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

function WelcomeSection() {
  return (
    <section className="bg-paper py-24 md:py-32">
      <Shell>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <Reveal className="lg:col-span-5">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[6px] bg-mist shadow-lg shadow-navy/8">
              <img src={img.office} alt="The Paper Crane Wellness therapy space in Mount Pleasant, SC" className="h-full w-full object-cover" />
            </div>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal delay={80}>
              <SectionLabel n="II">Welcome</SectionLabel>
              <h2 className="display mt-7 text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.08] text-navy balance">
                You&apos;re welcome here. And you&apos;re enough.
              </h2>
              <p className="mt-7 max-w-lg text-[1.0625rem] leading-[1.8] text-navy/68 pretty">
                In our sessions you&apos;ll find a space where you can relax completely and feel genuinely understood. With me, therapy isn&apos;t a sterile set of protocols; it&apos;s a dynamic, personal, level-up journey tailored to your specific needs.
              </p>
              <p className="mt-5 max-w-lg text-[1.0625rem] leading-[1.8] text-navy/68 pretty">
                I&apos;m here with practical strategies designed to fit your life, not the other way around.
              </p>
              <div className="mt-9">
                <TextLink to="/about" className="text-navy/70 hover:text-navy">
                  More about Rebekah
                </TextLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function SpecialtiesSection() {
  return (
    <section className="border-y border-navy/10 bg-paper py-24 md:py-32">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <SectionLabel n="III">Specialties</SectionLabel>
            <h2 className="display mt-7 text-[clamp(2.2rem,5vw,3.8rem)] text-navy balance">
              Three ways I can help.
            </h2>
          </Reveal>
          <Reveal delay={80} className="lg:col-span-4 lg:col-start-9">
            <p className="text-[0.9375rem] leading-relaxed text-navy/60 pretty">
              Relief from trauma, feeling misunderstood, overwhelm, and addiction &mdash; through approaches that actually fit your life.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {specialties.map((s, i) => (
            <Reveal key={s.slug} delay={i * 100}>
              <Link to={s.slug} className="block h-full">
                <Card className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className="display text-[0.8rem] text-sage">{s.n}</span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-navy/10 text-navy/40 transition-all duration-500 group-hover:border-sage group-hover:bg-sage group-hover:text-mist">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  <h3 className="display mt-6 text-[1.5rem] leading-snug text-navy transition-colors duration-500 group-hover:text-sage">
                    {s.title}
                  </h3>
                  <p className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-navy/60 pretty">{s.short}</p>
                  <span className="mt-6 inline-flex items-center gap-2 border-t border-navy/8 pt-5 text-[0.75rem] font-medium tracking-[0.06em] text-sage uppercase">
                    Learn more
                    <span className="transition-transform duration-500 group-hover:translate-x-1">&rarr;</span>
                  </span>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

function Modalities() {
  const items = [
    { name: "EMDR", desc: "Like a really fancy vacuum cleaner, EMDR zaps away deep-seated traumas by mimicking the healing powers of REM sleep, quickly tidying up your mental clutter." },
    { name: "Prolonged Exposure", desc: "Picture a training session for your nerves (minus all the sweat). You'll face your fears in slow motion, taming them over time until they're more nuisance than nightmare." },
    { name: "Trauma-Informed Yoga", desc: "Think of this as a gentle, nurturing guide helping you to slowly unfurl from the tight grip of trauma, offering you peace and strength with every mindful movement." },
  ];

  return (
    <section className="relative overflow-hidden bg-navy py-24 text-mist md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-32 h-[30rem] w-[30rem] rounded-full opacity-[0.1] blur-2xl"
        style={{ background: "radial-gradient(circle,#6B7C54 0%,transparent 70%)" }}
      />
      <Shell className="relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-6">
            <Eyebrow className="text-sage-soft">IV &mdash; Modalities</Eyebrow>
            <h2 className="display mt-7 text-[clamp(2.2rem,5vw,3.8rem)] balance">
              A couple trauma-informed modalities I use.
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((m, i) => (
            <Reveal key={m.name} delay={i * 90}>
              <div className="h-full rounded-[4px] border border-white/10 p-8 transition-all duration-500 hover:border-white/25 md:p-10">
                <span className="display text-[2.8rem] leading-none text-white/15">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="display mt-6 text-[1.6rem] text-mist">{m.name}</h3>
                <p className="mt-5 text-[0.9375rem] leading-relaxed text-mist/65 pretty">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

function HealingLooks() {
  return (
    <section className="bg-paper py-24 md:py-32">
      <Shell>
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionLabel n="V">What healing looks like</SectionLabel>
            <h2 className="display mt-7 text-[clamp(2rem,4vw,3rem)] leading-[1.08] text-navy balance">
              This is real change.
            </h2>
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <ul className="space-y-5">
              {healing.map((h, i) => (
                <Reveal key={h} delay={i * 60}>
                  <li className="flex items-start gap-4 text-[1.0625rem] leading-[1.7] text-navy/70">
                    <span className="mt-[0.55rem] h-2 w-2 shrink-0 rounded-full bg-sage/70" />
                    {h}
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Shell>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="border-y border-navy/10 bg-mist py-24 md:py-32">
      <Shell>
        <Reveal>
          <p className="eyebrow text-center text-sage">What clients say</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="h-full rounded-[4px] border border-navy/10 bg-paper p-8 md:p-10">
                <svg viewBox="0 0 24 24" className="mb-5 h-6 w-6 text-sage/50" fill="currentColor">
                  <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.692 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.196 0-2.306-.603-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.692 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.196 0-2.306-.603-2.917-1.179z" />
                </svg>
                <p className="text-[1rem] leading-relaxed text-navy/75 italic pretty">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-5 border-t border-navy/10 pt-4 text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">{t.source}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Shell>
    </section>
  );
}

function MeetRebekah() {
  return (
    <section className="bg-paper py-24 md:py-32">
      <Shell>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="order-2 lg:order-1 lg:col-span-7">
            <Reveal>
              <SectionLabel n="VI">Meet your therapist</SectionLabel>
              <h2 className="display mt-7 text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.08] text-navy balance">
                Hi! I&apos;m Rebekah
              </h2>
              <p className="mt-7 max-w-xl text-[1.0625rem] leading-[1.8] text-navy/70 pretty">
                Harry Potter fan, podcast connoisseur, and therapist who&apos;s seen my own fair share of therapy. I&apos;ve done a lot of work to get where I am, figuring out how my own unique mind works as a member of the neurodivergent community.
              </p>
              <p className="mt-5 max-w-xl text-[1.0625rem] leading-[1.8] text-navy/70 pretty">
                If I&apos;m able to connect well with those who feel a bit out of step with the mainstream, I come by it honestly &mdash; because that&apos;s the space I inhabit as well.
              </p>
              <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
                <TextLink to="/about" className="text-navy/70 hover:text-navy">
                  Full bio &amp; credentials
                </TextLink>
                <TextLink to="/contact" className="text-navy/70 hover:text-navy">
                  Book a consult
                </TextLink>
              </div>
            </Reveal>
          </div>
          <Reveal delay={120} className="order-1 lg:order-2 lg:col-span-4 lg:col-start-9">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-mist shadow-lg shadow-navy/10">
              <img src={img.portrait} alt="Rebekah Tozer in her therapy office" className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </div>
      </Shell>
    </section>
  );
}

function PressStrip() {
  return (
    <section className="border-y border-navy/10 bg-mist/60 py-14">
      <Shell>
        <Reveal>
          <p className="eyebrow mb-8 text-center text-navy/40">As seen on</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
            {press.map((p) => (
              <span key={p.outlet} className="display text-[clamp(1rem,2vw,1.5rem)] text-navy/30 transition-colors hover:text-navy/60">
                {p.outlet}
              </span>
            ))}
          </div>
        </Reveal>
      </Shell>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Hero />
      <PressStrip />
      <ItDoesntHaveToBe />
      <WelcomeSection />
      <SpecialtiesSection />
      <Modalities />
      <HealingLooks />
      <Testimonials />
      <MeetRebekah />
      <CTA />
    </>
  );
}
