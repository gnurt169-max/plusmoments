import React from 'react';

interface LocalBusinessSchemaProps {
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

export function LocalBusinessJsonLd({
  name,
  description,
  url,
  logo,
  image,
  telephone,
  email,
  address,
  priceRange = '$$$',
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${url}/#studio`,
    name,
    description,
    url,
    logo,
    image,
    telephone,
    email,
    priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: 'Hồ Chí Minh',
      addressRegion: 'TP.HCM',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '10.7972',
      longitude: '106.6873',
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
        opens: '09:00',
        closes: '21:00',
      },
    ],
    sameAs: [
      'https://facebook.com/plusmoments.vn',
      'https://instagram.com/plusmoments.vn',
      'https://tiktok.com/@plusmoments.vn',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface ImageGallerySchemaProps {
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

interface PricingPackagesSchemaProps {
  packages: {
    name: string;
    description: string;
    price: number | string;
    url: string;
  }[];
}

export function PricingPackagesJsonLd({ packages }: PricingPackagesSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: packages.map((pkg, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: pkg.name,
        description: pkg.description,
        url: pkg.url,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'VND',
          price: pkg.price.toString(),
          availability: 'https://schema.org/InStock',
        },
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

interface FaqItem {
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

