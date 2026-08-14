import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type RouterCtx = { path: string; navigate: (to: string) => void };

const Ctx = createContext<RouterCtx>({ path: "/", navigate: () => {} });

function currentPath() {
  const h = window.location.hash.replace(/^#/, "");
  if (!h) return "/";
  return h.split("?")[0] || "/";
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(() => (typeof window === "undefined" ? "/" : currentPath()));

  useEffect(() => {
    const onHash = () => setPath(currentPath());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to.startsWith("http") || to.startsWith("mailto") || to.startsWith("tel")) {
      window.open(to, "_blank", "noopener");
      return;
    }
    const target = to.startsWith("/") ? to : `/${to}`;
    if (currentPath() === target) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = target;
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useRouter = () => useContext(Ctx);

export function Link({
  to,
  children,
  className,
  onClick,
  ariaLabel,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const { navigate } = useRouter();
  const external = to.startsWith("http") || to.startsWith("mailto") || to.startsWith("tel");
  return (
    <a
      href={external ? to : `#${to}`}
      aria-label={ariaLabel}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
      onClick={(e) => {
        if (external) return;
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
