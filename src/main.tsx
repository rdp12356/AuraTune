import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global error handlers for async errors not caught by ErrorBoundary
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Prevent console error from showing (optional - remove in development)
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error);
});

createRoot(document.getElementById("root")!).render(<App />);
