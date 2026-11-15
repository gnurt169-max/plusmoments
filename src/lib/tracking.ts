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
  fbclid?: string;
  landingPageUrl?: string;
}

const STORAGE_KEY = 'pm_traffic_source';
const FIRED_EVENTS_KEY = 'pm_fired_conversions';

/**
 * Normalizes Vietnamese phone number into standard international E.164 (+84...) format for Enhanced Conversions
 */
function formatE164Phone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+84')) return digits;
  if (digits.startsWith('84')) return `+${digits}`;
  if (digits.startsWith('0')) return `+84${digits.slice(1)}`;
  return digits.length >= 9 ? `+84${digits}` : undefined;
}

/**
 * Automatically captures and persists UTM tags, Google Click ID (gclid), and Facebook Click ID (fbclid).
 * Stored in both sessionStorage and localStorage so parameters survive multi-page browsing and returning visits.
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
      fbclid: '',
      landingPageUrl: '',
    };
  }

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid') || '';
    const fbclid = urlParams.get('fbclid') || '';
    const rawUtmSource = urlParams.get('utm_source') || '';

    // Smart source deduction if user arrives directly from an ad without explicit utm_source
    const utmSource = rawUtmSource || (gclid ? 'google_ads' : fbclid ? 'facebook_ads' : '');
    const utmMedium = urlParams.get('utm_medium') || (gclid || fbclid ? 'cpc' : '');
    const utmCampaign = urlParams.get('utm_campaign') || '';
    const utmTerm = urlParams.get('utm_term') || '';
    const utmContent = urlParams.get('utm_content') || '';
    const currentUrl = window.location.href.split('#')[0];

    // If current URL contains marketing parameters or click IDs, save them
    if (gclid || fbclid || utmSource || utmCampaign) {
      const data: TrafficSourceData = {
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
        gclid,
        fbclid,
        landingPageUrl: currentUrl,
      };
      const json = JSON.stringify(data);
      sessionStorage.setItem(STORAGE_KEY, json);
      try {
        localStorage.setItem(STORAGE_KEY, json);
      } catch {}
      return data;
    }

    // Otherwise, retrieve previously stored parameters from this session or local storage
    const storedSession = sessionStorage.getItem(STORAGE_KEY);
    if (storedSession) {
      return JSON.parse(storedSession);
    }
    const storedLocal = localStorage.getItem(STORAGE_KEY);
    if (storedLocal) {
      sessionStorage.setItem(STORAGE_KEY, storedLocal);
      return JSON.parse(storedLocal);
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
    fbclid: '',
    landingPageUrl: '',
  };
}

/**
 * Retrieves the stored traffic source for form submission.
 */
export function getStoredTrafficSource(): TrafficSourceData {
  return captureAndStoreTrafficSource();
}

/**
 * Deduplication helper to prevent repeat conversion firing on page reload (F5)
 */
function isEventAlreadyFired(uniqueKey: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = sessionStorage.getItem(FIRED_EVENTS_KEY);
    const fired = raw ? JSON.parse(raw) : [];
    if (Array.isArray(fired) && fired.includes(uniqueKey)) {
      return true;
    }
    fired.push(uniqueKey);
    sessionStorage.setItem(FIRED_EVENTS_KEY, JSON.stringify(fired));
  } catch {}
  return false;
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

    // 3. Facebook Meta Pixel Custom Event
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
 * 1. ViewContent / view_item: When client views package details in PackageDetailModal
 */
export function trackPackageView(packageData: {
  id: string;
  name: string;
  price?: number | string | null;
  category?: string | null;
}) {
  if (typeof window === 'undefined') return;
  const value = Number(packageData.price) || 0;

  // GTM / GA4 view_item event
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'VND',
        value,
        items: [
          {
            item_id: packageData.id,
            item_name: packageData.name,
            item_category: packageData.category || 'Wedding Package',
            price: value,
            quantity: 1,
          },
        ],
      },
    });
  }

  // Google gtag
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'VND',
      value,
      items: [
        {
          item_id: packageData.id,
          item_name: packageData.name,
          item_category: packageData.category || 'Wedding Package',
          price: value,
        },
      ],
    });
  }

  // Meta Pixel ViewContent Standard Event
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'ViewContent', {
      content_name: packageData.name,
      content_ids: [packageData.id],
      content_type: 'product',
      value,
      currency: 'VND',
    });
  }

  // TikTok Pixel ViewContent
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('ViewContent', {
      content_name: packageData.name,
      content_id: packageData.id,
      value,
      currency: 'VND',
    });
  }
}

/**
 * 2. High-intent micro-conversions: Contact Clicks (Hotline, Zalo, Messenger)
 * Fires standard Meta 'Contact' event and Google Ads phone/chat conversion label
 */
export function trackHotlineClick(
  phoneNumber: string,
  location = 'floating_bar',
  googleAdsConversionLabel?: string | null
) {
  // GTM / General event
  trackEvent('click_hotline', {
    phone: phoneNumber,
    source_location: location,
    contact_method: 'hotline',
  });

  // Google gtag contact event
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'contact', {
      method: 'hotline',
      phone_number: phoneNumber,
      source_location: location,
      value: 200000,
      currency: 'VND',
    });
  }

  // Meta Pixel Standard 'Contact' Event
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Contact', {
      content_name: 'Hotline Call',
      content_category: 'hotline',
      source_location: location,
      value: 200000,
      currency: 'VND',
    });
  }

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
    contact_method: 'zalo',
  });

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'contact', {
      method: 'zalo',
      source_location: location,
      value: 200000,
      currency: 'VND',
    });
  }

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Contact', {
      content_name: 'Chat Zalo',
      content_category: 'zalo',
      source_location: location,
      value: 200000,
      currency: 'VND',
    });
  }

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
    contact_method: 'messenger',
  });

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'contact', {
      method: 'messenger',
      source_location: location,
      value: 200000,
      currency: 'VND',
    });
  }

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Contact', {
      content_name: 'Chat Messenger',
      content_category: 'messenger',
      source_location: location,
      value: 200000,
      currency: 'VND',
    });
  }

  if (googleAdsConversionLabel && googleAdsConversionLabel.trim()) {
    trackGoogleAdsConversion(googleAdsConversionLabel.trim(), 200000);
  }
}

