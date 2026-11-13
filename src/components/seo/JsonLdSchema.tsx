import React from 'react';

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
// 4. PRICING PACKAGES SCHEMA (ItemList of Products / Services)
// =========================================================================
export interface PricingPackagesSchemaProps {
  packages: {
    name: string;
    description: string;
    price: number | string;
    url: string;
    image?: string;
  }[];
}

export function PricingPackagesJsonLd({ packages }: PricingPackagesSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bảng Giá Dịch Vụ Cưới Trọn Gói - PlusMoments Studio',
    description: 'Báo giá minh bạch các gói chụp ảnh cưới, phóng sự cưới và studio concept cao cấp',
    numberOfItems: packages.length,
    itemListElement: packages.map((pkg, index) => {
      const cleanPrice = pkg.price.toString().replace(/[^0-9]/g, '');
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: pkg.name,
          description: pkg.description,
          url: pkg.url,
          ...(pkg.image ? { image: pkg.image } : {}),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'VND',
            price: cleanPrice || pkg.price.toString(),
            availability: 'https://schema.org/InStock',
            url: pkg.url,
          },
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
