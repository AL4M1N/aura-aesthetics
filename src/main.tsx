
  import { createRoot } from "react-dom/client";
  import { ThemeProvider } from "next-themes";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { initializeCacheFromManifest } from "./lib/cacheInitializer";

  // Seed localStorage with pre-fetched data from build
  void initializeCacheFromManifest();

  createRoot(document.getElementById("root")!).render(
    <ThemeProvider attribute="class" defaultTheme="system">
      <App />
    </ThemeProvider>
  );
  