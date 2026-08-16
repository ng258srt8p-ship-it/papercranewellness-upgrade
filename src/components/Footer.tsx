import { Link } from "../lib/router";
import { nav, site, specialties } from "../data/site";
import { CraneMark } from "./Logo";
import { Shell, WidgetButton } from "./ui";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-navy/10 bg-mist text-navy">
      <Shell className="relative pt-20 pb-10 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <CraneMark className="h-12 w-12 text-navy" />
            <p className="display mt-7 max-w-sm text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.1] text-navy balance">
              Things don&apos;t have to stay this way forever.
            </p>
            <p className="mt-5 max-w-sm text-[0.875rem] leading-relaxed text-navy/60 pretty">
              Paper Crane Wellness provides virtual therapy anywhere in South Carolina and in-person therapy in Mount Pleasant. Specializing in trauma, PTSD, EMDR, neurodivergent affirming therapy, and individual therapy for adults.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <WidgetButton className="gap-2 px-6 py-3">Book a Free Consultation</WidgetButton>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="eyebrow text-navy/40">Practice</p>
              <ul className="mt-5 space-y-3">
                {[{ label: "Home", to: "/" }, ...nav].map((n) => (
                  <li key={n.to + n.label}>
                    <Link to={n.to} className="link-underline text-[0.875rem] text-navy/70 hover:text-navy">
                      {n.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-navy/40">Specialties</p>
              <ul className="mt-5 space-y-3">
                {specialties.map((s) => (
                  <li key={s.slug}>
                    <Link to={s.slug} className="link-underline text-[0.875rem] text-navy/70 hover:text-navy">
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-navy/40">Reach</p>
              <ul className="mt-5 space-y-4 text-[0.875rem] text-navy/70">
                <li>
                  <a href={`mailto:${site.email}`} className="link-underline hover:text-navy">
                    {site.email}
                  </a>
                </li>
                <li className="leading-relaxed text-navy/55">{site.address}</li>
                <li className="leading-relaxed text-navy/55">{site.virtual}</li>
                <li className="leading-relaxed text-navy/55">{site.insurance}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 rounded-[4px] border border-navy/12 bg-paper/70 p-6">
          <p className="text-[0.75rem] leading-relaxed text-navy/55">
            <strong className="font-semibold text-navy/75">If you are in crisis</strong>, please call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline), text <strong>HOME</strong> to <strong>741741</strong> (Crisis Text Line), or go to your nearest emergency department.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-navy/10 pt-7 text-[0.75rem] text-navy/40 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} {site.name} LLC. All rights reserved.</p>
          <a href={site.url} className="link-underline hover:text-navy">{site.url.replace("https://", "")}</a>
        </div>
      </Shell>
    </footer>
  );
}
