'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const AlbumLeadModal = dynamic(
  () => import('./AlbumLeadModal').then((mod) => mod.AlbumLeadModal),
  { ssr: false }
);

interface AlbumLeadTriggerProps {
  slug: string;
  albumTitle: string;
  conceptName?: string | null;
  targetContentId?: string;
}

/**
 * AlbumLeadTrigger: Client coordinator for automatic 100% completion popup and FloatingStoryPill trigger.
 * - Listens for custom event 'open-album-lead-modal' dispatched by FloatingStoryPill or other CTAs.
 * - Uses IntersectionObserver on a sentinel element placed right after the gallery content or scroll calculation.
 * - Verifies sessionStorage('pm_album_popup_' + slug) before auto-triggering.
 * - Employs a 600ms natural delay once 100% completion is reached.
 */
export function AlbumLeadTrigger({
  slug,
  albumTitle,
  conceptName,
  targetContentId = 'album-gallery-content',
}: AlbumLeadTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggeredRef = useRef(false);

  // 1. Check if already shown or submitted in this session
  const isAlreadyShownInSession = () => {
    try {
      if (typeof window === 'undefined') return true;
      return Boolean(sessionStorage.getItem('pm_album_popup_' + slug));
    } catch {
      return false;
    }
  };

  const markShownInSession = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pm_album_popup_' + slug, 'shown');
      }
    } catch {
      // ignore
    }
  };

  // 2. Open via manual click or custom event (always allowed, even if dismissed previously)
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
    };

    window.addEventListener('pm-open-album-lead-modal', handleOpenModal);
    return () => {
      window.removeEventListener('pm-open-album-lead-modal', handleOpenModal);
    };
  }, []);

  // 3. Monitor Sentinel & Scroll for 100% completion
  useEffect(() => {
    if (isAlreadyShownInSession()) {
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;

    const triggerModalWithDelay = () => {
      if (triggeredRef.current || isAlreadyShownInSession()) return;
      triggeredRef.current = true;
      timeoutId = setTimeout(() => {
        if (!isAlreadyShownInSession()) {
          markShownInSession();
          setIsOpen(true);
        }
      }, 600); // 600ms natural delay
    };

    // Sentinel Intersection Observer
    const sentinelEl = document.getElementById('album-gallery-sentinel');
    let observer: IntersectionObserver | null = null;

    if (sentinelEl) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) {
            triggerModalWithDelay();
          }
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );
      observer.observe(sentinelEl);
    }

    // Secondary Scroll Listener (checking viewingProgress >= 100%)
    let ticking = false;
    const checkScrollCompletion = () => {
      if (triggeredRef.current || isAlreadyShownInSession()) return;

      const targetEl = document.getElementById(targetContentId);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        // When bottom of gallery is within upper viewport area (user scrolled past last image)
        if (rect.bottom <= window.innerHeight * 0.95) {
          triggerModalWithDelay();
        }
      }
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(checkScrollCompletion);
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [slug, targetContentId]);

  return (
    <>
      {/* Sentinel element placed right at the end of gallery */}
      <div id="album-gallery-sentinel" className="h-px w-full pointer-events-none opacity-0" aria-hidden="true" />

      {/* Luxury Lead Modal / Bottom Sheet */}
      <AlbumLeadModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        albumTitle={albumTitle}
        conceptName={conceptName}
        slug={slug}
      />
    </>
  );
}

export default AlbumLeadTrigger;
