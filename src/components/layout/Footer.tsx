import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BrandLogo } from '@/components/common/BrandLogo';
import { GoogleMapFacade } from '@/components/common/GoogleMapFacade';
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Youtube, MessageCircle } from 'lucide-react';
import { resolveGoogleMapsUrl } from '@/lib/maps-converter';

function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.87-4.48V8.71a8.21 8.21 0 0 0 4.85 1.57v-3.59h-.95Z" />
    </svg>
  );
}

export interface FooterLinkItem {
  label: string;
  url: string;
}

export interface FooterAlbumItem {
  id: string;
  title: string;
  slug: string;
}

export interface FooterPackageItem {
  id: string;
  name: string;
  slug: string;
}

export interface FooterPostItem {
  id: string;
  title: string;
  slug: string;
}

export interface FooterProps {
  settings?: any;
  activeAlbums?: FooterAlbumItem[];
  activePackages?: FooterPackageItem[];
  activePosts?: FooterPostItem[];

  brandName?: string | null;
  brandSlogan?: string | null;
  brandBio?: string | null;
  footerAboutText?: string | null;

  address?: string | null;
  studioAddress?: string | null;
  footerAddress?: string | null;

  googleMapsEmbedUrl?: string | null;
  googleMapsShareUrl?: string | null;

  hotline?: string | null;
  hotlineDisplay?: string | null;
  footerHotline?: string | null;

  contactEmail?: string | null;
  email?: string | null;
  footerEmail?: string | null;

  workingHours?: string | null;
  openingHours?: string | null;
  footerWorkingHours?: string | null;

  facebookUrl?: string | null;
  instagramUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  zaloUrl?: string | null;

  footerNavCol1Title?: string | null;
  footerNavCol1Links?: FooterLinkItem[] | string | null;

  footerNavCol2Title?: string | null;
  footerNavCol2Links?: FooterLinkItem[] | string | null;

  copyrightText?: string | null;
  footerCopyrightText?: string | null;
  footerPolicyLinks?: FooterLinkItem[] | string | null;
}

