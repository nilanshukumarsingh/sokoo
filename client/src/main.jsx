/**
 * Application Entry Point
 * Initializes React with GSAP and registers plugins globally
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins globally
gsap.registerPlugin(ScrollTrigger);

// Configure GSAP defaults for optimal performance
gsap.defaults({
  ease: "power3.out",
  duration: 0.8,
});

// Configure ScrollTrigger defaults
ScrollTrigger.defaults({
  toggleActions: "play none none reverse",
});

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
