'use client';

import { useEffect } from 'react';

export function TrustedTypesInit() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'trustedTypes' in window && (window as any).trustedTypes) {
      try {
        const tt = (window as any).trustedTypes;
        if (!tt.defaultPolicy) {
          tt.createPolicy('default', {
            createHTML: (string: string) => string,
            createScript: (string: string) => string,
            createScriptURL: (string: string) => string,
          });
        }
      } catch {
        // Policy đã tồn tại hoặc không cần tạo lại
      }
    }
  }, []);

  return null;
}

export default TrustedTypesInit;

