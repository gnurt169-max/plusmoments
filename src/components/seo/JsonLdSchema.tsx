import React from 'react';

// =========================================================================
// TYPES & COMPUTATION FOR REAL REVIEWS & AGGREGATE RATINGS
// =========================================================================
export interface ReviewSchemaItem {
  authorName: string;
  rating: number;
  reviewBody?: string | null;
  datePublished?: string;
}

export interface AggregateRatingSchema {
  ratingValue: string;
  reviewCount: string | number;
  bestRating?: string;
  worstRating?: string;
}

/**
 * Calculates dynamic aggregateRating and review schema items from real studio testimonials
 */
export function computeReviewStats(
  testimonials?: Array<{
    coupleNames?: string | null;
    authorName?: string | null;
    quote?: string | null;
    content?: string | null;
    reviewContent?: string | null;
    rating?: number | null;
    createdAt?: Date | string | null;
  }> | null
): {
  aggregateRating?: AggregateRatingSchema;
  reviews?: ReviewSchemaItem[];
} {
  if (!testimonials || !Array.isArray(testimonials) || testimonials.length === 0) {
    return {};
  }

  const validReviews = testimonials.filter(
    (t) => t && ((t.coupleNames && t.coupleNames.trim()) || (t.authorName && t.authorName.trim()))
  );
  if (validReviews.length === 0) {
    return {};
  }

  const totalRating = validReviews.reduce((sum, item) => sum + (Number(item.rating) || 5), 0);
  const avg = (totalRating / validReviews.length).toFixed(1);

  const aggregateRating: AggregateRatingSchema = {
    ratingValue: avg,
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(validReviews.length),
  };

  const reviews: ReviewSchemaItem[] = validReviews.slice(0, 5).map((rev) => {
    let datePublished: string | undefined;
    if (rev.createdAt) {
      try {
        const d = rev.createdAt instanceof Date ? rev.createdAt : new Date(rev.createdAt);
        if (!isNaN(d.getTime())) {
          datePublished = d.toISOString().split('T')[0];
        }
      } catch {
        // ignore invalid date
      }
    }

    const reviewBody =
      rev.content?.trim() ||
      rev.quote?.trim() ||
      rev.reviewContent?.trim() ||
      'Dịch vụ chụp ảnh cưới chuyên nghiệp và tận tâm tại PlusMoments Studio.';

    return {
      authorName: (rev.coupleNames || rev.authorName || 'Khách hàng PlusMoments').trim(),
      datePublished,
      reviewBody,
      rating: Number(rev.rating) || 5,
    };
  });

  return {
    aggregateRating,
    reviews,
  };
}

// =========================================================================
// 1. ROOT WEBSITE & BRIDAL SHOP (LOCAL BUSINESS + ORGANIZATION + WEBSITE)
// =========================================================================
export interface RootWebsiteSchemaProps {
  name: string;
  description?: string;
  url: string;
  logo: string;
  image: string;
  telephone: string;
  email?: string;
  address?: string;
  priceRange?: string;
  latitude?: number;
  longitude?: number;
  sameAs?: string[];
  aggregateRating?: AggregateRatingSchema;
  reviews?: ReviewSchemaItem[];
}

