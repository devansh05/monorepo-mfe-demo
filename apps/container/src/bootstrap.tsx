import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./index";
import { fetchManifest, getRemoteEntryUrl } from "./manifestService";

/**
 * Dynamically loads a remote Module Federation container script
 */
async function loadRemoteScript(
  remoteName: string,
  url: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      `script[data-remote="${remoteName}"]`,
    );

    if (existingScript) {
      console.log(`[Bootstrap] Remote script already loaded: ${remoteName}`);
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.setAttribute("data-remote", remoteName);
    script.onload = () => {
      console.log(
        `[Bootstrap] Loaded remote script: ${remoteName} from ${url}`,
      );
      resolve();
    };
    script.onerror = () => {
      console.error(
        `[Bootstrap] Failed to load remote script: ${remoteName} from ${url}`,
      );
      reject(new Error(`Failed to load remote: ${remoteName}`));
    };

    document.head.appendChild(script);
  });
}

// Preload the manifest and initialize remote scripts before rendering the app
async function initializeApp() {
  try {
    console.log("[Bootstrap] Initializing application...");

    // Fetch the manifest from the server
    const manifest = await fetchManifest();
    console.log("[Bootstrap] Manifest loaded:", manifest.version);

    // Load all remote scripts in parallel
    const remoteLoadPromises = Object.entries(manifest.remotes).map(
      ([remoteName, config]) => {
        const url = getRemoteEntryUrl(config);
        return loadRemoteScript(remoteName, url);
      },
    );

    await Promise.all(remoteLoadPromises);
    console.log("[Bootstrap] All remote scripts loaded");

    // Render the app
    const root = ReactDOM.createRoot(document.getElementById("root")!);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );

    console.log("[Bootstrap] Application initialized successfully");
  } catch (error) {
    console.error("[Bootstrap] Failed to initialize application:", error);

    // Render error state
    const root = ReactDOM.createRoot(document.getElementById("root")!);
    root.render(
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Failed to Load Application</h1>
        <p>Unable to fetch remote configuration. Please try again later.</p>
        <pre
          style={{ textAlign: "left", background: "#f5f5f5", padding: "1rem" }}
        >
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>,
    );
  }
}

// Initialize the app
initializeApp();