/**
 * 3. Lead / generate_lead: Form consultation submission with Enhanced Conversions
 */
export function trackConsultationSubmit(details: {
  leadId?: string;
  fullName: string;
  phone?: string;
  email?: string;
  package?: string;
  googleAdsConversionLabel?: string | null;
  conversionValue?: number;
}) {
  if (details.leadId && isEventAlreadyFired(`lead_${details.leadId}`)) {
    return; // Prevent duplicate firing
  }

  const val = details.conversionValue || 500000;
  const e164Phone = formatE164Phone(details.phone);
  const cleanEmail = details.email ? details.email.trim().toLowerCase() : undefined;

  // Google Ads Enhanced Conversions User Data
  if (typeof window !== 'undefined' && typeof window.gtag === 'function' && (cleanEmail || e164Phone)) {
    try {
      window.gtag('set', 'user_data', {
        email: cleanEmail,
        phone_number: e164Phone,
        address: {
          first_name: details.fullName.trim(),
        },
      });
    } catch {}
  }

  trackEvent('conversion_consultation_submit', {
    lead_id: details.leadId,
    client_name: details.fullName,
    package_interest: details.package || 'general',
  });

  // Google Analytics 4 (GA4) & GTM Lead Event
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        value: val,
        currency: 'VND',
        transaction_id: details.leadId,
        package: details.package,
      });
    }
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'generate_lead',
        value: val,
        currency: 'VND',
        transaction_id: details.leadId,
        package: details.package,
      });
    }
  }

  // Google Ads Direct Conversion
  if (details.googleAdsConversionLabel && details.googleAdsConversionLabel.trim()) {
    trackGoogleAdsConversion(
      details.googleAdsConversionLabel.trim(),
      val,
      details.leadId
    );
  }

  // Standard Lead event for Meta Pixel
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'Lead', {
      content_name: details.package || 'Wedding Photography Consultation',
      value: val,
      currency: 'VND',
    });
  }

  // TikTok Pixel CompleteRegistration event
  if (typeof window !== 'undefined' && window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('CompleteRegistration', {
      content_name: details.package || 'Wedding Consultation',
      value: val,
      currency: 'VND',
    });
  }
}

/**
 * 4. InitiateCheckout / begin_checkout: When booking & opening VietQR payment
 */
export function trackBeginCheckout(packageData: {
  id: string;
  name: string;
  price: number | string;
  orderCode?: string;
}) {
  const value = Number(packageData.price) || 0;
  const traffic = getStoredTrafficSource();

  trackEvent('begin_checkout', {
    order_code: packageData.orderCode,
    package_id: packageData.id,
    package_name: packageData.name,
    value: value,
    currency: 'VND',
    ...traffic,
  });

  // Google Analytics 4 (GA4) & GTM Standard E-commerce payload
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
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
      });
    }
    if (window.dataLayer) {
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

/**
 * 5. Purchase / conversion_purchase: When VietQR payment is completed
 */
export function trackPurchase(details: {
  orderCode: string;
  packageName: string;
  amount: number;
  packageId?: string;
  googleAdsId?: string;
  googleAdsPurchaseLabel?: string;
}) {
  if (typeof window === 'undefined') return;
  if (isEventAlreadyFired(`purchase_${details.orderCode}`)) {
    return; // Deduplicate
  }

  trackEvent('conversion_purchase', {
    order_id: details.orderCode,
    value: details.amount,
    currency: 'VND',
    package: details.packageName,
  });

  // GA4 & GTM standard purchase
  if (typeof window !== 'undefined') {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: details.orderCode,
        value: details.amount,
        currency: 'VND',
        items: [
          {
            item_id: details.packageId || details.orderCode,
            item_name: details.packageName,
            price: details.amount,
            quantity: 1,
          },
        ],
      });
    }
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: details.orderCode,
          value: details.amount,
          currency: 'VND',
          items: [
            {
              item_id: details.packageId || details.orderCode,
              item_name: details.packageName,
              price: details.amount,
              quantity: 1,
            },
          ],
        },
      });
    }
  }

  // Google Ads conversion
  if (details.googleAdsId && details.googleAdsPurchaseLabel) {
    trackGoogleAdsConversion(
      details.googleAdsId,
      details.googleAdsPurchaseLabel,
      details.amount,
      'VND'
    );
  }

  // Meta Pixel Purchase Standard Event
  if (typeof window.fbq === 'function') {
    window.fbq('track', 'Purchase', {
      content_name: details.packageName,
      content_ids: [details.packageId || details.orderCode],
      value: details.amount,
      currency: 'VND',
      num_items: 1,
    });
  }

  // TikTok Pixel CompletePayment
  if (window.ttq && typeof window.ttq.track === 'function') {
    window.ttq.track('CompletePayment', {
      content_name: details.packageName,
      content_id: details.packageId || details.orderCode,
      value: details.amount,
      currency: 'VND',
    });
  }
}
