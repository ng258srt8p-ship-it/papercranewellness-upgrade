import { img } from "../assets/images";
import { CTA, Card, Eyebrow, PageHero, Shell } from "../components/ui";
import { credentials, endorsements, funFacts, press } from "../data/site";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            Meet Rebekah Tozer,
            <br className="hidden md:block" /> <span className="italic text-sage-deep">LISW-CP</span>
          </>
        }
        lede="Harry Potter fan, podcast connoisseur, and therapist who has seen her own fair share of therapy."
        meta={["Virtual across South Carolina", "In-person in Mount Pleasant", "Cigna & Aetna in-network"]}
      />

      <section className="bg-paper py-20 md:py-28">
        <Shell>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="sticky top-32">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-mist shadow-lg shadow-navy/8">
                  <img src={img.spare} alt="Rebekah Tozer, LISW-CP" className="h-full w-full object-cover" />
                </div>
                <div className="mt-6 border-t border-navy/12 pt-5">
                  <p className="display text-[1.15rem] text-navy">Rebekah P. Tozer, LISW-CP</p>
                  <p className="mt-1.5 text-[0.75rem] tracking-[0.06em] text-navy/45 uppercase">
                    Founder &bull; Paper Crane Wellness
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <blockquote className="display border-l-2 border-sage pl-6 text-[clamp(1.3rem,2.8vw,1.9rem)] leading-snug text-navy italic">
                &ldquo;I&apos;ve been to bad therapists before&hellip; and I&apos;ve worked really hard not to be one.&rdquo;
              </blockquote>
              <p className="mt-2 text-[0.75rem] tracking-[0.08em] text-navy/40 uppercase">&mdash; Rebekah P. Tozer, LISW-CP</p>

              <div className="mt-12">
                <h2 className="display text-[1.45rem] leading-snug text-navy">The real deal</h2>
                <p className="mt-5 text-[1.0625rem] leading-[1.8] text-navy/72 pretty">
                  If you&apos;re ready for real help, for someone to truly see you, but you don&apos;t know where to even start &mdash; have I got some great news for you: You&apos;ve come to the right place.
                </p>
                <p className="mt-5 text-[1.0625rem] leading-[1.8] text-navy/72 pretty">
                  For some of my clients, I&apos;m not their first rodeo. But they catch on quickly that I&apos;m different. I&apos;m not going to just nod and note-take. I&apos;m getting in the trenches with you.
                </p>
              </div>

              <div className="mt-12">
                <h2 className="display text-[1.45rem] leading-snug text-navy">Therapy you&apos;ll actually look forward to</h2>
                <p className="mt-5 text-[1.0625rem] leading-[1.8] text-navy/72 pretty">
                  My clients don&apos;t just walk out feeling heard &mdash; they leave feeling understood and genuinely excited about the changes unfolding in their lives. Every session brings a breakthrough, big or small.
                </p>
                <p className="mt-5 text-[1.0625rem] leading-[1.8] text-navy/72 pretty">
                  You&apos;ll notice the shifts &mdash; maybe you&apos;re laughing more freely, or walking into rooms with a confidence you didn&apos;t know you had. And the best part? You&apos;ll start feeling like the real you is not just okay, but awesome.
                </p>
              </div>

              <div className="mt-12">
                <h2 className="display text-[1.45rem] leading-snug text-navy">Neurodivergent, and it matters</h2>
                <p className="mt-5 text-[1.0625rem] leading-[1.8] text-navy/72 pretty">
                  I&apos;ve done a lot of work to get where I am, figuring out how my own unique mind works as a member of the neurodivergent community. If I&apos;m able to connect well with those who feel a bit out of step with the mainstream, I come by it honestly &mdash; because that&apos;s the space I inhabit as well.
                </p>
              </div>
            </div>
          </div>
        </Shell>
      </section>

      <section className="border-y border-navy/10 bg-mist py-20 md:py-28">
        <Shell>
          <Eyebrow>Qualifications</Eyebrow>
          <div className="mt-12 grid gap-px border-t border-navy/12 sm:grid-cols-2 lg:grid-cols-3">
            {credentials.map(([k, v]) => (
              <div key={k} className="h-full border-b border-navy/12 py-7 lg:px-7 lg:first:pl-0">
                <p className="display text-[1.6rem] text-sage">{k}</p>
                <p className="mt-2 text-[0.875rem] leading-relaxed text-navy/60 pretty">{v}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="bg-paper py-20 md:py-28">
        <Shell>
          <h2 className="display text-[clamp(1.8rem,3.6vw,2.8rem)] text-navy">Professional endorsements</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {endorsements.map((e) => (
              <Card key={e.from} className="h-full">
                <p className="text-[1rem] leading-relaxed text-navy/70 italic pretty">&ldquo;{e.text}&rdquo;</p>
                <p className="mt-5 border-t border-navy/10 pt-4 text-[0.75rem] tracking-[0.06em] text-navy/45 uppercase">{e.from}</p>
              </Card>
            ))}
          </div>
        </Shell>
      </section>

      <section className="border-t border-navy/10 bg-mist/50 py-20 md:py-24">
        <Shell>
          <p className="text-center"><Eyebrow center tone="muted">Get to know me</Eyebrow></p>
          <h2 className="display mt-6 text-center text-[clamp(1.8rem,3.6vw,2.8rem)] text-navy">
            The important stuff.
          </h2>
          {/* hairline definition rows, not cards: the answers read like a
                      column, the questions sit in the display serif */}
          <div className="mt-12 border-t hairline">
            {funFacts.map((f) => (
              <div key={f.q} className="grid gap-2 border-b hairline py-7 md:grid-cols-12 md:items-baseline md:gap-8">
                <p className="display text-[1.15rem] text-sage-deep md:col-span-4">{f.q}</p>
                <p className="text-[1rem] leading-relaxed text-navy/70 pretty md:col-span-8">{f.a}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="border-t border-navy/10 bg-paper py-14">
        <Shell>
          <p className="mb-6 text-center"><Eyebrow center tone="muted">As seen on</Eyebrow></p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {press.map((p) => (
              <span key={p.outlet} className="display text-[1.15rem] text-navy/55">{p.outlet}</span>
            ))}
          </div>
        </Shell>
      </section>

      <CTA
        title="Step 1: Let&apos;s chat."
        body="Come as you are. I see you, and I&apos;m here for it. A free 15-minute consultation to figure out if we&apos;re a good fit."
      />
    </>
  );
}
