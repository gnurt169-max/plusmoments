if (typeof window !== 'undefined' && 'trustedTypes' in window && window.trustedTypes) {
  if (!window.trustedTypes.defaultPolicy) {
    try {
      window.trustedTypes.createPolicy('default', {
        createHTML: (s: string) => s,
        createScript: (s: string) => s,
        createScriptURL: (s: string) => s,
      });
    } catch {
      // Policy đã tồn tại
    }
  }
}

export {};

