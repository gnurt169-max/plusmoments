'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ContactConfig {
  hotline: string;
  hotlineDisplay: string;
  zaloPhone: string;
  zaloUrl: string;
  messengerUrl: string;
  promoText: string;
  address: string;
  email: string;
  googleMapsUrl?: string;
  openingHours?: string;
  logoType?: string;
  brandNamePart1?: string;
  brandNamePart2?: string;
  brandSubtitle?: string;
  logoLightUrl?: string | null;
  logoDarkUrl?: string | null;
  logoTextPrimary?: string;
  logoTextSecondary?: string;
  logoFontFamily?: string;
  logoFontSize?: number;
  logoFontWeight?: string;
  logoLetterSpacing?: string;
  logoColorLight?: string;
  logoColorDark?: string;
  logoAccentColor?: string;
  themePrimaryColor?: string;
  themeBgColor?: string;
  themeTextColor?: string;
  googleAdsPhoneConversionLabel?: string | null;
  googleAdsZaloConversionLabel?: string | null;
  googleAdsMessengerConversionLabel?: string | null;
  googleAdsConversionLabel?: string | null;
  googleAdsConversionValue?: number | null;
  redirectOnSubmit?: boolean;
  thankYouPageUrl?: string;
}

interface ContactContextType {
  contact: ContactConfig;
  updateContact: (newContact: Partial<ContactConfig>) => void;
  refreshContact: () => Promise<void>;
  isLoading: boolean;
}

const defaultContactConfig: ContactConfig = {
  hotline: '0908123456',
  hotlineDisplay: '0908.123.456',
  zaloPhone: '0908123456',
  zaloUrl: 'https://zalo.me/0908123456',
  messengerUrl: 'https://m.me/plusmoments.vn',
  promoText: 'Nhận Báo Giá Ưu Đãi 2Tr',
  address: '123 Đường Hoa Lan, Phường 2, Quận Phú Nhuận, TP. Hồ Chí Minh',
  email: 'contact@plusmoments.vn',
  googleMapsUrl: 'https://maps.google.com',
  openingHours: '09:00 - 21:00 hàng ngày',
  logoType: 'TEXT',
  brandNamePart1: 'PLUS',
  brandNamePart2: 'MOMENTS',
  brandSubtitle: 'LUXURY WEDDING STUDIO',
  logoLightUrl: null,
  logoDarkUrl: null,
  logoTextPrimary: 'PLUS MOMENTS',
  logoTextSecondary: 'LUXURY WEDDING STUDIO',
  logoFontFamily: 'Playfair Display',
  logoFontSize: 24,
  logoFontWeight: '600',
  logoLetterSpacing: '0.15em',
  logoColorLight: '#1A1614',
  logoColorDark: '#F5F2EB',
  logoAccentColor: '#C5A880',
  themePrimaryColor: '#C5A880',
  themeBgColor: '#FAF8F5',
  themeTextColor: '#1C1917',
};

const ContactContext = createContext<ContactContextType>({
  contact: defaultContactConfig,
  updateContact: () => {},
  refreshContact: async () => {},
  isLoading: false,
});

export function ContactProvider({
  children,
  initialContact,
}: {
  children: React.ReactNode;
  initialContact?: Partial<ContactConfig>;
}) {
  const [contact, setContact] = useState<ContactConfig>({
    ...defaultContactConfig,
    ...initialContact,
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshContact = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/settings/contact', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.contact) {
        setContact((prev) => ({
          ...prev,
          ...data.contact,
        }));
      }
    } catch (err) {
      console.warn('Failed to refresh contact config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateContact = (newContact: Partial<ContactConfig>) => {
    setContact((prev) => ({
      ...prev,
      ...newContact,
    }));
  };

  return (
    <ContactContext.Provider
      value={{
        contact,
        updateContact,
        refreshContact,
        isLoading,
      }}
    >
      {children}
    </ContactContext.Provider>
  );
}

export function useContact() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
}

