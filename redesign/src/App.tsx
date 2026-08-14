import { useEffect } from "react";
import { RouterProvider, useRouter } from "./lib/router";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import { Button, Shell } from "./components/ui";
import Home from "./pages/Home";
import About from "./pages/About";
import Specialties from "./pages/Specialties";
import Specialty from "./pages/Specialty";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";

const titles: Record<string, string> = {
  "/": "Paper Crane Wellness \u2014 Trauma Therapy in South Carolina",
  "/about": "About Rebekah Tozer, LISW-CP \u2014 Paper Crane Wellness",
  "/specialties": "Specialties \u2014 Paper Crane Wellness",
  "/trauma": "Trauma, PTSD & EMDR Therapy \u2014 Paper Crane Wellness",
  "/neurodivergent": "Neurodivergent Affirming Therapy \u2014 Paper Crane Wellness",
  "/individual": "Individual Therapy for Adults \u2014 Paper Crane Wellness",
  "/faq": "FAQ \u2014 Paper Crane Wellness",
  "/contact": "Contact & Booking \u2014 Paper Crane Wellness",
};

function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-paper pt-40 pb-24">
      <Shell>
        <p className="eyebrow text-sage">Error 404</p>
        <h1 className="display mt-6 text-[clamp(2.6rem,8vw,5.5rem)] text-navy">
          Page not <span className="italic text-sage">found.</span>
        </h1>
        <p className="mt-7 max-w-md text-[1.0625rem] leading-relaxed text-navy/65">
          The page you&apos;re looking for doesn&apos;t exist. Head back home or book a consultation.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button to="/">Back to home</Button>
          <Button to="/contact" variant="ghost">
            Book a consultation
          </Button>
        </div>
      </Shell>
    </section>
  );
}

function Routes() {
  const { path } = useRouter();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    document.title = titles[path] ?? "Paper Crane Wellness";
  }, [path]);

  switch (path) {
    case "/":
      return <Home />;
    case "/about":
      return <About />;
    case "/specialties":
      return <Specialties />;
    case "/trauma":
    case "/neurodivergent":
    case "/individual":
      return <Specialty slug={path} key={path} />;
    case "/faq":
      return <FAQ />;
    case "/contact":
      return <Contact />;
    default:
      return <NotFound />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <div className="min-h-screen bg-paper">
        <Nav />
        <main id="main">
          <Routes />
        </main>
        <Footer />
      </div>
    </RouterProvider>
  );
}
