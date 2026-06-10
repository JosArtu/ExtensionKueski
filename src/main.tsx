import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { isExtensionContext } from "./extension/session";
import "./index.css";

// Supabase client is initialized automatically when data.ts is imported
console.log('🚀 Extension loading...');

if (isExtensionContext()) {
  document.body.classList.add("extension-popup");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);