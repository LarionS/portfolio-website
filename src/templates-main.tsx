import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import Templates from "./Templates";
import "./studio.css";
import "./templates.css";
import "./cinematic.css";

const slug = window.location.pathname.split("/").filter(Boolean)[1] || "";
const root = document.getElementById("template-root")!;
const app = <StrictMode><Templates slug={slug}/></StrictMode>;
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
