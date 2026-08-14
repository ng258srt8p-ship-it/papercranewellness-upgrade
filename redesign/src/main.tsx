import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import favicon from "./assets/images/favicon.png";

// Favicon injected here (instead of index.html) so the single-file build inlines it.
const iconLink = document.createElement("link");
iconLink.rel = "icon";
iconLink.type = "image/png";
iconLink.href = favicon;
document.head.appendChild(iconLink);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
