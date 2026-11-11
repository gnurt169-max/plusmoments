'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Copy,
  Check,
  Sparkles,
  Download,
  Share2,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Bot,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export interface FacebookPostData {
  title: string;
  slug?: string;
  type: 'ALBUM' | 'BLOG';
  concept?: string;
  category?: string;
  coupleNames?: string;
  location?: string;
  summary?: string;
  description?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  images?: Array<string | { url: string; alt?: string; caption?: string }>;
}

interface FacebookPostGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: FacebookPostData;
  hotline?: string;
  address?: string;
}

type ToneType = 'LUXURY' | 'ROMANTIC' | 'MODERN' | 'CONCISE';

export function FacebookPostGeneratorModal({
  isOpen,
  onClose,
  data,
  hotline = '0981 577 993',
  address = '32/35 Cao Thắng, Bàn Cờ, TP. Hồ Chí Minh',
}: FacebookPostGeneratorModalProps) {
  const [selectedTone, setSelectedTone] = useState<ToneType>('LUXURY');
  const [postContent, setPostContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedLinks, setIsCopiedLinks] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'media'>('content');

  // Normalize image list
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (data.coverImage && data.coverImage.trim()) {
      list.push(data.coverImage.trim());
    }

    if (Array.isArray(data.images)) {
      for (const item of data.images) {
        const url = typeof item === 'string' ? item : item?.url;
        if (url && url.trim() && !list.includes(url.trim())) {
          list.push(url.trim());
        }
      }
    }

    return list;
  }, [data.coverImage, data.images]);

  // Selected images state (default select up to 4 images for Facebook layout)
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Auto select first 4 images (cover + 3 grid thumbnails)
      setSelectedImages(allImages.slice(0, 4));
    }
  }, [isOpen, allImages]);

  // Generate standard high-converting Facebook copywriting
  const generateTemplate = (tone: ToneType = selectedTone) => {
    const isAlbum = data.type === 'ALBUM';
    const postConcept = data.concept || data.category || 'Pre-Wedding Luxury';
    const postLocation = data.location || 'Studio & Ngoại cảnh';
    const coupleOrTitle = data.coupleNames || data.title || 'Hai bạn uyên ương';
    const postUrl = `https://plusmoments.vn/${isAlbum ? 'bo-suu-tap' : 'blog'}/${data.slug || ''}`;

    // Select emoji based on concept
    let icon = '💍';
    if (postConcept.toLowerCase().includes('gia tiên') || postConcept.toLowerCase().includes('truyền thống')) {
      icon = '🕊️';
    } else if (postConcept.toLowerCase().includes('studio') || postConcept.toLowerCase().includes('editorial')) {
      icon = '✨';
    } else if (postConcept.toLowerCase().includes('ngoại cảnh') || postConcept.toLowerCase().includes('pre-wedding')) {
      icon = '🌿';
    }

    // Headline
    const cleanTitle = (data.title || 'Khoảnh Khắc Tình Yêu Đẹp Nhất').toUpperCase();
    const headline = `${icon} ${cleanTitle}`;

    // Opening hook based on tone
    let openingHook = '';
    if (tone === 'ROMANTIC') {
      openingHook = `“Có những khoảnh khắc chỉ diễn ra trong một cái chớp mắt, nhưng đủ để khiến hai trái tim rung động suốt cả cuộc đời.”\n\nTình yêu của ${coupleOrTitle} tựa như một bản tình ca êm dịu, ngọt ngào và ngập tràn ánh mắt yêu thương được PlusMoments ghi lại trọn vẹn từng nhịp đập cảm xúc.`;
    } else if (tone === 'MODERN') {
      openingHook = `Ai bảo chụp ảnh cưới là phải gò bó tạo dáng? Cùng ngắm nhìn bộ ảnh siêu ngọt ngào và đầy năng lượng của ${coupleOrTitle} tại ${postLocation}!\n\nTự nhiên, tinh tế và đậm cá tính riêng – đó chính là tinh thần mà PlusMoments luôn muốn gửi gắm đến từng cặp đôi dâu rể thế hệ mới.`;
    } else if (tone === 'CONCISE') {
      openingHook = `Bộ sưu tập cưới mới nhất tại PlusMoments: "${data.title || coupleOrTitle}".\n\nSự hòa quyện tuyệt vời giữa phong cách tối giản sang trọng và ánh sáng điện ảnh cao cấp, tôn vinh trọn vẹn vẻ đẹp rạng rỡ của cô dâu chú rể.`;
    } else {
      // LUXURY (Default)
      openingHook = `Một câu chuyện tình yêu mang đậm dấu ấn điện ảnh và vẻ đẹp vượt thời gian.\n\nKhông cần phô trương, sự sang trọng của ${coupleOrTitle} toát lên từ những ánh nhìn trao nhau tinh tế, tà váy cưới kiêu sa và từng khung hình được chăm chút tỉ mỉ dưới lăng kính nghệ thuật của PlusMoments.`;
    }

    // Story / Excerpt quote
    const storySnippet = data.summary || data.description || '';
    const storySection = storySnippet
      ? `\n💭 "${storySnippet.trim().slice(0, 260)}${storySnippet.length > 260 ? '...' : ''}"\n`
      : '';

    // Hashtags
    const conceptTag = postConcept.replace(/[^a-zA-Z0-9À-ỹ]/g, '');
    const locationTag = postLocation.replace(/[^a-zA-Z0-9À-ỹ]/g, '');
    const hashtags = `#PlusMoments #StudioAnhCuoi #AnhCuoiLuxury #PreWeddingEditorial #ChupAnhCuoiTPHCM #PhongSuNgayCuoi${
      conceptTag ? ` #${conceptTag}` : ''
    }${locationTag ? ` #${locationTag}` : ''}`;

    return `${headline}

