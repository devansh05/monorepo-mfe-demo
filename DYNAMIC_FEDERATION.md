# Dynamic Module Federation Setup

Your container app now uses **dynamic Module Federation**, loading remotes at runtime instead of bundling them statically.

## ✅ What Changed

### 1. Dynamic Loading

Remotes are now loaded at runtime using the Module Federation runtime API:

- URLs are configurable via environment variables
- Simulates AWS CDN deployment
- No hardcoded URLs in webpack config

### 2. Configuration

Remote URLs are managed in [src/remoteConfig.ts](apps/container/src/remoteConfig.ts):

```typescript
REMOTE_CONFIG = {
  absences: {
    url: process.env.ABSENCES_URL || "http://localhost:3001",
  },
  profile: {
    url: process.env.PROFILE_URL || "http://localhost:3002",
  },
};
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

## 🌐 Simulating AWS CDN

### Option 1: Environment Variables

Create [.env](apps/container/.env) file:

```bash
ABSENCES_URL=https://d1234abcd.cloudfront.net/absences
PROFILE_URL=https://d5678efgh.cloudfront.net/profile
```

### Option 2: Pass at Runtime

```bash
ABSENCES_URL=https://your-cdn.com/absences npm run start --workspace=container
```

## 🎯 Benefits of Dynamic Federation

1. **Flexible Deployment**: Update remotes independently without rebuilding container
2. **Environment-Specific URLs**: Different URLs for dev/staging/production
3. **CDN Support**: Load from any URL including AWS CloudFront, Cloudflare, etc.
4. **Runtime Configuration**: Change remote locations without code changes
5. **Graceful Fallbacks**: Can implement retry logic or fallback URLs

## 📦 How It Works

1. **Configuration** ([remoteConfig.ts](apps/container/src/remoteConfig.ts))
   - Defines remote names and URLs
   - Supports environment variable overrides

2. **Dynamic Loading** ([index.tsx](apps/container/src/index.tsx))
   - Injects remote script at runtime
   - Initializes Module Federation container
   - Loads exposed modules dynamically

3. **Type Safety** ([module-federation.d.ts](apps/container/src/module-federation.d.ts))
   - TypeScript declarations for webpack globals
   - Type-safe remote loading

## 🔄 Deployment Workflow

### Development

```bash
# Use local URLs (default)
npm run start --workspace=container
```

### Staging

```bash
ABSENCES_URL=https://staging-cdn.com/absences \
PROFILE_URL=https://staging-cdn.com/profile \
npm run start --workspace=container
```

### Production

```bash
ABSENCES_URL=https://d1234.cloudfront.net/absences \
PROFILE_URL=https://d5678.cloudfront.net/profile \
npm run build --workspace=container
```

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
