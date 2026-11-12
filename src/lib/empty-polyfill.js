// Modern browsers natively support ES2022+ Baseline features (Array.at, Object.hasOwn, etc.)
// Register Trusted Types 'default' policy synchronously before any client chunk executes
if (typeof window !== 'undefined' && 'trustedTypes' in window && window.trustedTypes) {
  if (!window.trustedTypes.defaultPolicy) {
    try {
      window.trustedTypes.createPolicy('default', {
        createHTML: (s) => s,
        createScript: (s) => s,
        createScriptURL: (s) => s,
      });
    } catch {
      // Policy already exists
    }
  }
}

export {};

