/**
 * Manifest Service
 *
 * Fetches and manages remote module configurations from a server manifest file.
 * This simulates a production scenario where remote URLs are managed centrally
 * and can be updated without rebuilding the container app.
 */

export interface RemoteConfig {
  name: string;
  url: string;
  entry: string;
  scope: string;
  module: string;
  version: string;
}

export interface Manifest {
  version: string;
  timestamp: string;
  environment: string;
  remotes: Record<string, RemoteConfig>;
}

// Cache for the manifest to avoid multiple fetches
let manifestCache: Manifest | null = null;

/**
 * Fetches the manifest from the server
 * In production, this would be an API endpoint like:
 * - https://api.yourcompany.com/mfe/manifest
 * - https://cdn.yourcompany.com/mfe-config/manifest.json
 * - S3/CloudFront URL serving the manifest
 */
export async function fetchManifest(): Promise<Manifest> {
  // Return cached manifest if available
  if (manifestCache) {
    console.log("[Manifest] Using cached manifest");
    return manifestCache;
  }

  try {
    console.log("[Manifest] Fetching manifest from server...");

    // In production, this URL would be configurable via environment variable
    // e.g., process.env.MANIFEST_URL || '/manifest.json'
    const manifestUrl = "/manifest.json";

    const response = await fetch(manifestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add cache busting in production to ensure latest config
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch manifest: ${response.status} ${response.statusText}`,
      );
    }

    const manifest: Manifest = await response.json();

    // Validate manifest structure
    if (!manifest.remotes || typeof manifest.remotes !== "object") {
      throw new Error("Invalid manifest structure: missing remotes");
    }

    console.log("[Manifest] Loaded successfully:", {
      version: manifest.version,
      environment: manifest.environment,
      remotes: Object.keys(manifest.remotes),
    });

    // Cache the manifest
    manifestCache = manifest;

    return manifest;
  } catch (error) {
    console.error("[Manifest] Failed to load manifest:", error);

    // Fallback to default configuration for development
    console.warn("[Manifest] Using fallback configuration");
    const fallbackManifest: Manifest = {
      version: "0.0.0",
      timestamp: new Date().toISOString(),
      environment: "fallback",
      remotes: {
        absences: {
          name: "absences",
          url: "http://localhost:3001",
          entry: "/remoteEntry.js",
          scope: "absences",
          module: "./Module",
          version: "0.0.0",
        },
        profile: {
          name: "profile",
          url: "http://localhost:3002",
          entry: "/remoteEntry.js",
          scope: "profile",
          module: "./Module",
          version: "0.0.0",
        },
      },
    };

    manifestCache = fallbackManifest;
    return fallbackManifest;
  }
}

/**
 * Gets a specific remote configuration from the manifest
 */
export async function getRemoteConfig(
  remoteName: string,
): Promise<RemoteConfig> {
  const manifest = await fetchManifest();
  const config = manifest.remotes[remoteName];

  if (!config) {
    throw new Error(`Remote "${remoteName}" not found in manifest`);
  }

  return config;
}

/**
 * Gets all remote configurations from the manifest
 */
export async function getAllRemoteConfigs(): Promise<
  Record<string, RemoteConfig>
> {
  const manifest = await fetchManifest();
  return manifest.remotes;
}

/**
 * Clears the manifest cache (useful for testing or forcing a refresh)
 */
export function clearManifestCache(): void {
  manifestCache = null;
  console.log("[Manifest] Cache cleared");
}

/**
 * Gets the full URL for a remote entry file
 */
export function getRemoteEntryUrl(config: RemoteConfig): string {
  return `${config.url}${config.entry}`;
}

/**
 * Converts manifest to the format expected by Module Federation's setRemoteDefinitions API
 *
 * @returns Record of remote definitions in the format: { remoteName: "remoteName@remoteUrl" }
 */
export async function getRemoteDefinitions(): Promise<Record<string, string>> {
  const manifest = await fetchManifest();
  const definitions: Record<string, string> = {};

  for (const [remoteName, config] of Object.entries(manifest.remotes)) {
    const remoteUrl = getRemoteEntryUrl(config);
    definitions[remoteName] = `${config.name}@${remoteUrl}`;
  }

  console.log("[Manifest] Remote definitions prepared:", definitions);
  return definitions;
}
