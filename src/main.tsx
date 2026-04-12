import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root")!;

const rootContent = (
  <HelmetProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </HelmetProvider>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, rootContent);
} else {
  createRoot(rootElement).render(rootContent);
}




