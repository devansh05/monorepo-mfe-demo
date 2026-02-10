// Global types for Module Federation Runtime API
declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: {
  default: unknown;
};

declare const __webpack_require__: {
  l: (url: string, done: (event?: Event) => void, chunkId?: string) => void;
  container?: ModuleFederationContainer;
};

// Container interface for remote modules
interface Container {
  init(shareScope: unknown): Promise<void>;
  get(module: string): Promise<() => { default: React.ComponentType }>;
}

// Module Federation Runtime Container API
interface ModuleFederationContainer {
  init(remotes: Record<string, string>): void;
  setRemoteDefinitions(remotes: Record<string, string>): void;
}

// Extend window to include remote containers
declare global {
  interface Window {
    [key: string]: Container | ModuleFederationContainer | undefined;
  }
}

export {};
