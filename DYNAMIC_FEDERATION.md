# Dynamic Module Federation Setup

Your container app now uses **dynamic Module Federation with manifest-based configuration**, loading remotes at runtime from a centralized manifest file instead of environment variables.

## ✅ What Changed

### 1. Manifest-Based Configuration

Remote configurations are now fetched from a server-side manifest file:

- **Centralized Management**: All remote URLs and versions in one place
- **Runtime Updates**: Change remote locations without rebuilding
- **Version Tracking**: Track which version of each remote is deployed
- **Environment Support**: Different manifests for dev/staging/production

### 2. Manifest Service

A dedicated service ([manifestService.ts](apps/container/src/manifestService.ts)) handles:

- Fetching manifest from server
- Caching for performance
- Fallback configuration for resilience
- Validation and error handling

### 3. Configuration Files

#### Manifest File ([public/manifest.json](apps/container/public/manifest.json))

```json
{
  "version": "1.0.0",
  "environment": "development",
  "remotes": {
    "absences": {
      "name": "absences",
      "url": "http://localhost:3001",
      "entry": "/remoteEntry.js",
      "scope": "absences",
      "module": "./Module",
      "version": "1.0.0"
    },
    "profile": {
      "name": "profile",
      "url": "http://localhost:3002",
      "entry": "/remoteEntry.js",
      "scope": "profile",
      "module": "./Module",
      "version": "1.0.0"
    }
  }
}
```

## 🚀 Running Locally

Same as before - start all three apps:

```bash
# Terminal 1
npm run start --workspace=absence-management

# Terminal 2
npm run start --workspace=user-profile

# Terminal 3
npm run start --workspace=container
```

Access: http://localhost:3000

## 🌐 Production Deployment

### Manifest Hosting Options

1. **API Endpoint**

   ```
   https://api.yourcompany.com/mfe/manifest
   ```

2. **CDN Static File**

   ```
   https://cdn.yourcompany.com/mfe-config/manifest.json
   ```

3. **S3/CloudFront**
   ```
   https://d1234abcd.cloudfront.net/config/manifest.json
   ```

### Environment-Specific Manifests

Create different manifest files for each environment:

```
manifest.dev.json
manifest.staging.json
manifest.production.json
```

Configure the manifest URL via environment variable in your deployment:

```typescript
// In manifestService.ts
const manifestUrl = process.env.MANIFEST_URL || "/manifest.json";
```

### Example Production Manifest

```json
{
  "version": "2.1.0",
  "timestamp": "2026-02-10T14:30:00Z",
  "environment": "production",
  "remotes": {
    "absences": {
      "name": "absences",
      "url": "https://d1234abcd.cloudfront.net/absences",
      "entry": "/remoteEntry.js",
      "scope": "absences",
      "module": "./Module",
      "version": "2.1.0"
    },
    "profile": {
      "name": "profile",
      "url": "https://d5678efgh.cloudfront.net/profile",
      "entry": "/remoteEntry.js",
      "scope": "profile",
      "module": "./Module",
      "version": "1.5.3"
    }
  }
}
```

## 🎯 Benefits of Manifest-Based Federation

1. **Centralized Configuration**: Single source of truth for all remote modules
2. **Independent Deployment**: Update remotes without container rebuild
3. **Version Management**: Track and control remote versions explicitly
4. **A/B Testing**: Easily switch between different remote versions
5. **Rollback Support**: Quick rollback by updating manifest
6. **Multi-Environment**: Different configurations per environment
7. **Runtime Flexibility**: Change configurations without code changes
8. **Monitoring**: Track which versions are deployed where

## 📦 How It Works

### 1. Application Bootstrap ([bootstrap.tsx](apps/container/src/bootstrap.tsx))

- Fetches manifest from server
- Preloads all remote scripts in parallel based on manifest
- Handles errors gracefully with fallback UI
- Only renders app after all remotes are loaded

### 2. Manifest Service ([manifestService.ts](apps/container/src/manifestService.ts))

- Fetches manifest from server endpoint
- Validates manifest structure
- Provides fallback configuration for development
- Caches manifest to avoid redundant fetches
- Converts manifest to remote definitions format
- Caches for performance

