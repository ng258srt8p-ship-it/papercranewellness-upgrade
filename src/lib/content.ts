/**
 * CMS client — loads editable content from the papercrane-cms Cloudflare
 * Worker (D1 database). Every read has a timeout; any failure resolves to
 * null and the pages fall back to the bundled copy in src/data/site.ts, so
 * the site keeps working if the API is unreachable.
 */

export type AnnouncementContent = { text: string };
export type FaqItem = { q: string; a: string };
export type FaqContent = { items: FaqItem[] };
export type ContactContent = {
  email?: string;
  phone?: string;
  phoneHref?: string;
  address?: string;
  location?: string;
  hours?: string;
  insurance?: string;
  virtual?: string;
};
export type CmsContent = {
  announcement: AnnouncementContent | null;
  faq: FaqContent | null;
  contact: ContactContent | null;
};

export const CMS_API_URL: string =
  (import.meta.env.VITE_CMS_API as string | undefined) ??
  "https://papercrane-cms.vqh9mnrdbp.workers.dev";

let promise: Promise<CmsContent> | null = null;

async function fetchEntry(slug: string, timeoutMs = 2500): Promise<unknown> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${CMS_API_URL}/api/content/${slug}`, {
      signal: ctrl.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { body?: unknown };
    const body = data.body;
    return typeof body === "object" && body !== null ? body : null;
  } catch {
    return null;
  }
}

/** Fetch all CMS content once (cached for the page lifetime). */
export function loadCmsContent(): Promise<CmsContent> {
  promise ??= Promise.all([
    fetchEntry("announcement"),
    fetchEntry("faq"),
    fetchEntry("contact"),
  ]).then(([announcement, faq, contact]) => {
    const a = announcement as Partial<AnnouncementContent> | null;
    const f = faq as Partial<FaqContent> | null;
    const c = contact as Partial<ContactContent> | null;
    const faqValid =
      f && Array.isArray(f.items) && f.items.length > 0 && f.items.every((it) => typeof it?.q === "string" && typeof it?.a === "string");
    return {
      announcement: a && typeof a.text === "string" && a.text.trim() ? { text: a.text } : null,
      faq: faqValid ? (f as FaqContent) : null,
      contact: c && typeof c === "object" && Object.keys(c).length > 0 ? (c as ContactContent) : null,
    };
  });
  return promise;
}