export async function Footer(props: FooterProps) {
  // 1. Resolve settings from props or database
  let settings = props.settings;
  if (!settings) {
    settings = await prisma.systemSetting.findFirst().catch(() => null);
  }

  // 2. Resolve dynamic Albums from database (only active/published)
  let albums: FooterAlbumItem[] = props.activeAlbums || [];
  if (!props.activeAlbums) {
    albums = await prisma.album
      .findMany({
        where: { published: true },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true },
      })
      .catch(() => []);
  }

  // 3. Resolve dynamic Packages from database (only active/published)
  let packages: FooterPackageItem[] = props.activePackages || [];
  if (!props.activePackages) {
    packages = await prisma.servicePackage
      .findMany({
        where: { published: true },
        take: 5,
        orderBy: { orderIndex: 'asc' },
        select: { id: true, name: true, slug: true },
      })
      .catch(() => []);
  }

  // 4. Resolve dynamic Blog Posts from database (only active/published)
  let posts: FooterPostItem[] = props.activePosts || [];
  if (!props.activePosts) {
    posts = await prisma.blogPost
      .findMany({
        where: { published: true },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, slug: true },
      })
      .catch(() => []);
  }

  // Brand Manifesto & Identity
  const aboutText = (
    props.brandBio ||
    props.footerAboutText ||
    settings?.brandBio ||
    settings?.footerAboutText ||
    'Chúng tôi ghi lại những rung cảm tinh khôi và chân thành nhất trong tình yêu của bạn bằng ngôn ngữ ánh sáng điện ảnh.'
  ).trim();

  // Social Links (Strict: DO NOT render if empty)
  const facebookUrl = (props.facebookUrl ?? settings?.facebookUrl ?? '').trim();
  const instagramUrl = (props.instagramUrl ?? settings?.instagramUrl ?? '').trim();
  const youtubeUrl = (props.youtubeUrl ?? settings?.youtubeUrl ?? '').trim();
  const tiktokUrl = (props.tiktokUrl ?? settings?.tiktokUrl ?? '').trim();
  const zaloUrl = (props.zaloUrl ?? settings?.zaloUrl ?? '').trim();

  const hasAnySocial = Boolean(facebookUrl || instagramUrl || youtubeUrl || tiktokUrl || zaloUrl);

  // Column Titles
  const col1Title = (props.footerNavCol1Title || settings?.footerNavCol1Title || 'BỘ SƯU TẬP CƯỚI').trim();
  const col2Title = (props.footerNavCol2Title || settings?.footerNavCol2Title || 'BẢNG GIÁ & DỊCH VỤ').trim();

  // Studio Contact Information (Strict: DO NOT render if empty)
  const address = (
    props.address ||
    props.studioAddress ||
    props.footerAddress ||
    settings?.address ||
    settings?.footerAddress ||
    settings?.studioAddress ||
    ''
  ).trim();

  let googleMapsEmbedUrl = (
    props.googleMapsEmbedUrl ??
    settings?.googleMapsEmbedUrl ??
    ''
  ).trim();

  let googleMapsShareUrl = (
    props.googleMapsShareUrl ??
    settings?.googleMapsShareUrl ??
    ''
  ).trim();

  const rawMapsSource = settings?.googleMapsUrl || props.googleMapsShareUrl;
  if ((!googleMapsEmbedUrl || !googleMapsShareUrl) && rawMapsSource) {
    const resolved = resolveGoogleMapsUrl(rawMapsSource, address);
    if (!googleMapsEmbedUrl) googleMapsEmbedUrl = resolved.embedUrl;
    if (!googleMapsShareUrl) googleMapsShareUrl = resolved.shareUrl;
  }

  const hotline = (
    props.hotline ||
    props.footerHotline ||
    settings?.hotline ||
    settings?.footerHotline ||
    ''
  ).trim();

  const hotlineDisplay = (
    props.hotlineDisplay ||
    settings?.hotlineDisplay ||
    hotline
  ).trim();

  const contactEmail = (
    props.contactEmail ||
    props.email ||
    props.footerEmail ||
    settings?.contactEmail ||
    settings?.footerEmail ||
    settings?.email ||
    ''
  ).trim();

  const workingHours = (
    props.workingHours ||
    props.openingHours ||
    props.footerWorkingHours ||
    settings?.workingHours ||
    settings?.footerWorkingHours ||
    settings?.openingHours ||
    ''
  ).trim();

  // Copyright
  const copyrightText = (
    props.copyrightText ||
    props.footerCopyrightText ||
    settings?.copyrightText ||
    settings?.footerCopyrightText ||
    `© ${new Date().getFullYear()} PlusMoments Wedding Studio. All rights reserved.`
  ).trim();

  return (
    <footer className="bg-charcoal-950 text-stone-300 pt-20 pb-12 border-t border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 mb-16">
          {/* CỘT 1: THƯƠNG HIỆU & MẠNG XÃ HỘI */}
          <div className="space-y-4">
            <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
              <BrandLogo
                variant="light"
                brandNamePart1={settings?.brandNamePart1}
                brandNamePart2={settings?.brandNamePart2}
                brandSubtitle={props.brandSlogan || settings?.brandSlogan || settings?.brandSubtitle}
                logoLightUrl={settings?.logoLightUrl}
                logoType={settings?.logoType}
                logoTextPrimary={settings?.logoTextPrimary}
                logoTextSecondary={settings?.logoTextSecondary}
                logoFontFamily={settings?.logoFontFamily}
                logoFontSize={settings?.logoFontSize}
                logoFontWeight={settings?.logoFontWeight}
                logoLetterSpacing={settings?.logoLetterSpacing}
                logoColorLight={settings?.logoColorLight}
                logoColorDark={settings?.logoColorDark}
                logoAccentColor={settings?.logoAccentColor}
              />
            </Link>
            {aboutText && (
              <p className="text-xs text-stone-400 leading-relaxed font-light">
                {aboutText}
              </p>
            )}

            {/* Chỉ render các icon mạng xã hội có link */}
            {hasAnySocial && (
              <div className="flex items-center gap-3 pt-2">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook PlusMoments"
                    className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-luxury-600 transition-colors"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram PlusMoments"
                    className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-luxury-600 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube PlusMoments"
                    className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-luxury-600 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok PlusMoments"
                    className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-luxury-600 transition-colors"
                  >
                    <TikTokIcon className="w-3.5 h-3.5" />
                  </a>
                )}
                {zaloUrl && (
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Zalo PlusMoments"
                    className="w-8 h-8 rounded-full bg-charcoal-800 flex items-center justify-center text-stone-400 hover:text-white hover:bg-luxury-600 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CỘT 2: BỘ SƯU TẬP CƯỚI (100% REAL DATABASE DATA) */}
          <div>
            <p className="font-serif text-sm uppercase tracking-widest text-white mb-5 font-medium">
              {col1Title}
            </p>
            <ul className="space-y-2.5 text-xs font-light">
              {albums.map((album) => (
                <li key={album.id}>
                  <Link
                    href={`/bo-suu-tap/${album.slug}`}
                    className="hover:text-luxury-400 transition-colors line-clamp-1"
                  >
                    {album.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/bo-suu-tap"
                  className="text-luxury-500 font-medium hover:text-luxury-400 transition-colors inline-flex items-center gap-1 pt-1"
                >
                  Xem tất cả bộ sưu tập &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: BẢNG GIÁ & DỊCH VỤ (100% REAL DATABASE DATA) */}
          <div>
            <p className="font-serif text-sm uppercase tracking-widest text-white mb-5 font-medium">
              {col2Title}
            </p>
            <ul className="space-y-2.5 text-xs font-light">
              {packages.map((pkg) => (
                <li key={pkg.id}>
                  <Link
                    href={`/bang-gia`}
                    className="hover:text-luxury-400 transition-colors line-clamp-1"
                  >
                    {pkg.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/bang-gia"
                  className="text-luxury-500 font-medium hover:text-luxury-400 transition-colors inline-flex items-center gap-1 pt-1"
                >
                  Xem toàn bộ bảng giá &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: CẨM NANG CƯỚI */}
          <div>
            <p className="font-serif text-sm uppercase tracking-widest text-[#E8E2D9] mb-4 font-medium">
              Cẩm Nang Cưới
            </p>
            <ul className="space-y-2.5 text-xs text-[#A8A29E] font-light">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/cam-nang/${post.slug}`}
                    className="hover:text-white transition duration-200 line-clamp-1"
                    title={post.title}
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/cam-nang"
                  className="inline-block text-[#D6D0C7] hover:text-white transition duration-200 mt-1 font-medium"
                >
                  Xem tất cả cẩm nang &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 5: LIÊN HỆ STUDIO (CHỈ HIỂN THỊ CÁC Ô CÓ DỮ LIỆU) */}
          <div>
            <p className="font-serif text-sm uppercase tracking-widest text-white mb-5 font-medium">
              Liên Hệ Studio
            </p>
            <ul className="space-y-3 text-xs font-light">
              {address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-luxury-500 shrink-0 mt-0.5" />
                  <div>
                    {googleMapsShareUrl ? (
                      <a
                        href={googleMapsShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/addr inline-block leading-relaxed text-[#D6D0C7] hover:text-white transition"
                        title="Mở Google Maps chỉ đường đến studio"
                      >
                        <span className="group-hover/addr:underline underline-offset-4">{address}</span>
                        <span className="block text-[11px] text-[#8C7A6B] group-hover/addr:text-luxury-400 mt-1 underline underline-offset-4">
                          Chỉ đường trên Google Maps ↗
                        </span>
                      </a>
                    ) : (
                      <span className="leading-relaxed text-[#D6D0C7]">{address}</span>
                    )}
                  </div>
                </li>
              )}
              {hotline && (
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-luxury-500 shrink-0" />
                  <a
                    href={`tel:${hotline.replace(/[^0-9+]/g, '')}`}
                    className="hover:text-luxury-400 transition-colors font-mono"
                  >
                    {hotlineDisplay || hotline}
                  </a>
                </li>
              )}
              {contactEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-luxury-500 shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-luxury-400 transition-colors"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
              {workingHours && (
                <li className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-luxury-500 shrink-0" />
                  <span>{workingHours}</span>
                </li>
              )}
            </ul>

            {/* Khung Bản Đồ Click-to-Load Facade (Triệt tiêu 800KB JS khi mới mở trang) */}
            {googleMapsEmbedUrl && (
              <div className="mt-4">
                <GoogleMapFacade
                  embedUrl={googleMapsEmbedUrl}
                  shareUrl={googleMapsShareUrl}
                  address={address}
                  studioName={settings?.siteName || 'PlusMoments Wedding Studio'}
                />
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM BAR & COPYRIGHT */}
        <div className="pt-8 border-t border-charcoal-800/80 text-center text-[11px] text-stone-400">
          <p>{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
