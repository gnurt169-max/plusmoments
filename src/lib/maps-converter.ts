/**
 * Smart Google Maps URL Auto-Converter
 * Automatically parses any user-provided Google Maps input (iframe embed code,
 * mobile share link maps.app.goo.gl, desktop place link, or text address)
 * into both an iframe embed URL and a direct share / navigation URL.
 */

export interface GoogleMapsResolved {
  embedUrl: string;
  shareUrl: string;
}

export function resolveGoogleMapsUrl(
  inputUrl?: string | null,
  fallbackAddress?: string | null
): GoogleMapsResolved {
  const cleanInput = (inputUrl || '').trim();

  // 1. If user pasted a full <iframe> snippet, extract src="..."
  const iframeMatch = cleanInput.match(/src=["'](.*?)["']/i);
  let rawUrl = (iframeMatch ? iframeMatch[1] : cleanInput).trim();

  // If input is empty
  if (!rawUrl) {
    if (fallbackAddress && fallbackAddress.trim()) {
      const encoded = encodeURIComponent(fallbackAddress.trim());
      return {
        embedUrl: `https://www.google.com/maps?q=${encoded}&output=embed`,
        shareUrl: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
      };
    }
    return { embedUrl: '', shareUrl: '' };
  }

  // 2. If user typed plain address text without protocol
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    // If it looks like a domain without scheme (e.g. maps.app.goo.gl/xyz or google.com/maps/...)
    if (rawUrl.includes('google.com') || rawUrl.includes('goo.gl')) {
      rawUrl = `https://${rawUrl}`;
    } else {
      // Plain text address
      const encoded = encodeURIComponent(rawUrl);
      return {
        embedUrl: `https://www.google.com/maps?q=${encoded}&output=embed`,
        shareUrl: `https://www.google.com/maps/dir/?api=1&destination=${encoded}`,
      };
    }
  }

  // 3. If already a standard Google Maps Embed URL (/maps/embed)
  if (rawUrl.includes('/maps/embed')) {
    return {
      embedUrl: rawUrl,
      shareUrl: rawUrl.replace('/maps/embed', '/maps'),
    };
  }

  // 4. If it contains a place path: /maps/place/LOCATION_NAME
  const placeMatch = rawUrl.match(/\/place\/([^/@?]+)/);
  if (placeMatch && placeMatch[1]) {
    const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return {
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`,
      shareUrl: rawUrl,
    };
  }

  // 5. If it contains a search query parameter ?q=LOCATION
  const qMatch = rawUrl.match(/[?&]q=([^&]+)/);
  if (qMatch && qMatch[1]) {
    const qVal = decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
    return {
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(qVal)}&output=embed`,
      shareUrl: rawUrl,
    };
  }

  // 6. If it's a mobile shortened link (maps.app.goo.gl or goo.gl/maps)
  // Shortened URLs cannot be embedded directly in an iframe due to X-Frame-Options: SAMEORIGIN.
  // We use fallbackAddress (or search query) for the iframe embed, and the short link for direct share!
  if (rawUrl.includes('goo.gl') || rawUrl.includes('maps.app.goo.gl')) {
    const embedQuery = fallbackAddress && fallbackAddress.trim()
      ? fallbackAddress.trim()
      : rawUrl;
    return {
      embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(embedQuery)}&output=embed`,
      shareUrl: rawUrl,
    };
  }

  // 7. Generic fallback for any other Google Maps link
  const embedTarget = fallbackAddress && fallbackAddress.trim()
    ? fallbackAddress.trim()
    : rawUrl;
  return {
    embedUrl: `https://www.google.com/maps?q=${encodeURIComponent(embedTarget)}&output=embed`,
    shareUrl: rawUrl,
  };
}