export function RootWebsiteJsonLd({
  name,
  description,
  url,
  logo,
  image,
  telephone,
  email,
  address,
  priceRange = '6.000.000đ - 25.000.000đ',
  latitude = 10.7769,
  longitude = 106.7009,
  sameAs = [
    'https://www.facebook.com/plusmoments',
    'https://www.instagram.com/plusmoments',
    'https://www.tiktok.com/@plusmoments.vn',
  ],
  aggregateRating,
  reviews,
}: RootWebsiteSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LocalBusiness', 'PhotographyBusiness', 'BridalShop'],
        '@id': `${url}/#organization`,
        name,
        ...(description ? { description } : {}),
        url,
        logo,
        image,
        telephone,
        ...(email ? { email } : {}),
        priceRange,
        address: {
          '@type': 'PostalAddress',
          streetAddress: address || '31 Hùng Vương, Phường An Đông',
          addressLocality: 'Hồ Chí Minh',
          addressRegion: 'TP.HCM',
          addressCountry: 'VN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude,
          longitude,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: [
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday',
            ],
            opens: '08:30',
            closes: '21:30',
          },
        ],
        sameAs,
        ...(aggregateRating ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: aggregateRating.ratingValue,
            bestRating: aggregateRating.bestRating || '5',
            worstRating: aggregateRating.worstRating || '1',
            reviewCount: String(aggregateRating.reviewCount),
          },
        } : {}),
        ...(reviews && reviews.length > 0 ? {
          review: reviews.slice(0, 5).map((rev) => ({
            '@type': 'Review',
            author: {
              '@type': 'Person',
              name: rev.authorName || 'Khách hàng PlusMoments',
            },
            ...(rev.datePublished ? { datePublished: rev.datePublished } : {}),
            reviewBody: rev.reviewBody || 'Dịch vụ chụp ảnh cưới chuyên nghiệp và tận tâm tại PlusMoments Studio.',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: String(rev.rating || 5),
              bestRating: '5',
              worstRating: '1',
            },
          })),
        } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: `${name} Luxury Wedding`,
        publisher: { '@id': `${url}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// =========================================================================
// 2. BREADCRUMB SCHEMA (BreadcrumbList)
// =========================================================================
export interface BreadcrumbItem {
  name: string;
  item: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// =========================================================================
// 3. IMAGE GALLERY SCHEMA (ImageGallery)
// =========================================================================
export interface ImageGallerySchemaProps {
  name: string;
  description: string;
  url: string;
  images: {
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  }[];
}

export function ImageGalleryJsonLd({
  name,
  description,
  url,
  images,
}: ImageGallerySchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name,
    description,
    url,
    image: images.map((img) => img.url),
    associatedMedia: images.map((img) => ({
      '@type': 'ImageObject',
      contentUrl: img.url,
      caption: img.caption || name,
      width: img.width || 1600,
      height: img.height || 1067,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// =========================================================================
// HELPER: Convert relative or protocol-relative image URLs to absolute HTTPS
// =========================================================================
export function toAbsoluteImageUrl(
  url: string | undefined | null,
  baseUrl: string = 'https://plusmoments.vn'
): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    const cleanBase = baseUrl.replace(/\/+$/, '');
    return `${cleanBase}/og-image.jpg`;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Chuẩn hóa danh sách URL ảnh tuyệt đối cho Product JSON-LD schema theo chuẩn Google Search Console Merchant Listings.
 * Bảo đảm 100% đối tượng Product có ít nhất 1 URL HTTPS tuyệt đối (không bao giờ null, chuỗi rỗng hay đường dẫn tương đối).
 */
export function getValidProductImages(
  pkg: {
    coverImage?: string | null;
    demoImages?: string[] | string | null;
    image?: string | string[] | null;
  },
  siteLogoOrBanner?: string | null,
  baseUrl: string = 'https://plusmoments.vn'
): string[] {
  let parsedDemo: string[] = [];
  if (Array.isArray(pkg.demoImages)) {
    parsedDemo = pkg.demoImages.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
  } else if (typeof pkg.demoImages === 'string' && pkg.demoImages.trim()) {
    try {
      const parsed = JSON.parse(pkg.demoImages);
      if (Array.isArray(parsed)) {
        parsedDemo = parsed.filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 0
        );
      }
    } catch {
      // ignore
    }
  }

  let pkgImages: string[] = [];
  if (Array.isArray(pkg.image)) {
    pkgImages = pkg.image.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
  } else if (typeof pkg.image === 'string' && pkg.image.trim()) {
    pkgImages = [pkg.image.trim()];
  }

  const primaryCandidates = [
    pkg.coverImage,
    ...pkgImages,
    ...parsedDemo,
  ].filter((url): url is string => typeof url === 'string' && url.trim().length > 0);

  const fallbackCandidates = [
    siteLogoOrBanner,
    '/og-image.jpg',
  ].filter((url): url is string => typeof url === 'string' && url.trim().length > 0);

  const candidates = primaryCandidates.length > 0 ? primaryCandidates : fallbackCandidates;

  const cleanBase = (baseUrl || 'https://plusmoments.vn').replace(/\/+$/, '');
  const absoluteUrls = candidates.map((url) => {
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `${cleanBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  });

  const uniqueUrls = Array.from(new Set(absoluteUrls));
  return uniqueUrls.length > 0 ? uniqueUrls : [`${cleanBase}/og-image.jpg`];
}

