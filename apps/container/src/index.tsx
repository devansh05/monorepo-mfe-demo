import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./module-federation.d.ts";

// TypeScript declarations for Module Federation runtime
declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

/**
 * Dynamically load a remote module using Module Federation
 * The remote scripts are preloaded in bootstrap.tsx based on the manifest
 * This function initializes the container and retrieves the specified module
 */
const loadRemoteModule = async (
  remoteName: string,
  modulePath: string,
): Promise<{ default: React.ComponentType }> => {
  try {
    // Get the remote container (loaded by bootstrap)
    // @ts-expect-error - Remote containers are added dynamically via script tags
    const container = window[remoteName] as Container | undefined;

    if (!container) {
      throw new Error(
        `Remote container "${remoteName}" not found. Ensure the remote script was loaded in bootstrap.`,
      );
    }

    // Initialize the shared scope if not already initialized
    await __webpack_init_sharing__("default");

    // Initialize the container with the shared scope
    await container.init(__webpack_share_scopes__.default);

    // Get the module factory from the container
    const factory = await container.get(modulePath);
    const module = factory();

    console.log(`[Module Federation] Loaded ${remoteName}/${modulePath}`);
    return module;
  } catch (error) {
    console.error(
      `[Module Federation] Failed to load ${remoteName}/${modulePath}:`,
      error,
    );
    throw error;
  }
};

// Dynamically load the Microfrontends using React.lazy
// The remote scripts are preloaded in bootstrap based on the manifest
const Absences = React.lazy(() => loadRemoteModule("absences", "./Module"));
const Profile = React.lazy(() => loadRemoteModule("profile", "./Module"));

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="dashboard-layout">
        {/* Navigation Bar */}
        <nav style={{ padding: "1rem", background: "#eee" }}>
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/absences">Absences</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
          </ul>
        </nav>

        {/* The Stage where apps appear */}
        <React.Suspense fallback={<div>Loading App...</div>}>
          <Routes>
            <Route path="/" element={<HomeDashboard />} />
            <Route path="/absences/*" element={<Absences />} />
            <Route path="/profile/*" element={<Profile />} />
          </Routes>
        </React.Suspense>
      </div>
    </QueryClientProvider>
  );
}

function HomeDashboard() {
  return <h1>Welcome to the Corporate Dashboard</h1>;
}

export default App;
