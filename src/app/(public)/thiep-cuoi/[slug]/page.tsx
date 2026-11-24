import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCachedPackages } from '@/lib/cached-queries';
import { WeddingInvitationView } from '@/components/invitations/WeddingInvitationView';
import { InvitationGalleryImage } from '@/lib/invitations/templates';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const invitation = await prisma.weddingInvitation.findUnique({
    where: { slug },
    select: {
      groomName: true,
      brideName: true,
      coverImage: true,
      ceremonyDate: true,
      ceremonyTimeText: true,
      venueName: true,
    },
  });

  if (!invitation) {
    return {
      title: 'Không Tìm Thấy Thiệp Cưới | PlusMoments',
    };
  }

  const dateText = invitation.ceremonyTimeText || new Date(invitation.ceremonyDate).toLocaleDateString('vi-VN');

  return {
    title: `Thiệp Cưới: ${invitation.groomName} & ${invitation.brideName} | PlusMoments`,
    description: `Trân trọng kính mời bạn đến chung vui cùng ${invitation.groomName} & ${invitation.brideName} vào ngày ${dateText} tại ${invitation.venueName}.`,
    openGraph: {
      title: `Thiệp Cưới: ${invitation.groomName} & ${invitation.brideName}`,
      description: `Hôn lễ diễn ra vào ngày ${dateText} tại ${invitation.venueName}.`,
      images: invitation.coverImage ? [{ url: invitation.coverImage }] : [],
    },
  };
}

export default async function WeddingInvitationPublicPage({ params }: PageProps) {
  const { slug } = await params;

  const [invitation, packages] = await Promise.all([
    prisma.weddingInvitation.findUnique({
      where: { slug },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    }),
    getCachedPackages(),
  ]);

  if (!invitation || !invitation.isPublished) {
    notFound();
  }

  // Increment viewCount asynchronously
  try {
    await prisma.weddingInvitation.update({
      where: { id: invitation.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch (err) {
    // Silent fail for views
  }

  const galleryImages = (
    Array.isArray(invitation.galleryImages) ? invitation.galleryImages : []
  ) as unknown as InvitationGalleryImage[];

  const viewData = {
    id: invitation.id,
    slug: invitation.slug,
    templateId: invitation.templateId,
    themeColor: invitation.themeColor,
    groomName: invitation.groomName,
    brideName: invitation.brideName,
    groomParents: invitation.groomParents,
    brideParents: invitation.brideParents,
    groomImage: (invitation as any).groomImage || null,
    brideImage: (invitation as any).brideImage || null,
    groomBio: (invitation as any).groomBio || null,
    brideBio: (invitation as any).brideBio || null,
    ceremonyDate: invitation.ceremonyDate.toISOString(),
    ceremonyTimeText: invitation.ceremonyTimeText,
    venueName: invitation.venueName,
    venueAddress: invitation.venueAddress,
    googleMapsUrl: invitation.googleMapsUrl,
    storyTitle: invitation.storyTitle,
    storyText: invitation.storyText,
    coverImage: invitation.coverImage,
    galleryImages,
    musicPreset: invitation.musicPreset,
    bankQrImage: invitation.bankQrImage,
    bankInfoText: invitation.bankInfoText,
    rsvps: invitation.rsvps.map((r) => ({
      id: r.id,
      guestName: r.guestName,
      attendance: r.attendance,
      guestCount: r.guestCount,
      side: r.side,
      wishMessage: r.wishMessage,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  // Serialize packages safely for client consumption
  const curatedPackages = (packages || []).slice(0, 3).map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    slug: pkg.slug,
    subtitle: pkg.subtitle,
    price: Number(pkg.price) || 0,
    originalPrice: pkg.originalPrice != null ? Number(pkg.originalPrice) : null,
    unit: pkg.unit || 'trọn gói',
    coverImage: pkg.coverImage || pkg.demoImages?.[0] || '/uploads/albums/pre-wedding/phim-truong-da-lat-01.webp',
    highlightPoints: Array.isArray(pkg.highlightPoints) ? pkg.highlightPoints : [],
    category: pkg.category,
    badgeText: pkg.badgeText,
  }));

  return <WeddingInvitationView data={viewData} servicePackages={curatedPackages} />;
}
