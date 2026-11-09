import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function POST() {
  try {
    const allFiles = await prisma.mediaFile.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (allFiles.length <= 1) {
      return NextResponse.json({
        success: true,
        removedCount: 0,
        freedBytes: 0,
        formattedFreedSize: '0 B',
        duplicateGroups: 0,
        message: 'Thư viện hiện tại không có bản ghi nào bị trùng lặp.',
      });
    }

    // Grouping by fingerprint
    // 1. Group by driveFileId (if non-null)
    // 2. Group by md5Checksum (if non-null)
    // 3. Group by (name + size + folderId)
    const processedIds = new Set<string>();
    const duplicateGroups: Array<{
      master: (typeof allFiles)[0];
      duplicates: typeof allFiles;
    }> = [];

    // Map for driveFileId
    const byDriveId = new Map<string, typeof allFiles>();
    // Map for md5Checksum
    const byChecksum = new Map<string, typeof allFiles>();
    // Map for name + size + folderId
    const byNameSize = new Map<string, typeof allFiles>();

    for (const f of allFiles) {
      if (f.driveFileId) {
        if (!byDriveId.has(f.driveFileId)) byDriveId.set(f.driveFileId, []);
        byDriveId.get(f.driveFileId)!.push(f);
      }
      if (f.md5Checksum) {
        if (!byChecksum.has(f.md5Checksum)) byChecksum.set(f.md5Checksum, []);
        byChecksum.get(f.md5Checksum)!.push(f);
      }
      const nameKey = `${(f.name || '').trim().toLowerCase()}___${f.size}___${f.folderId || 'root'}`;
      if (!byNameSize.has(nameKey)) byNameSize.set(nameKey, []);
      byNameSize.get(nameKey)!.push(f);
    }

    const processGroup = (group: typeof allFiles) => {
      const activeInGroup = group.filter((item) => !processedIds.has(item.id));
      if (activeInGroup.length <= 1) return;

      // Master is the first one (earliest created because allFiles was sorted asc)
      const master = activeInGroup[0];
      const duplicates = activeInGroup.slice(1);

      for (const d of duplicates) {
        processedIds.add(d.id);
      }
      processedIds.add(master.id);

      duplicateGroups.push({ master, duplicates });
    };

    // Process driveFileId matches
    Array.from(byDriveId.values()).forEach((group) => {
      processGroup(group);
    });

    // Process md5Checksum matches
    Array.from(byChecksum.values()).forEach((group) => {
      processGroup(group);
    });

    // Process name + size matches
    Array.from(byNameSize.values()).forEach((group) => {
      processGroup(group);
    });

    let removedCount = 0;
    let freedBytes = 0;

    for (const { master, duplicates } of duplicateGroups) {
      for (const dup of duplicates) {
        // Re-point any AlbumMedia or PostImage referencing dup.url to master.url
        if (dup.url !== master.url) {
          await prisma.albumMedia.updateMany({
            where: { url: dup.url },
            data: { url: master.url },
          });
          await prisma.postImage.updateMany({
            where: { url: dup.url },
            data: { url: master.url },
          });
        }

        // Delete duplicate record from DB
        await prisma.mediaFile.delete({
          where: { id: dup.id },
        });
        removedCount++;

        // Only delete file on disk if URL is different and no other MediaFile points to this url
        if (dup.url && dup.url !== master.url && dup.url.startsWith('/uploads/')) {
          const countRemaining = await prisma.mediaFile.count({
            where: { url: dup.url },
          });

          if (countRemaining === 0) {
            const diskPath = path.join(process.cwd(), 'public', dup.url);
            if (fs.existsSync(diskPath)) {
              try {
                const stat = fs.statSync(diskPath);
                fs.unlinkSync(diskPath);
                freedBytes += stat.size;
              } catch (err) {
                console.warn(`Could not unlink duplicate disk file ${diskPath}:`, err);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      removedCount,
      freedBytes,
      formattedFreedSize: formatBytes(freedBytes),
      duplicateGroups: duplicateGroups.length,
      message:
        removedCount > 0
          ? `Đã dọn dẹp thành công ${removedCount} bản ghi trùng lặp trong ${duplicateGroups.length} nhóm, giải phóng ${formatBytes(freedBytes)} dung lượng lưu trữ.`
          : 'Thư viện hiện tại sạch sẽ, không phát hiện ảnh trùng lặp.',
    });
  } catch (error: any) {
    console.error('Deduplication error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi quét và dọn dẹp ảnh trùng lặp.' },
      { status: 500 }
    );
  }
}
