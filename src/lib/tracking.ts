'use client';

// Declare global tracking interfaces for TypeScript
declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: any;
  }
}

export interface TrafficSourceData {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  gclid: string;
}

const STORAGE_KEY = 'pm_traffic_source';

/**
 * Automatically captures and persists UTM tags and Google Click ID (gclid) from URL.
 * Stored in sessionStorage so parameters survive multi-page browsing during the visit.
 */
export function captureAndStoreTrafficSource(): TrafficSourceData {
  if (typeof window === 'undefined') {
    return {
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
      utmTerm: '',
      utmContent: '',
      gclid: '',
    };
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid') || '';
    const utmSource = urlParams.get('utm_source') || (gclid ? 'google_ads' : '');
    const utmMedium = urlParams.get('utm_medium') || (gclid ? 'cpc' : '');
    const utmCampaign = urlParams.get('utm_campaign') || '';
    const utmTerm = urlParams.get('utm_term') || '';
    const utmContent = urlParams.get('utm_content') || '';

    // If current URL contains marketing parameters, save or update
    if (gclid || utmSource || utmCampaign) {
      const data: TrafficSourceData = {
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        gclid,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }

    // Otherwise, retrieve previously stored parameters from this session
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Graceful fallback for private/incognito restrictions
  }

  return {
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmTerm: '',
    utmContent: '',
    gclid: '',
  };
}

/**
 * Retrieves the stored traffic source for form submission.
 */
export function getStoredTrafficSource(): TrafficSourceData {
  return captureAndStoreTrafficSource();
}

/**
 * Dispatches custom events to Google Tag Manager, Google Analytics, Google Ads, Meta Pixel, and TikTok Pixel.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  try {
    // 1. Google Tag Manager Data Layer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }

    // 2. Google Ads / gtag.js standard event
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    // 3. Facebook Meta Pixel
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, params);
    }

    // 4. TikTok Pixel
    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track(eventName, params);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[PlusMoments Analytics] Event fired: "${eventName}"`, params);
    }
  } catch (err) {
    console.warn('[PlusMoments Analytics] Track error:', err);
  }
}

/**
 * Directly fires a Google Ads Conversion action via gtag.js
 * Supports either:
 * - trackGoogleAdsConversion("AW-XXXXX", "LabelXXXX", 500000, "VND")
 * - trackGoogleAdsConversion("AW-XXXXX/LabelXXXX", 500000, "txn_123")
 */
export function trackGoogleAdsConversion(
  conversionIdOrSendTo: string,
  labelOrValue?: string | number,
  valueOrTxId: number | string = 0,
  currencyOrTxId = 'VND'
) {
  if (typeof window === 'undefined' || !conversionIdOrSendTo || !conversionIdOrSendTo.trim()) return;

  let sendTo = conversionIdOrSendTo.trim();
  let value = 0;
  let currency = 'VND';
  let transactionId = '';

  if (typeof labelOrValue === 'string' && labelOrValue.trim() && !sendTo.includes('/')) {
    sendTo = `${sendTo}/${labelOrValue.trim()}`;
    value = typeof valueOrTxId === 'number' ? valueOrTxId : Number(valueOrTxId) || 0;
    currency = String(currencyOrTxId || 'VND');
  } else {
    value = typeof labelOrValue === 'number' ? labelOrValue : Number(valueOrTxId) || 0;
    transactionId = typeof valueOrTxId === 'string' ? valueOrTxId : '';
  }

  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'conversion', {
        send_to: sendTo,
        value: value,
        currency: currency,
        transaction_id: transactionId || undefined,
      });
      console.log(`[TRACKING] Google Ads conversion sent: ${sendTo} (value: ${value} ${currency})`);
    }
  } catch (err) {
    console.warn('[Google Ads Conversion Error]:', err);
  }
}

/**
 * High-intent micro-conversions
 */
export function trackHotlineClick(
  phoneNumber: string,
  location = 'floating_bar',
  googleAdsConversionLabel?: string | null
) {
  trackEvent('click_hotline', {
    phone: phoneNumber,
    source_location: location,
  });

  if (googleAdsConversionLabel && googleAdsConversionLabel.trim()) {
    trackGoogleAdsConversion(googleAdsConversionLabel.trim(), 200000);
  }
}

export function trackZaloClick(
  zaloNumber: string,
  location = 'floating_bar',
  googleAdsConversionLabel?: string | null
) {
  trackEvent('click_zalo', {
    zalo: zaloNumber,
    source_location: location,
  });

  if (googleAdsConversionLabel && googleAdsConversionLabel.trim()) {
    trackGoogleAdsConversion(googleAdsConversionLabel.trim(), 200000);
  }
}

export function trackMessengerClick(
  location = 'floating_bar',
  googleAdsConversionLabel?: string | null
) {
  trackEvent('click_messenger', {
    source_location: location,
  });

  if (googleAdsConversionLabel && googleAdsConversionLabel.trim()) {
    trackGoogleAdsConversion(googleAdsConversionLabel.trim(), 200000);
  }
}

export function trackConsultationSubmit(details: {
  leadId?: string;
  fullName: string;
  package?: string;
  googleAdsConversionLabel?: string | null;
  conversionValue?: number;
}) {
  trackEvent('conversion_consultation_submit', {
    lead_id: details.leadId,
    client_name: details.fullName,
    package_interest: details.package || 'general',
  });

  // Google Tag Manager / GA4 Lead Event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'generate_lead',
      value: details.conversionValue || 500000,
      currency: 'VND',
      transaction_id: details.leadId,
      package: details.package,
    });
  }

  // Google Ads Direct Conversion
  if (details.googleAdsConversionLabel && details.googleAdsConversionLabel.trim()) {
    trackGoogleAdsConversion(
      details.googleAdsConversionLabel.trim(),
      details.conversionValue || 500000,
      details.leadId
    );
  }

  // Standard Lead event for Meta Pixel
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: details.package || 'Wedding Photography Consultation',
      value: details.conversionValue || 500000,
      currency: 'VND',
    });
  }

  // TikTok Pixel CompleteRegistration event
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('CompleteRegistration', {
      content_name: details.package || 'Wedding Consultation',
      value: details.conversionValue || 500000,
      currency: 'VND',
    });
  }
}

/**
 * E-commerce / Google Ads / GA4 begin_checkout tracking action
 */
export function trackBeginCheckout(packageData: {
  id: string;
  name: string;
  price: number | string;
  orderCode?: string;
}) {
  const value = Number(packageData.price) || 0;

  trackEvent('begin_checkout', {
    order_code: packageData.orderCode,
    package_id: packageData.id,
    package_name: packageData.name,
    value: value,
    currency: 'VND',
  });

  // Google Tag Manager / GA4 Standard E-commerce payload
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'VND',
        value: value,
        transaction_id: packageData.orderCode,
        items: [
          {
            item_id: packageData.id,
            item_name: packageData.name,
            price: value,
            quantity: 1,
          },
        ],
      },
    });
  }

  // Meta Pixel InitiateCheckout
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'InitiateCheckout', {
      content_name: packageData.name,
      content_ids: [packageData.id],
      value: value,
      currency: 'VND',
      num_items: 1,
    });
  }

  // TikTok Pixel InitiateCheckout
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('InitiateCheckout', {
      content_name: packageData.name,
      content_id: packageData.id,
      value: value,
      currency: 'VND',
      quantity: 1,
    });
  }
}
