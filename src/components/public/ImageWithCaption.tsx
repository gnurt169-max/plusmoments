'use client';

import React from 'react';
import { ProtectedImage } from '@/components/common/ProtectedImage';

export interface ImageWithCaptionProps {
  imageUrl: string;
  altText?: string;
  caption?: string | null;
  priority?: boolean;
  maxWidthClassName?: string;
  className?: string;
}

/**
 * ImageWithCaption: Component hiển thị ảnh kèm caption tối ưu tỷ lệ (Auto Height)
 * - Khắc phục triệt để lỗi khoảng trắng thừa dưới chân ảnh ngang
 * - Ảnh ngang hiển thị chuẩn tỷ lệ ngang, ảnh dọc hiển thị chuẩn tỷ lệ dọc
 * - Caption đặt sát mép dưới của ảnh với typography sang trọng
 */
export function ImageWithCaption({
  imageUrl,
  altText = 'PlusMoments Wedding Photography',
  caption,
  priority = false,
  maxWidthClassName = 'max-w-2xl',
  className = '',
}: ImageWithCaptionProps) {
  if (!imageUrl || !imageUrl.trim()) return null;

  return (
    <figure className={`my-6 flex flex-col items-center w-full ${className}`}>
      <div className={`relative w-full ${maxWidthClassName} rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E8E2D9] shadow-sm`}>
        <ProtectedImage
          src={imageUrl}
          alt={altText || 'PlusMoments Wedding Photography'}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          watermark
          watermarkText="PlusMoments Photography"
          imageClassName="w-full h-auto object-cover block transition duration-300 hover:scale-[1.01]"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-xs sm:text-sm text-[#78716C] italic font-serif max-w-xl px-4">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default ImageWithCaption;