${openingHook}
${storySection}
📸 Thông tin ${isAlbum ? 'bộ ảnh' : 'bài viết'}:
• Dâu & Rể: ${coupleOrTitle}
• Concept: ${postConcept}
• Nhiếp ảnh & Hậu kỳ: PlusMoments Team
• Địa điểm: ${postLocation}

👉 Inbox ngay cho PlusMoments để cùng chúng mình thiết kế concept cưới độc bản dành riêng cho hai bạn trong mùa cưới này nhé! ✨

---
💍 PLUSMOMENTS - LUXURY WEDDING STUDIO
Hotline / Zalo: ${hotline}
Website chi tiết: ${postUrl}
Địa chỉ: ${address}

${hashtags}`;
  };

  // Initialize content on open
  useEffect(() => {
    if (isOpen) {
      setPostContent(generateTemplate(selectedTone));
      setIsCopied(false);
      setIsCopiedLinks(false);
    }
  }, [isOpen, data, hotline, address]);

  // Handle tone change
  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone);
    setPostContent(generateTemplate(tone));
  };

  // Call Gemini AI to rewrite post
  const handleAIRewrite = async () => {
    try {
      setIsGeneratingAI(true);
      const postUrl = `https://plusmoments.vn/${data.type === 'ALBUM' ? 'bo-suu-tap' : 'blog'}/${data.slug || ''}`;

      const res = await fetch('/api/admin/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'FACEBOOK_POST',
          title: data.title,
          type: data.type,
          concept: data.concept || data.category,
          coupleNames: data.coupleNames,
          location: data.location,
          summary: data.summary || data.description,
          content: data.content,
          postUrl,
          tone: selectedTone,
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Không thể tạo bài đăng với AI.');
      }

      const generatedText = resData.rawText || resData.result?.text || resData.result?.postContent;
      if (generatedText) {
        setPostContent(generatedText.trim());
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi gọi AI viết lại bài đăng.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // 1-Click Copy content
  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(postContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      alert('Không thể truy cập clipboard.');
    }
  };

  // Copy selected image URLs
  const handleCopyImageLinks = async () => {
    if (selectedImages.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh để copy link!');
      return;
    }
    try {
      await navigator.clipboard.writeText(selectedImages.join('\n'));
      setIsCopiedLinks(true);
      setTimeout(() => setIsCopiedLinks(false), 3000);
    } catch (err) {
      alert('Không thể copy link.');
    }
  };

  // Toggle image selection
  const toggleImage = (url: string) => {
    setSelectedImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  // Download selected images as ZIP
  const handleDownloadSelected = async () => {
    if (selectedImages.length === 0) {
      alert('Vui lòng chọn ít nhất 1 hình ảnh để tải về!');
      return;
    }

    try {
      setIsDownloading(true);

      const res = await fetch('/api/admin/media/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedImages,
          asZip: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi khi chuẩn bị file tải về.');
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const cleanSlug = data.slug || 'facebook-media-pack';
      a.download = `PlusMoments_${cleanSlug}_FB_Media.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || 'Lỗi tải ảnh về máy.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-5xl"
      title="📱 Trợ Lý Đăng Bài Fanpage Facebook PlusMoments"
      subtitle="Tự động tối ưu nội dung copywriting, bố cục hình ảnh và bộ hashtag sẵn sàng đăng Fanpage."
    >
      <div className="space-y-6">
        {/* TABS SELECTOR FOR MOBILE / DESKTOP SWITCH */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="inline-flex p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-white text-charcoal-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>1. Nội Dung Bài Đăng (Copywriting)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                activeTab === 'media'
                  ? 'bg-white text-charcoal-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Bố Cục & Chọn Ảnh ({selectedImages.length}/{allImages.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Format chuẩn Luxury & Cinematic</span>
          </div>
        </div>

        {/* MAIN BODY CONTENT: GRID 2 COLUMNS ON DESKTOP */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =========================================================================
              LEFT COLUMN: READY-TO-POST COPYWRITING
          ========================================================================= */}
          <div className={`space-y-4 ${activeTab === 'content' ? 'block' : 'hidden lg:block'} lg:col-span-7`}>
            {/* Tone Selector & AI Action */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50/70 via-stone-50 to-amber-50/70 border border-amber-200/60 rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-charcoal-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Chọn phong cách giọng văn:</span>
                </span>

                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={handleAIRewrite}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal-900 hover:bg-charcoal-800 text-luxury-300 hover:text-luxury-200 border border-luxury-500/30 text-xs font-medium rounded-lg shadow-2xs transition disabled:opacity-50 cursor-pointer"
                  title="Sử dụng Gemini AI để viết lại nội dung với nhiều góc nhìn độc đáo"
                >
                  {isGeneratingAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-luxury-400" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-luxury-400" />
                  )}
                  <span>{isGeneratingAI ? 'AI Đang Viết...' : '✨ AI Viết Lại'}</span>
                </button>
              </div>

              {/* Tone Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'LUXURY', label: '👑 Sang trọng', desc: 'Editorial & Điện ảnh' },
                  { key: 'ROMANTIC', label: '💖 Lãng mạn', desc: 'Ngọt ngào & Thơ mộng' },
                  { key: 'MODERN', label: '⚡ Trẻ trung', desc: 'Trendy & Năng động' },
                  { key: 'CONCISE', label: '🎯 Súc tích', desc: 'Ngắn gọn & Trực diện' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleToneChange(t.key as ToneType)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      selectedTone === t.key
                        ? 'bg-white border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white/60 border-stone-200 hover:bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-charcoal-900">{t.label}</div>
                    <div className="text-[10px] text-stone-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Content Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="font-medium text-charcoal-700">Nội dung bài viết (Có thể chỉnh sửa trực tiếp):</span>
                <span className="font-mono text-[11px]">{postContent.length} ký tự</span>
              </div>

              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={16}
                className="w-full p-4 text-xs font-sans text-charcoal-900 bg-white border border-stone-300 rounded-2xl shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 leading-relaxed font-normal"
                placeholder="Nội dung bài đăng Facebook..."
              />
            </div>

            {/* Bottom Actions for Copywriting */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPostContent(generateTemplate(selectedTone))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hoàn nguyên mẫu gốc</span>
              </button>

              <button
                type="button"
                onClick={handleCopyContent}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold shadow-md transition-all cursor-pointer ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white hover:shadow-lg'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã Sao Chép Bài Đăng!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>📋 Sao Chép Nội Dung 1-Click</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =========================================================================
              RIGHT COLUMN: MEDIA GUIDE & SELECTOR FOR FACEBOOK LAYOUT
          ========================================================================= */}
          <div className={`space-y-4 ${activeTab === 'media' ? 'block' : 'hidden lg:block'} lg:col-span-5`}>
            {/* Visual Guide Box */}
            <div className="p-4 bg-stone-900 text-stone-200 rounded-2xl space-y-3 shadow-sm border border-stone-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Quy tắc bố cục ảnh Facebook (4 Photos Grid)</span>
              </h4>

              <div className="space-y-2 text-[11px] leading-relaxed text-stone-300">
                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0 text-[10px]">
                    Ảnh 1
                  </span>
                  <span>
                    <strong className="text-white">Ảnh bìa chính (Góc rộng):</strong> Khung hình toàn cảnh bắt mắt nhất, tỉ lệ 3:2, 16:9 ngang hoặc 3:4 dọc.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold shrink-0 text-[10px]">
                    Ảnh 2, 3, 4
                  </span>
                  <span>
                    <strong className="text-white">Cận cảnh cảm xúc:</strong> Khoảnh khắc trao nhẫn, ánh mắt, nụ cười hạnh phúc hoặc chi tiết váy cưới.
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-300 font-bold shrink-0 text-[10px]">
                    Ảnh +N
                  </span>
                  <span>
                    <strong className="text-white">Mạch thời gian:</strong> Sắp xếp tiếp nối theo tiến trình buổi chụp/lễ hôn phối để người xem lướt ảnh.
                  </span>
                </div>
              </div>
            </div>

            {/* Media Selector Header & Quick Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-charcoal-700 font-bold flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
                  <span>Chọn ảnh đăng kèm ({selectedImages.length} ảnh):</span>
                </label>

                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedImages(allImages.slice(0, 4))}
                    className="text-amber-800 hover:text-amber-950 underline font-medium cursor-pointer"
                  >
                    4 ảnh đầu
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedImages([...allImages])}
                    className="text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Tất cả
                  </button>
                  <span className="text-stone-300">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedImages([])}
                    className="text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>

              {/* Media Thumbnails Grid */}
              {allImages.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-300 rounded-2xl text-xs text-stone-400">
                  Chưa có hình ảnh nào được tải lên trong bài viết/album này.
                </div>
              ) : (
                <div className="max-h-[360px] overflow-y-auto p-2 bg-white rounded-2xl border border-stone-200 grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {allImages.map((url, idx) => {
                    const isSelected = selectedImages.includes(url);
                    const selectedIdx = selectedImages.indexOf(url);

                    return (
                      <div
                        key={idx}
                        onClick={() => toggleImage(url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group bg-stone-100 ${
                          isSelected
                            ? 'border-amber-600 shadow-sm ring-2 ring-amber-500/30'
                            : 'border-transparent hover:border-stone-300 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`Media ${idx + 1}`}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />

                        {/* Selection Badge with Layout Role */}
                        {isSelected && (
                          <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-600 text-white text-[9px] font-bold shadow-xs">
                            {selectedIdx === 0
                              ? '👑 Bìa #1'
                              : selectedIdx < 4
                              ? `📸 Lưới #${selectedIdx + 1}`
                              : `#${selectedIdx + 1}`}
                          </div>
                        )}

                        {/* Checkbox Icon */}
                        <div className="absolute top-1 right-1">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition ${
                              isSelected
                                ? 'bg-amber-600 text-white'
                                : 'bg-black/40 text-white/70 group-hover:bg-black/60'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Media Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                disabled={selectedImages.length === 0 || isDownloading}
                onClick={handleDownloadSelected}
                className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                title="Nén toàn bộ ảnh đã chọn thành file .zip để tải về máy đăng bài"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang nén ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tải {selectedImages.length} ảnh đã chọn (.ZIP)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={selectedImages.length === 0}
                onClick={handleCopyImageLinks}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-charcoal-700 text-xs font-medium rounded-xl transition disabled:opacity-50 cursor-pointer"
                title="Sao chép danh sách URL ảnh đã chọn"
              >
                {isCopiedLinks ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã copy link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy link ảnh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER CLOSE BUTTON */}
        <div className="flex items-center justify-end pt-4 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-stone-200 hover:bg-stone-300 text-charcoal-800 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </Modal>
  );
}

