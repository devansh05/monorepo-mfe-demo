import * as React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getRemoteUrl, REMOTE_CONFIG } from "./remoteConfig";
import "./module-federation.d.ts";

// Helper function to dynamically load Module Federation remotes
const loadRemoteContainer = async (
  containerName: string,
  remoteUrl: string,
): Promise<unknown> => {
  // Load the remote script
  await new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${remoteUrl}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = remoteUrl;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });

  // @ts-expect-error - Module Federation container is loaded dynamically
  const container = window[containerName];

  // Initialize the container with shared scope
  await container.init(__webpack_share_scopes__.default);

  return container;
};

const loadRemoteModule = async (
  remoteName: "absences" | "profile",
  modulePath: string,
): Promise<{ default: React.ComponentType }> => {
  const config = REMOTE_CONFIG[remoteName];
  const remoteUrl = getRemoteUrl(remoteName);

  const container = await loadRemoteContainer(config.name, remoteUrl);

  // @ts-expect-error - get method exists on Module Federation container
  const factory = await container.get(modulePath);
  const Module = factory();

  return Module;
};

// Dynamically load the Microfrontends
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
