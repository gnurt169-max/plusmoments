'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * ContentProtection: Comprehensive Image & Copyright Defense
 *
 * Capabilities:
 * 1. Blocks right-click context menu on images and public content
 * 2. Prevents image dragging and extraction
 * 3. Intercepts common asset scraper shortcuts (Cmd/Ctrl + S, Cmd/Ctrl + U)
 * 4. Displays an elegant luxury copyright toast notification when unauthorized action is attempted
 */
export function ContentProtection() {
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showCopyrightWarning = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  }, []);

  useEffect(() => {
    // Safety check: Never block in Admin CMS
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
      return;
    }

    // 1. Right-click context menu interceptor
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showCopyrightWarning();
    };

    // 2. Drag & drop prevention for images
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'IMG' ||
        target?.closest('img') ||
        target?.closest('[data-protected-image]')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showCopyrightWarning();
      }
    };

    // 3. Asset-saving & Developer tools shortcuts interceptor (Only on public layout)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Safety check: Never block shortcuts in Admin CMS
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        return;
      }

      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const keyUpper = e.key ? e.key.toUpperCase() : '';

      // 3.1. Block F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showCopyrightWarning();
        return;
      }

      // 3.2. Block Ctrl + Shift + I / Cmd + Option + I (Inspect)
      if (
        (cmdOrCtrl && e.shiftKey && keyUpper === 'I') ||
        (e.metaKey && e.altKey && keyUpper === 'I')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showCopyrightWarning();
        return;
      }

      // 3.3. Block Ctrl + Shift + C / Cmd + Option + C (Inspect Element)
      if (
        (cmdOrCtrl && e.shiftKey && keyUpper === 'C') ||
        (e.metaKey && e.altKey && keyUpper === 'C')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showCopyrightWarning();
        return;
      }

      // 3.4. Block Ctrl + Shift + J / Cmd + Option + J (Console)
      if (
        (cmdOrCtrl && e.shiftKey && keyUpper === 'J') ||
        (e.metaKey && e.altKey && keyUpper === 'J')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showCopyrightWarning();
        return;
      }

      // 3.5. Block Ctrl + U / Cmd + Option + U (View Source)
      if (
        (cmdOrCtrl && keyUpper === 'U') ||
        (e.metaKey && e.altKey && keyUpper === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        showCopyrightWarning();
        return;
      }

      // 3.6. Block Ctrl + S / Cmd + S (Save page)
      if (cmdOrCtrl && keyUpper === 'S') {
        e.preventDefault();
        e.stopPropagation();
        showCopyrightWarning();
        return;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('dragstart', handleDragStart, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [showCopyrightWarning]);

  if (!toastVisible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-stone-900/90 text-stone-100 backdrop-blur-md rounded-full shadow-2xl border border-amber-500/30 text-xs font-sans">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-light tracking-wide">
          <strong className="font-medium text-amber-200">Bản Quyền Tác Phẩm:</strong> Hình ảnh thuộc bản quyền PlusMoments Studio. Vui lòng không sao chép.
        </span>
      </div>
    </div>
  );
}

export default ContentProtection;

