// Global types for Module Federation
declare const __webpack_share_scopes__: {
  default: unknown;
};

declare global {
  interface Window {
    [key: string]: {
      init: (shareScope: unknown) => Promise<void>;
      get: (module: string) => Promise<() => { default: React.ComponentType }>;
    };
  }
}

export {};
