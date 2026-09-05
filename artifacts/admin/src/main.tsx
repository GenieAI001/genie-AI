import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Point the shared API client at the API server. In production this should
// be set at build time via the VITE_API_BASE_URL env var — e.g.
// https://api.yourapp.com — since the admin dashboard is typically deployed
// separately from the API server. Empty string means "same origin".
setBaseUrl(import.meta.env.VITE_API_BASE_URL || "");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
