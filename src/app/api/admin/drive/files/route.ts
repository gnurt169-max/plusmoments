import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listGoogleDriveFiles, parseGoogleDriveFolderId } from '@/lib/drive';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentFolderId = searchParams.get('parentFolderId') || searchParams.get('folderId');
    const allowedExtensionsParam = searchParams.get('allowedExtensions') || searchParams.get('formats');
    const mode = searchParams.get('mode');
    const isLogo = mode === 'logo' || searchParams.get('isLogo') === 'true';

    let allowedSet: Set<string> | null = null;
    if (allowedExtensionsParam) {
      allowedSet = new Set(
        allowedExtensionsParam.split(',').map((e) => e.trim().toLowerCase().replace(/^\./, ''))
      );
    } else if (isLogo) {
      allowedSet = new Set(['png', 'svg']);
    }

    // 1. Fetch configured Drive folder from database
    const settings = await prisma.systemSetting.findUnique({
      where: { id: 'default' },
    });

    // Extract root folder ID strictly from URL or field
    let rootFolderId =
      (settings?.driveFolderUrl ? parseGoogleDriveFolderId(settings.driveFolderUrl) : '') ||
      (settings?.driveFolderId && !settings.driveFolderId.startsWith('AIzaSy')
        ? parseGoogleDriveFolderId(settings.driveFolderId)
        : '');

    const targetFolderId = parentFolderId
      ? parseGoogleDriveFolderId(parentFolderId) || parentFolderId
      : rootFolderId;
    const apiKey = settings?.googleDriveApiKey || process.env.GOOGLE_DRIVE_API_KEY || '';

    if (!targetFolderId) {
      return NextResponse.json({
        success: false,
        error: 'Chưa có liên kết hoặc ID thư mục Google Drive. Vui lòng dán link thư mục để quét.',
        configuredFolderUrl: settings?.driveFolderUrl || '',
        configuredFolderId: settings?.driveFolderId || '',
        folders: [],
        images: [],
        files: [],
      });
    }

    // 2. Fetch files and subfolders from Drive
    const result = await listGoogleDriveFiles(targetFolderId, apiKey);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error:
          result.error ||
          'Không thể truy cập thư mục Google Drive này. Vui lòng kiểm tra lại quyền chia sẻ liên kết.',
        configuredFolderUrl: settings?.driveFolderUrl || '',
        configuredFolderId: settings?.driveFolderId || '',
        folders: [],
        images: [],
        files: [],
      });
    }

    // Defense-in-depth: Strict filter against macOS shadow/ghost files & ensure distinct thumbnail URLs
    const cleanImages = (result.images || [])
      .filter((file) => {
        const name = file.name || '';
        if (
          name.startsWith('._') ||
          name.startsWith('.') ||
          name.includes('.DS_Store') ||
          name.endsWith('.localized')
        ) {
          return false;
        }
        if (file.size !== undefined && file.size <= 0) {
          return false;
        }
        if (allowedSet) {
          const ext = (name.split('.').pop() || '').toLowerCase();
          const mime = (file.mimeType || '').toLowerCase();
          const matchesExt = allowedSet.has(ext);
          const matchesMime =
            (allowedSet.has('png') && mime === 'image/png') ||
            (allowedSet.has('svg') && (mime === 'image/svg+xml' || ext === 'svg'));
          if (!matchesExt && !matchesMime) {
            return false;
          }
        }
        return true;
      })
      .map((file) => {
        const thumb =
          file.thumbnailUrl ||
          file.thumbnailLink ||
          `https://lh3.googleusercontent.com/d/${file.id}=s400`;
        return {
          ...file,
          thumbnailLink: thumb,
          thumbnailUrl: thumb,
        };
      });

    const cleanFolders = (result.folders || []).filter(
      (folder) => !folder.name.startsWith('.') && !folder.name.startsWith('._')
    );

    return NextResponse.json({
      success: true,
      folders: cleanFolders,
      images: cleanImages,
      files: cleanImages,
      currentFolder: result.currentFolder,
      folderId: result.folderId,
      rootFolderId,
      warning: result.warning,
      configuredFolderUrl: settings?.driveFolderUrl,
    });
  } catch (error: any) {
    console.error('List Google Drive files error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Lỗi khi duyệt thư mục Google Drive.' },
      { status: 500 }
    );
  }
}
