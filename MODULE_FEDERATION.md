# Module Federation Setup

This microfrontend application uses Webpack Module Federation to dynamically load remote applications.

## Architecture

- **Container App** (Port 3000): Host application that loads remote microfrontends
- **Absence Management** (Port 3001): Remote app for managing absences
- **User Profile** (Port 3002): Remote app for user profile

## Running the Applications

### Option 1: Run all apps individually

Open 3 separate terminal windows and run:

```bash
# Terminal 1 - Absence Management (Remote)
npm run start --workspace=absence-management

# Terminal 2 - User Profile (Remote)
npm run start --workspace=user-profile

# Terminal 3 - Container (Host)
npm run start --workspace=container
```

### Option 2: Using npm-run-all (recommended)

Install npm-run-all globally or as a dev dependency:

```bash
npm install --save-dev npm-run-all
```

Add this script to the root package.json:

```json
{
  "scripts": {
    "start:all": "npm-run-all --parallel start:*",
    "start:absences": "npm run start --workspace=absence-management",
    "start:profile": "npm run start --workspace=user-profile",
    "start:container": "npm run start --workspace=container"
  }
}
```

Then run:

```bash
npm run start:all
```

## Access the Applications

- **Container (main app)**: http://localhost:3000
- **Absence Management (standalone)**: http://localhost:3001
- **User Profile (standalone)**: http://localhost:3002

## How Module Federation Works

1. **Remote Apps** expose their components via `ModuleFederationPlugin`:
   - `absences` exposes `./Module` (the App component)
   - `profile` exposes `./Module` (the App component)

2. **Container App** configures remotes to consume the exposed modules:

   ```javascript
   remotes: {
     absences: 'absences@http://localhost:3001/remoteEntry.js',
     profile: 'profile@http://localhost:3002/remoteEntry.js',
   }
   ```

3. **Dynamic Import** in the Container:
   ```tsx
   const Absences = React.lazy(() => import("absences/Module"));
   const Profile = React.lazy(() => import("profile/Module"));
   ```

## Shared Dependencies

The following dependencies are shared between container and remotes to avoid duplication:

- `react` (singleton)
- `react-dom` (singleton)
- `react-router-dom` (singleton in container)
- `@tanstack/react-query` (singleton)

## Project Structure

```
apps/
├── absence-management/
│   ├── src/
│   │   ├── index.tsx (exports Module)
│   │   └── bootstrap.tsx (standalone app entry)
│   ├── public/index.html
│   └── webpack.config.js (Module Federation config)
├── user-profile/
│   ├── src/
│   │   ├── index.tsx (exports Module)
│   │   └── bootstrap.tsx (standalone app entry)
│   ├── public/index.html
│   └── webpack.config.js (Module Federation config)
└── container/
    ├── src/
    │   ├── index.tsx (consumes remotes)
    │   ├── bootstrap.tsx (container entry)
    │   └── remotes.d.ts (TypeScript declarations)
    ├── public/index.html
    └── webpack.config.js (Module Federation config)
```

## Building for Production

```bash
# Build all apps
npm run build --workspace=absence-management
npm run build --workspace=user-profile
npm run build --workspace=container
```

The built files will be in each app's `dist/` folder.

## Troubleshooting

### Remote apps not loading

1. Ensure all remote apps are running before starting the container
2. Check CORS headers in webpack devServer config
3. Verify the remote URLs in container's webpack.config.js match the running ports

### TypeScript errors

- Type declarations for remotes are in `apps/container/src/remotes.d.ts`
- Webpack config files (`.js`) may show warnings in strict TypeScript projects - this is normal

### Shared dependencies

- If you see duplicated React instances, check the `shared` configuration in webpack.config.js
- All shared dependencies should have `singleton: true`
