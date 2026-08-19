import { useEffect, useState } from "react";
import { Accordion, CTA, PageHero, Reveal, Shell } from "../components/ui";
import { faqs } from "../data/site";
import { loadCmsContent, type FaqContent } from "../lib/content";

export default function FAQ() {
  const [cmsFaqs, setCmsFaqs] = useState<FaqContent | null>(null);
  useEffect(() => {
    let live = true;
    void loadCmsContent().then((c) => {
      if (live) setCmsFaqs(c.faq);
    });
    return () => {
      live = false;
    };
  }, []);
  // CMS-managed FAQs when available; bundled copy as the fallback.
  const items = cmsFaqs?.items ?? faqs;

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Frequently asked
            <br className="hidden md:block" /> <span className="italic text-sage-deep">questions.</span>
          </>
        }
        lede="Everything you might want to know before booking your first session."
        meta={["Free 15-minute consult", "In-network with Cigna & Aetna", "Mount Pleasant, SC & virtual"]}
      />

      <section className="bg-paper py-20 md:py-28">
        <Shell>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <Accordion items={items} />
            </Reveal>
          </div>
        </Shell>
      </section>

      <section className="border-t border-navy/10 bg-mist py-16 md:py-20">
        <Shell>
          <Reveal>
            <div className="text-center">
              <p className="display text-[clamp(1.5rem,3vw,2.2rem)] leading-snug text-navy balance">
                Still have questions? Let&apos;s talk.
              </p>
              <p className="mx-auto mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-navy/60 pretty">
                The free 15-minute consultation is the best way to get specific answers about your situation. No pressure, no commitment.
              </p>
            </div>
          </Reveal>
        </Shell>
      </section>

      <CTA />
    </>
  );
}
