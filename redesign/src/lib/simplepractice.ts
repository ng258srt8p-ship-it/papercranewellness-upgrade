/**
 * SimplePractice widget integration (appointment + contact modals).
 *
 * The SP integration script (loaded with `defer` in index.html) autobinds the
 * hidden anchors in #sp-widget-host and registers:
 *   window.SPWidgetInstances["<scopeId>-appointment"]  (OAR modal)
 *   window.SPWidgetInstances["<scopeId>-contact"]      (contact form modal)
 *
 * React CTAs call openSimplePractice(kind) which reveals the matching modal.
 * Fallbacks: click the hidden anchor (uses the onclick SP autobind attached),
 * then window.open the booking page.
 */

export const SP_SCOPE_ID = "ef573a05-79ef-46ab-9b18-d5c65a183d97";
export const SP_BOOKING_URL = "https://papercranewellness.clientsecure.me";

export type WidgetKind = "appointment" | "contact";

declare global {
  interface Window {
    SPWidgetInstances?: Record<string, { reveal: () => void }>;
    spWidgetAutoBind?: () => void;
  }
}

function instanceKey(kind: WidgetKind) {
  return `${SP_SCOPE_ID}-${kind}`;
}

function getInstance(kind: WidgetKind) {
  return window.SPWidgetInstances?.[instanceKey(kind)];
}

function waitForInstance(kind: WidgetKind, timeoutMs = 5000) {
  return new Promise<{ reveal: () => void } | null>((resolve) => {
    const start = Date.now();
    const tick = () => {
      const inst = getInstance(kind);
      if (inst) return resolve(inst);
      if (Date.now() - start >= timeoutMs) return resolve(null);
      setTimeout(tick, 100);
    };
    tick();
  });
}

function clickHiddenAnchor(kind: WidgetKind): boolean {
  const sel =
    kind === "appointment"
      ? '#sp-widget-host .spwidget-button[data-spwidget-type="OAR"]'
      : '#sp-widget-host .spwidget-button[data-spwidget-type="Contact form"]';
  const el = document.querySelector<HTMLElement>(sel);
  if (!el) return false;
  el.click();
  return true;
}

/**
 * Open the SimplePractice modal for the given widget kind.
 * Resolves after the modal is triggered (or the fallback is used).
 */
export async function openSimplePractice(kind: WidgetKind) {
  const inst = await waitForInstance(kind);
  if (inst) {
    inst.reveal();
    return;
  }
  // SP script loaded but instance missing (shouldn't happen) — try the anchor's bound onclick.
  if (typeof window.spWidgetAutoBind === "function" && clickHiddenAnchor(kind)) {
    return;
  }
  // Last resort: plain booking page in a new tab (site stays open).
  window.open(SP_BOOKING_URL, "_blank", "noopener");
}

/**
 * Re-run SP autobinding. Needed for widget anchors rendered by React after the
 * SP script has already executed (e.g. the visible Contact button on /contact).
 * Idempotent: instances are cached by the SP script.
 */
export function refreshSpAutoBind() {
  if (typeof window.spWidgetAutoBind === "function") {
    window.spWidgetAutoBind();
  }
}
