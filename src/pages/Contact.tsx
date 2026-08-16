import { useEffect, useState } from "react";
import { Link } from "../lib/router";
import { CraneMark } from "../components/Logo";
import { PageHero, Reveal, SectionLabel, Shell, WidgetButton } from "../components/ui";
import { openSimplePractice, refreshSpAutoBind, SP_SCOPE_ID } from "../lib/simplepractice";
import { site, specialties } from "../data/site";
import { loadCmsContent, type ContactContent } from "../lib/content";

/**
 * SimplePractice Contact Form Widget (visible, brand-styled).
 * Opens the SP contact modal. The anchor is autobound by the SP script via
 * refreshSpAutoBind() after mount (the script only binds anchors present at
 * its own execution). The fallback onClick + real href cover the no-bind and
 * no-JS cases.
 */
function ContactWidget({ contact }: { contact: ContactContent }) {
  useEffect(() => {
    refreshSpAutoBind();
  }, []);

  return (
    <div className="max-w-xl">
      <p className="text-[0.9375rem] leading-relaxed text-navy/62 pretty">
        Messages go straight to my front desk through SimplePractice, and I
        usually reply within 24 hours.
      </p>

      <div className="spwidget-button-wrapper mt-9">
        <a
          href={site.booking}
          className="spwidget-button"
          data-spwidget-scope-id={SP_SCOPE_ID}
          data-spwidget-scope-uri="papercranewellness"
          data-spwidget-application-id="7c72cb9f9a9b913654bb89d6c7b4e71a77911b30192051da35384b4d0c6d505b"
          data-spwidget-channel="embedded_widget"
          data-spwidget-type="Contact form"
          data-spwidget-contact
          data-spwidget-scope-global
          data-spwidget-autobind
          onClick={(e) => {
            // Always take the modal path. SP's autobind (when attached to this
            // anchor) opens the same modal instance; our handler guarantees the
            // button works even when SP's initial scan ran before React mounted
            // the anchor (a timing race on slow/warm caches).
            e.preventDefault();
            void openSimplePractice("contact");
          }}
        >
          Contact
        </a>
      </div>

      <p className="mt-6 text-[0.8125rem] leading-relaxed text-navy/50">
        Prefer email?{" "}
        <a href={`mailto:${contact.email}`} className="link-underline hover:text-sage">
          {contact.email}
        </a>{" "}
        — and if you are in crisis, call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline).
      </p>
    </div>
  );
}

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
        <WidgetButton
          variant="light"
          className="mt-7 w-full justify-center border-transparent bg-mist px-7 py-4 text-navy hover:bg-sage hover:text-mist"
        >
          Book Free 15-Minute Consultation
        </WidgetButton>
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

type MergedContact = typeof site & ContactContent;

export default function Contact() {
  const [cmsContact, setCmsContact] = useState<ContactContent | null>(null);
  useEffect(() => {
    let live = true;
    void loadCmsContent().then((c) => {
      if (live) setCmsContact(c.contact);
    });
    return () => {
      live = false;
    };
  }, []);
  // CMS-managed contact details override the bundled copy field-by-field.
  const c: MergedContact = { ...site, ...(cmsContact ?? {}) };

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
        meta={[c.virtual, c.address, c.insurance]}
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
                <ContactWidget contact={c} />
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
                    <a href={`mailto:${c.email}`} className="link-underline mt-1 inline-block text-[0.9375rem] text-navy hover:text-sage">
                      {c.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">Office</p>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-navy/65">{c.address}</p>
                  </div>
                  <div>
                    <p className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">Hours</p>
                    <p className="mt-1 text-[0.9375rem] text-navy/65">{c.hours}</p>
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
