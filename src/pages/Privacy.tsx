import { Eyebrow, Shell } from "../components/ui";
import { site } from "../data/site";

/**
 * Privacy practice page (hash route #/privacy).
 * Written to match what the site actually does — no trackers, gated widget —
 * so the page and the network behavior tell the same story.
 */

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 first:mt-0">
      <p className="text-[0.7rem] tracking-[0.12em] text-sage-deep/80 uppercase">{n}</p>
      <h2 className="display mt-2 text-[1.4rem] leading-tight text-navy">{title}</h2>
      <div className="mt-4 space-y-4 text-[0.9375rem] leading-relaxed text-navy/65 pretty">
        {children}
      </div>
    </section>
  );
}

export default function Privacy() {
  return (
    <>
      <section className="bg-paper pb-20 pt-32 md:pb-28 md:pt-44">
        <Shell>
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="display mt-6 max-w-xl text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.08] text-navy balance">
            Your visit here is <span className="italic text-sage-deep">your own.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-navy/65 pretty">
            This practice works with trauma, and what you read on a therapy site is
            no one&apos;s business but yours. This page explains exactly what happens,
            technically, when you visit — in plain language.
          </p>

          <div className="mt-14 max-w-2xl">
            <Section n="01" title="No trackers, no ad pixels, no analytics">
              <p>
                This website loads nothing from advertising or analytics networks.
                There is no Google Analytics, no Meta (Facebook) pixel, no ad tags,
                no chatbot, and no session-recording tool that watches your clicks or
                typing. The site sets no tracking cookies, and it does not sell,
                share, or report your visit to anyone.
              </p>
            </Section>

            <Section n="02" title="The booking &amp; contact widget — loads only when you click it">
              <p>
                The <strong className="font-semibold text-navy/80">Book a consultation</strong> and{" "}
                <strong className="font-semibold text-navy/80">Send a message</strong> buttons use{" "}
                <a
                  href="https://www.simplepractice.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline hover:text-sage-deep"
                >
                  SimplePractice
                </a>
                , the secure platform this practice runs its scheduling and client
                messaging on. Its code is <em>not</em> loaded when you open the site —
                nothing is fetched from SimplePractice until you actually click one of
                those buttons. Once you do, SimplePractice&apos;s own cookies apply
                inside the booking form, and anything you submit goes directly to this
                practice&apos;s private SimplePractice account, protected by a
                Business Associate Agreement under HIPAA.
              </p>
            </Section>

            <Section n="03" title="Fonts and hosting">
              <p>
                The fonts on this site are served from this site itself — no requests
                go to Google Fonts or any other font service. The site is hosted on
                Cloudflare Pages, which keeps standard, short-lived security logs
                (such as IP address and browser type) for every website it serves.
                These logs are not used for tracking or advertising.
              </p>
            </Section>

            <Section n="04" title="Email and phone">
              <p>
                If you email or call the practice, that correspondence is stored in
                the practice&apos;s systems and kept as required by South Carolina
                licensing rules. It is never shared except as the law requires.
              </p>
            </Section>

            <Section n="05" title="Children and crisis">
              <p>
                This site is not directed at children and collects no information from
                them. If you are in crisis, call or text <strong>988</strong> (Suicide
                &amp; Crisis Lifeline), text <strong>HOME</strong> to{" "}
                <strong>741741</strong> (Crisis Text Line), or go to your nearest
                emergency department.
              </p>
            </Section>

            <Section n="06" title="Questions">
              <p>
                Write to{" "}
                <a href={`mailto:${site.email}`} className="link-underline hover:text-sage-deep">
                  {site.email}
                </a>
                . There is no account to delete and no data portrait of you to
                export — the honest answer is that there is almost nothing to ask for.
              </p>
            </Section>

            <p className="mt-14 border-t border-navy/10 pt-6 text-[0.8125rem] text-navy/45">
              Last updated November 19, 2026. If this site&apos;s technical setup ever
              changes, this page changes with it.
            </p>
          </div>
        </Shell>
      </section>
    </>
  );
}