// =========================================================================
// 4. PRICING PACKAGES SCHEMA (ItemList of Products / Services)
// =========================================================================
export interface PricingPackagesSchemaProps {
  packages: {
    name: string;
    description?: string;
    price: number | string;
    url: string;
    slug?: string;
    sku?: string;
    image?: string | string[] | null;
    coverImage?: string | null;
    demoImages?: string[] | string | null;
    brand?: string;
    aggregateRating?: AggregateRatingSchema;
    reviews?: ReviewSchemaItem[];
  }[];
  aggregateRating?: AggregateRatingSchema;
  reviews?: ReviewSchemaItem[];
  baseUrl?: string;
  siteLogoOrBanner?: string | null;
}

export function PricingPackagesJsonLd({
  packages,
  aggregateRating,
  reviews,
  baseUrl = 'https://plusmoments.vn',
  siteLogoOrBanner,
}: PricingPackagesSchemaProps) {
  const cleanBase = (baseUrl || 'https://plusmoments.vn').replace(/\/+$/, '');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bảng Giá Dịch Vụ Cưới Trọn Gói - PlusMoments Studio',
    description: 'Báo giá minh bạch các gói chụp ảnh cưới, phóng sự cưới và studio concept cao cấp',
    numberOfItems: packages.length,
    itemListElement: packages.map((pkg, index) => {
      const cleanPrice = pkg.price.toString().replace(/[^0-9]/g, '');
      const itemUrl = pkg.url.startsWith('http://') || pkg.url.startsWith('https://')
        ? pkg.url
        : `${cleanBase}${pkg.url.startsWith('/') ? pkg.url : `/${pkg.url}`}`;

      const absoluteImages = getValidProductImages(
        {
          coverImage: pkg.coverImage,
          demoImages: pkg.demoImages,
          image: pkg.image,
        },
        siteLogoOrBanner,
        cleanBase
      );

      const description =
        pkg.description && pkg.description.trim()
          ? pkg.description.trim()
          : `Gói dịch vụ chụp ảnh cưới cao cấp ${pkg.name} trọn gói tại PlusMoments Studio.`;

      const pkgAggregateRating = pkg.aggregateRating || aggregateRating;
      const pkgReviews = pkg.reviews || reviews;

      const generatedSku =
        pkg.sku ||
        (pkg.slug
          ? `pm-pkg-${pkg.slug}`
          : `pm-pkg-${pkg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || String(index + 1)}`);

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: pkg.name,
          description,
          url: itemUrl,
          image: absoluteImages,
          sku: generatedSku,
          brand: {
            '@type': 'Brand',
            name: pkg.brand || 'PlusMoments',
          },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'VND',
            price: cleanPrice || pkg.price.toString(),
            priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
            availability: 'https://schema.org/InStock',
            url: itemUrl,
            itemCondition: 'https://schema.org/NewCondition',
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'VN',
              returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
              merchantReturnDays: 0,
            },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: '0',
                currency: 'VND',
              },
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: 'VN',
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 1,
                  unitCode: 'DAY',
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 0,
                  unitCode: 'DAY',
                },
              },
            },
          },
          ...(pkgAggregateRating ? {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: pkgAggregateRating.ratingValue,
              bestRating: pkgAggregateRating.bestRating || '5',
              worstRating: pkgAggregateRating.worstRating || '1',
              reviewCount: String(pkgAggregateRating.reviewCount),
            },
          } : {}),
          ...(pkgReviews && pkgReviews.length > 0 ? {
            review: pkgReviews.slice(0, 5).map((rev) => ({
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: rev.authorName || 'Khách hàng PlusMoments',
              },
              ...(rev.datePublished ? { datePublished: rev.datePublished } : {}),
              reviewBody: rev.reviewBody || 'Dịch vụ chụp ảnh cưới chuyên nghiệp và tận tâm tại PlusMoments Studio.',
              reviewRating: {
                '@type': 'Rating',
                ratingValue: String(rev.rating || 5),
                bestRating: '5',
                worstRating: '1',
              },
            })),
          } : {}),
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// =========================================================================
// 5. FAQ SCHEMA (FAQPage)
// =========================================================================
export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// =========================================================================
// BACKWARD COMPATIBILITY EXPORT
// =========================================================================
export interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  url: string;
  logo: string;
  image: string;
  telephone: string;
  email: string;
  address: string;
  priceRange?: string;
}

export function LocalBusinessJsonLd(props: LocalBusinessSchemaProps) {
  return <RootWebsiteJsonLd {...props} />;
}
