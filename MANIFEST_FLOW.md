# Manifest-Based Dynamic Module Federation Flow

This document explains the initialization flow for manifest-based dynamic Module Federation.

## 🔄 Initialization Flow

```
1. User navigates to container app
   ↓
2. index.tsx loads and imports bootstrap.tsx
   ↓
3. Bootstrap initializes:
   a. Fetches manifest.json from server
   b. Parses remote configurations
   c. Loads all remote scripts in parallel (absences, profile, etc.)
   d. Waits for all scripts to load
   ↓
4. React app renders
   ↓
5. User navigates to a route (e.g., /absences)
   ↓
6. React.lazy triggers loadRemoteModule()
   a. Gets the remote container from window (already loaded)
   b. Initializes container with shared scope
   c. Retrieves the module from the container
   ↓
7. Remote component renders
```

## 📂 File Responsibilities

### manifest.json

- **Location**: Served from `/manifest.json` (public directory or CDN)
- **Purpose**: Centralized configuration for all remote modules
- **Contains**: URLs, versions, entry points for each remote
- **Updated**: When remotes are deployed to new locations

### manifestService.ts

- **Fetches** manifest from server
- **Validates** manifest structure
- **Caches** manifest to avoid redundant network requests
- **Provides** fallback configuration if fetch fails
- **Exports** utilities to access remote configurations

### bootstrap.tsx

- **Fetches** manifest via manifestService
- **Preloads** all remote scripts dynamically
- **Injects** script tags into document head
- **Tracks** loading state of each remote
- **Renders** app only after all remotes are ready
- **Handles** errors with fallback UI

### index.tsx

- **Defines** lazy-loaded components using React.lazy
- **Loads** modules from preloaded remote containers
- **Initializes** containers with shared scope
- **Retrieves** exposed modules using Module Federation API

### remoteConfig.ts

- **Provides** utility functions to access manifest data
- **Wraps** manifestService for convenience
- **Type-safe** access to remote configurations

## 🎯 Key Benefits

### 1. **Parallel Loading**

All remote scripts load simultaneously in bootstrap, improving performance:

```typescript
await Promise.all(remoteLoadPromises);
```

### 2. **Early Error Detection**

If a remote fails to load, we know before rendering the app:

```typescript
catch (error) {
  // Show error UI instead of broken app
}
```

### 3. **Single Source of Truth**

All remote configurations come from one manifest file:

```json
{
  "remotes": {
    "absences": { "url": "...", "version": "1.0.0" }
  }
}
```

### 4. **No Rebuild Required**

Update remote URLs by changing manifest only:

```bash
# Deploy new absences version
aws s3 cp absences/dist s3://bucket/absences/v2.0.0/

# Update manifest
echo '{"remotes":{"absences":{"url":"https://cdn/absences/v2.0.0"}}}' > manifest.json

# Deploy manifest
aws s3 cp manifest.json s3://bucket/manifest.json

# ✅ Done! Next page load uses new version
```

### 5. **Environment-Specific Configurations**

Different manifests for different environments:

```
/manifest.json           → Development (localhost)
/manifest.staging.json   → Staging (staging-cdn)
/manifest.production.json → Production (production-cdn)
```

## 🔍 Loading Sequence Detail

### Bootstrap Phase

```typescript
// 1. Fetch manifest
const manifest = await fetchManifest();
// → GET /manifest.json

// 2. Extract remote URLs
// manifest.remotes.absences.url = "http://localhost:3001"
// manifest.remotes.profile.url = "http://localhost:3002"

// 3. Create script tags
<script src="http://localhost:3001/remoteEntry.js" data-remote="absences"></script>
<script src="http://localhost:3002/remoteEntry.js" data-remote="profile"></script>

// 4. Wait for all scripts to load
// → window.absences is now available
// → window.profile is now available

// 5. Render React app
ReactDOM.render(<App />)
```

### Component Load Phase

```typescript
// User clicks "Absences" link
// → React Router navigates to /absences
// → <Absences /> component needs to render
// → React.lazy triggers loadRemoteModule("absences", "./Module")

// Load remote module:
const container = window.absences; // Already loaded in bootstrap!
await container.init(shareScope); // Initialize with shared deps
const factory = await container.get("./Module"); // Get the module
const module = factory(); // Execute factory
// → Component renders
```

## 🚨 Error Handling

### Manifest Fetch Failure

```typescript
try {
  const manifest = await fetchManifest();
} catch (error) {
  // Falls back to localhost URLs for development
  // Shows error UI for production
}
```

### Remote Script Load Failure

```typescript
script.onerror = () => {
  console.error(`Failed to load remote: ${remoteName}`);
  reject(new Error(`Failed to load remote: ${remoteName}`));
};
// → Bootstrap catches this and shows error UI
```

### Module Load Failure

```typescript
try {
  const module = await loadRemoteModule("absences", "./Module");
} catch (error) {
  // React error boundary catches this
  // Shows fallback UI: "Failed to load module"
}
```

## 🎨 Customization Points

### 1. Custom Manifest URL

```typescript
// In manifestService.ts
const manifestUrl = process.env.MANIFEST_URL || "/manifest.json";
```

### 2. Custom Loading Strategy

```typescript
// Load remotes on-demand instead of upfront
// Only load a remote when its route is accessed
```

### 3. Cache Control

```typescript
// Add versioning to manifest URL for cache busting
const manifestUrl = `/manifest.json?v=${Date.now()}`;
```

### 4. Retry Logic

```typescript
// Retry failed remote loads
async function loadRemoteScript(remoteName, url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await loadScript(url);
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

## 📊 Performance Considerations

### Pros

- ✅ Parallel loading of all remotes
- ✅ Single manifest fetch (cached)
- ✅ No runtime dependency resolution

### Cons

- ⚠️ Loads all remotes upfront (even if not used)
- ⚠️ Delayed app render until all remotes load

### Optimization

For large apps with many remotes, consider lazy loading:

```typescript
// Load remotes on-demand instead of in bootstrap
// Trade-off: Faster initial load, slower route navigation
```

## 🔐 Security

- Use HTTPS for manifest and remote URLs in production
- Validate manifest structure before using
- Implement CSP headers to restrict script sources
- Consider signing manifests for tamper detection
- Rate limit manifest endpoint to prevent abuse
