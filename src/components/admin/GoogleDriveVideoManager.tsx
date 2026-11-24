'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Film, CheckCircle2, AlertTriangle, Eye, EyeOff, Video, Sparkles, HelpCircle } from 'lucide-react';
import { extractGoogleDriveFileId, GoogleDriveVideoItem, GoogleDriveVideoPlayer } from '@/components/ui/GoogleDriveVideoPlayer';

interface GoogleDriveVideoManagerProps {
  videos: GoogleDriveVideoItem[];
  onChange: (videos: GoogleDriveVideoItem[]) => void;
  maxVideos?: number;
}

export function GoogleDriveVideoManager({
  videos = [],
  onChange,
  maxVideos = 10,
}: GoogleDriveVideoManagerProps) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  const handleAddVideo = () => {
    if (videos.length >= maxVideos) return;
    const newVideo: GoogleDriveVideoItem = {
      id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: '',
      driveUrl: '',
      aspectRatio: '16:9',
    };
    onChange([...videos, newVideo]);
  };

  const handleUpdateVideo = (index: number, updates: Partial<GoogleDriveVideoItem>) => {
    const updated = [...videos];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleRemoveVideo = (index: number) => {
    const target = videos[index];
    if (previewingId === target.id) {
      setPreviewingId(null);
    }
    onChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#8C6D46]" />
            <h4 className="font-serif font-medium text-sm text-stone-900">
              Video Phim Cưới / Highlight (Google Drive)
            </h4>
            <span className="text-[11px] font-mono text-stone-400">
              ({videos.length}/{maxVideos})
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Dán link file video từ Google Drive để nhúng trình phát phim trực tiếp vào trang web.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddVideo}
          disabled={videos.length >= maxVideos}
          className="h-8 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm Video Google Drive</span>
        </button>
      </div>

      {/* Sharing reminder note */}
      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-amber-900 text-[11px] leading-relaxed">
        <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold">Lưu ý quan trọng:</strong> Đặt quyền chia sẻ file video trên Google Drive ở chế độ{' '}
          <span className="font-semibold underline decoration-amber-400">
            &ldquo;Bất kỳ ai có đường liên kết đều có thể xem&rdquo; (Anyone with the link can view)
          </span>{' '}
          để khách mời và người xem có thể phát video trực tiếp trên website mà không bị chặn quyền.
        </div>
      </div>

      {/* Video list */}
      {videos.length === 0 ? (
        <div className="p-6 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 text-center text-xs text-stone-400">
          Chưa có video nào. Bấm &ldquo;Thêm Video Google Drive&rdquo; để đính kèm phim cưới, teaser hoặc video Reels.
        </div>
      ) : (
        <div className="space-y-3">
          {videos.map((item, index) => {
            const fileId = extractGoogleDriveFileId(item.driveUrl);
            const isValid = Boolean(fileId);
            const isPreviewing = previewingId === item.id;

            return (
              <div
                key={item.id || index}
                className={`p-4 rounded-2xl border transition-all ${
                  isValid
                    ? 'border-stone-200 bg-white hover:border-[#8C6D46]/40'
                    : 'border-amber-200 bg-amber-50/30'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  {/* Title (4 cols) */}
                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Tiêu đề video (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => handleUpdateVideo(index, { title: e.target.value })}
                      placeholder="VD: Wedding Highlight Film, Teaser..."
                      className="w-full h-9 px-3 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    />
                  </div>

                  {/* Drive URL (5 cols) */}
                  <div className="md:col-span-5">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-stone-600">
                        Link Google Drive <span className="text-red-500">*</span>
                      </label>
                      {item.driveUrl && (
                        <div className="flex items-center gap-1 text-[10px] font-mono">
                          {isValid ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ID: {fileId?.slice(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-rose-600 font-medium flex items-center gap-1 bg-rose-50 px-1.5 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              Link chưa đúng định dạng
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      value={item.driveUrl || ''}
                      onChange={(e) => handleUpdateVideo(index, { driveUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..."
                      className={`w-full h-9 px-3 rounded-xl border text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 ${
                        item.driveUrl && !isValid
                          ? 'border-rose-300 focus:ring-rose-400 bg-rose-50/20'
                          : 'border-stone-300 focus:ring-[#8C6D46]'
                      }`}
                    />
                  </div>

                  {/* Aspect Ratio (2 cols) */}
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">
                      Khung hình
                    </label>
                    <select
                      value={item.aspectRatio || '16:9'}
                      onChange={(e) =>
                        handleUpdateVideo(index, { aspectRatio: e.target.value as '16:9' | '9:16' })
                      }
                      className="w-full h-9 px-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#8C6D46]"
                    >
                      <option value="16:9">Ngang 16:9</option>
                      <option value="9:16">Dọc 9:16 (Reels)</option>
                    </select>
                  </div>

                  {/* Actions (1 col) */}
                  <div className="md:col-span-1 flex items-center justify-end gap-1 pt-6">
                    {/* Toggle preview */}
                    <button
                      type="button"
                      disabled={!isValid}
                      onClick={() => setPreviewingId(isPreviewing ? null : item.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isPreviewing
                          ? 'border-[#8C6D46] bg-[#8C6D46] text-white'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                      title={isPreviewing ? 'Đóng xem thử' : 'Xem thử video'}
                    >
                      {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete item */}
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(index)}
                      className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors"
                      title="Xóa video này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Preview Drawer */}
                {isPreviewing && isValid && (
                  <div className="mt-4 pt-4 border-t border-stone-100 bg-stone-50/70 p-3 rounded-xl animate-fade-in">
                    <div className="text-[11px] font-medium text-stone-600 mb-2 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-[#8C6D46]" />
                      <span>Xem thử khung phát thực tế ({item.aspectRatio || '16:9'}):</span>
                    </div>
                    <div className="max-w-xl mx-auto">
                      <GoogleDriveVideoPlayer video={item} autoMountOnScroll={false} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
