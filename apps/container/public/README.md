# Manifest-Based Dynamic Module Federation

This directory contains manifest files that configure remote module locations for Module Federation.

## 📋 Manifest Files

- **manifest.json** - Development environment (localhost)
- **manifest.staging.json** - Staging environment
- **manifest.production.json** - Production environment

## 🔧 Manifest Structure

```json
{
  "version": "1.0.0",
  "timestamp": "2026-02-10T00:00:00Z",
  "environment": "development",
  "remotes": {
    "remoteName": {
      "name": "remoteName",
      "url": "https://cdn.example.com/remote",
      "entry": "/remoteEntry.js",
      "scope": "remoteName",
      "module": "./Module",
      "version": "1.0.0"
    }
  }
}
```

### Fields

- **version**: Manifest version (semver)
- **timestamp**: When this manifest was generated
- **environment**: Target environment (development, staging, production)
- **remotes**: Object containing all remote module configurations
  - **name**: Internal name of the remote
  - **url**: Base URL where the remote is hosted (CDN, server, localhost)
  - **entry**: Path to the Module Federation entry file
  - **scope**: Module Federation scope name
  - **module**: The exposed module path
  - **version**: Version of the remote module

## 🚀 Usage

The container app fetches the manifest at runtime from `/manifest.json` by default.

### Development

Uses `manifest.json` with localhost URLs automatically served by webpack dev server.

### Production

Configure your deployment to serve the appropriate manifest:

```bash
# Option 1: Copy the right manifest
cp manifest.production.json dist/manifest.json

# Option 2: Set MANIFEST_URL environment variable
MANIFEST_URL=https://api.yourcompany.com/mfe/manifest
```

## 🔄 Updating Remotes

To deploy a new version of a remote:

1. **Deploy the remote module** to your CDN
2. **Update the manifest** with the new version and URL
3. **Deploy the manifest** to your server/CDN

The container app will automatically use the new configuration on next load - no rebuild required!

### Example: Updating Absences Module

```json
{
  "version": "1.1.0",
  "remotes": {
    "absences": {
      "url": "https://cdn.example.com/absences/v2.0.0",
      "version": "2.0.0"
    }
  }
}
```

## 🏗️ Deployment Strategies

### Blue-Green Deployment

Maintain two manifests and switch between them:

```bash
# Blue (current)
manifest.blue.json -> manifest.json

# Green (new version)
manifest.green.json

# Switch
mv manifest.json manifest.blue.backup.json
cp manifest.green.json manifest.json
```

### Canary Deployment

Route a percentage of traffic to different manifests:

```
manifest.stable.json  (90% of traffic)
manifest.canary.json  (10% of traffic)
```

### Version Pinning

Pin specific remote versions for stability:

```json
{
  "remotes": {
    "absences": {
      "url": "https://cdn.example.com/absences/v1.5.3",
      "version": "1.5.3"
    }
  }
}
```

## 🛡️ Best Practices

1. **Always include version numbers** in your manifest and remote URLs
2. **Use immutable URLs** (include version in path) for better caching
3. **Include timestamps** to track when configurations change
4. **Validate manifests** before deploying to production
5. **Keep backups** of previous manifests for quick rollback
6. **Monitor manifest fetch** performance and errors
7. **Use CDN** with proper cache headers for the manifest file
8. **Test thoroughly** in staging before production

## 📊 Monitoring

Key metrics to monitor:

- Manifest fetch success rate
- Manifest fetch latency
- Remote module load success rate
- Version compatibility issues
- Fallback activation rate

## 🔍 Troubleshooting

### Manifest not loading

Check browser console for:

```
[Manifest] Failed to load manifest: 404 Not Found
```

Solution: Ensure manifest.json is in the public directory or accessible via configured URL.

### Remote module not found

Check manifest has correct remote configuration:

```json
{
  "remotes": {
    "absences": { ... }
  }
}
```

### CORS errors

Ensure your CDN/server sends appropriate CORS headers for the manifest file.

## 🔐 Security

- **Validate manifest** structure and URLs
- **Use HTTPS** for all remote URLs
- **Implement CSP** (Content Security Policy)
- **Sign manifests** in production for integrity verification
- **Rate limit** manifest endpoint to prevent abuse