### 3. Remote Configuration ([remoteConfig.ts](apps/container/src/remoteConfig.ts))

- Utilities to get remote URLs
- Async configuration loading
- Type-safe access

### 4. Dynamic Loading ([index.tsx](apps/container/src/index.tsx))

- Loads remotes on demand
- React lazy loading
- Error boundaries

## 🔄 Deployment Workflow

### 1. Deploy Remote Modules

```bash
# Deploy absences to CDN
npm run build --workspace=absence-management
aws s3 sync apps/absence-management/dist s3://your-bucket/absences/
cloudfront invalidate...

# Deploy profile to CDN
npm run build --workspace=user-profile
aws s3 sync apps/user-profile/dist s3://your-bucket/profile/
```

### 2. Update Manifest

Update the manifest file with new URLs/versions:

```json
{
  "version": "2.2.0",
  "remotes": {
    "absences": {
      "url": "https://cdn.yourcompany.com/absences/v2.1.0",
      "version": "2.1.0"
    }
  }
}
```

### 3. Deploy Manifest

```bash
# Upload to S3/CDN
aws s3 cp manifest.production.json s3://your-bucket/config/manifest.json
```

### 4. Container App (Optional)

The container app automatically picks up the new manifest on next load. No rebuild needed!

## 🛠️ Advanced Features

### Cache Busting

The manifest service uses `cache: 'no-cache'` to ensure fresh configuration:

```typescript
const response = await fetch(manifestUrl, {
  cache: "no-cache",
});
```

### Manual Cache Clearing

```typescript
import { clearManifestCache } from "./manifestService";

// Force refresh
clearManifestCache();
```

### Custom Manifest URL

Configure via environment variable:

```bash
MANIFEST_URL=https://api.yourcompany.com/mfe/manifest npm start
```

### Fallback Strategy

If manifest fetch fails, the service falls back to default localhost URLs for development.

## 🔍 Monitoring & Debugging

Check console for manifest loading:

```
[Manifest] Fetching manifest from server...
[Manifest] Loaded successfully: { version: '1.0.0', environment: 'development', remotes: ['absences', 'profile'] }
[Bootstrap] Manifest loaded: 1.0.0
[Bootstrap] Application initialized successfully
```

## 🚨 Error Handling

The application handles manifest failures gracefully:

1. **Network Error**: Falls back to default configuration
2. **Invalid JSON**: Uses fallback configuration
3. **Missing Remotes**: Error displayed to user
4. **Runtime Errors**: React error boundaries catch issues

## 📝 Migration from Environment Variables

Previously, remote URLs were configured via environment variables:

```bash
# Old approach ❌
ABSENCES_URL=https://cdn.com/absences npm start
```

Now, they're in the manifest file:

```json
{
  "remotes": {
    "absences": {
      "url": "https://cdn.com/absences"
    }
  }
}
```

**Benefits**:

- ✅ No rebuild needed to change URLs
- ✅ Centralized configuration
- ✅ Version tracking
- ✅ Easier rollback
  npm run start --workspace=container

````

### Production

```bash
ABSENCES_URL=https://d1234.cloudfront.net/absences \
PROFILE_URL=https://d5678.cloudfront.net/profile \
npm run build --workspace=container
````

## 🛠️ Advanced: Adding New Remotes

1. Deploy remote to CDN
2. Add to [remoteConfig.ts](apps/container/src/remoteConfig.ts):

```typescript
export const REMOTE_CONFIG = {
  // ... existing remotes
  newRemote: {
    name: "newRemote",
    url: process.env.NEW_REMOTE_URL || "http://localhost:3003",
    entry: "/remoteEntry.js",
  },
};
```

3. Load dynamically:

```typescript
const NewRemote = React.lazy(() => loadRemoteModule("newRemote", "./Module"));
```

## 📝 Notes

- Remote apps must be running/deployed before container loads
- URLs must point to valid `remoteEntry.js` files
- CORS must be configured on remote servers
- Shared dependencies are still managed via webpack config
