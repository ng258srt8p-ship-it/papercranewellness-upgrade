import { useState } from "react";
import { Shell } from "../components/ui";
import { CMS_API_URL } from "../lib/content";

type Entry = {
  slug: string;
  title: string;
  body: unknown;
  meta: unknown;
  updated_at: string;
};

const TOKEN_KEY = "pc-cms-admin-token";

function getToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

async function adminFetch(path: string, init: RequestInit = {}): Promise<{ status: number; data: unknown }> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);
  const res = await fetch(`${CMS_API_URL}${path}`, { ...init, headers });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON */
  }
  return { status: res.status, data };
}

export default function Admin() {
  const [token, setToken] = useState(getToken);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  // local edit buffers keyed by slug
  const [drafts, setDrafts] = useState<Record<string, { title?: string; body?: string }>>({});

  const setDraft = (slug: string, patch: Partial<{ title: string; body: string }>) =>
    setDrafts((d) => ({ ...d, [slug]: { ...d[slug], ...patch } }));

  const load = async () => {
    sessionStorage.setItem(TOKEN_KEY, token.trim());
    setError(null);
    setStatus("Loading…");
    const { status: s, data } = await adminFetch("/api/admin/content");
    if (s === 200) {
      const list = (data as Entry[]) ?? [];
      setEntries(list);
      setDrafts(Object.fromEntries(list.map((e) => [e.slug, { title: e.title, body: JSON.stringify(e.body, null, 2) }])));
      setStatus(`Loaded ${list.length} entr${list.length === 1 ? "y" : "ies"} · ${CMS_API_URL}`);
    } else {
      setEntries(null);
      setError((data as { error?: string })?.error ?? `Request failed (${s})`);
      setStatus(null);
    }
  };

  const save = async (slug: string) => {
    const d = drafts[slug];
    if (!d || d.title === undefined || d.body === undefined) return;
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(d.body);
    } catch {
      setError(`"${slug}": body is not valid JSON`);
      return;
    }
    setSaving(slug);
    setError(null);
    const { status: s, data } = await adminFetch(`/api/admin/content/${slug}`, {
      method: "PUT",
      body: JSON.stringify({ title: d.title, body: parsedBody }),
    });
    setSaving(null);
    if (s === 200) {
      const e = data as Entry;
      setEntries((list) => (list ? list.map((x) => (x.slug === slug ? e : x)) : list));
      setStatus(`Saved "${slug}" at ${new Date().toLocaleTimeString()}`);
    } else {
      setError((data as { error?: string })?.error ?? `Save failed (${s})`);
    }
  };

  const remove = async (slug: string) => {
    if (!window.confirm(`Delete content entry "${slug}"?`)) return;
    setSaving(slug);
    setError(null);
    const { status: s, data } = await adminFetch(`/api/admin/content/${slug}`, { method: "DELETE" });
    setSaving(null);
    if (s === 200) {
      setEntries((list) => (list ? list.filter((e) => e.slug !== slug) : list));
      setStatus(`Deleted "${slug}"`);
    } else {
      setError((data as { error?: string })?.error ?? `Delete failed (${s})`);
    }
  };

  return (
    <section className="min-h-screen bg-mist pt-32 pb-24">
      <Shell>
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow text-sage">Content admin</p>
          <h1 className="display mt-5 text-[clamp(2rem,5vw,3.2rem)] text-navy">
            Edit site <span className="italic text-sage">content.</span>
          </h1>
          <p className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-navy/60">
            Edits go to the CMS (Cloudflare D1) and appear on the live site without a
            redeploy. The site falls back to its built-in copy whenever the CMS is
            unreachable.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <label className="block">
              <span className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">Admin token</span>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste CMS admin token"
                className="mt-1 w-full rounded-[4px] border border-navy/15 bg-paper px-3 py-2.5 text-[0.9375rem] text-navy outline-none focus:border-sage"
              />
            </label>
            <div className="flex items-end">
              <button
                onClick={() => void load()}
                className="rounded-[4px] bg-navy px-6 py-2.5 text-[0.9375rem] text-mist transition-colors duration-300 hover:bg-sage"
              >
                {entries ? "Reload" : "Load content"}
              </button>
            </div>
          </div>

          {(status || error) && (
            <p className={`mt-4 text-[0.875rem] ${error ? "text-red-700" : "text-navy/55"}`}>
              {error ?? status}
            </p>
          )}

          {entries && (
            <div className="mt-10 space-y-10">
              {entries.map((e) => (
                <div key={e.slug} data-cms-entry={e.slug} className="rounded-[6px] border border-navy/10 bg-paper p-6 md:p-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="display text-[1.15rem] text-sage">{e.slug}</h2>
                    <span className="text-[0.75rem] text-navy/40">updated {new Date(e.updated_at).toLocaleString()}</span>
                  </div>
                  <label className="mt-5 block">
                    <span className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">Title</span>
                    <input
                      value={drafts[e.slug]?.title ?? ""}
                      onChange={(ev) => setDraft(e.slug, { title: ev.target.value })}
                      className="mt-1 w-full rounded-[4px] border border-navy/15 bg-mist/40 px-3 py-2 text-[0.9375rem] text-navy outline-none focus:border-sage"
                    />
                  </label>
                  <label className="mt-4 block">
                    <span className="text-[0.7rem] tracking-[0.08em] text-navy/40 uppercase">
                      Body (JSON — {e.slug === "faq" ? "array of {q, a} under items" : "object"})
                    </span>
                    <textarea
                      rows={e.slug === "faq" ? 16 : 6}
                      value={drafts[e.slug]?.body ?? ""}
                      onChange={(ev) => setDraft(e.slug, { body: ev.target.value })}
                      spellCheck={false}
                      className="mt-1 w-full rounded-[4px] border border-navy/15 bg-mist/40 px-3 py-2 font-mono text-[0.8125rem] leading-relaxed text-navy outline-none focus:border-sage"
                    />
                  </label>
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => void save(e.slug)}
                      disabled={saving === e.slug}
                      className="rounded-[4px] bg-sage px-5 py-2 text-[0.875rem] text-mist transition-colors duration-300 hover:bg-sage-deep disabled:opacity-50"
                    >
                      {saving === e.slug ? "Saving…" : "Save"}
                    </button>
                    <button
                      onClick={() => void remove(e.slug)}
                      disabled={saving === e.slug}
                      className="rounded-[4px] border border-navy/20 px-5 py-2 text-[0.875rem] text-navy/70 transition-colors duration-300 hover:border-red-400 hover:text-red-700 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Shell>
    </section>
  );
}
