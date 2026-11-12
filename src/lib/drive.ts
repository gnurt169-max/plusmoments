import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { generateResponsiveWebPVariants } from './image-variants';

export interface DriveFolderItem {
  id: string;
  name: string;
  mimeType: 'application/vnd.google-apps.folder';
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink: string;
  thumbnailUrl?: string;
  directThumbnail?: string;
  webContentLink?: string;
  size?: number;
  width?: number;
  height?: number;
  md5Checksum?: string;
}

export interface DriveExplorerResult {
  success: boolean;
  error?: string;
  folders: DriveFolderItem[];
  images: DriveFileItem[];
  files: DriveFileItem[]; // Backward compatibility
  currentFolder: {
    id: string;
    name: string;
  };
  folderId: string;
  warning?: string;
}

/**
 * Parse Google Drive Folder ID from standard URLs or raw strings
 * Strictly ensures API Key (AIzaSy...) is NEVER extracted as a folder ID!
 */
export function parseGoogleDriveFolderId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();

  // Defense 1: Reject Google API Key
  if (trimmed.startsWith('AIzaSy')) {
    return '';
  }

  // 1. Match standard Google Drive folder URLs:
  // e.g. https://drive.google.com/drive/folders/1K304w4YGyJj7ANysRo7Flc4_LV0wYPpQ
  // e.g. https://drive.google.com/drive/u/0/folders/1K304w4YGyJj7ANysRo7Flc4_LV0wYPpQ
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1].split('?')[0].split('&')[0];
  }

  // 2. Match parameter id=...
  // e.g. https://drive.google.com/open?id=1K304w4YGyJj7ANysRo7Flc4_LV0wYPpQ
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idMatch && idMatch[1]) {
    return idMatch[1].split('&')[0];
  }

  // 3. Match raw folder ID: Google Drive IDs are 20-50 characters alphanumeric with - or _
  // Strictly ensure it does not start with AIzaSy, has no slashes, and no spaces
  if (
    /^[a-zA-Z0-9_-]{20,50}$/.test(trimmed) &&
    !trimmed.startsWith('AIzaSy') &&
    !trimmed.includes('/') &&
    !trimmed.includes('.')
  ) {
    return trimmed;
  }

  return '';
}

/**
 * List files and subfolders inside a Google Drive Folder via Drive API v3
 * Pure API integration with strict empty state when no credentials or inaccessible.
 */
export async function listGoogleDriveFiles(
  folderId: string,
  apiKey?: string
): Promise<DriveExplorerResult> {
  const cleanFolderId = parseGoogleDriveFolderId(folderId) || folderId;
  const key = apiKey || process.env.GOOGLE_DRIVE_API_KEY || '';

  if (!cleanFolderId) {
    return {
      success: false,
      error: 'Chưa có ID hoặc liên kết thư mục Google Drive.',
      folders: [],
      images: [],
      files: [],
      currentFolder: {
        id: '',
        name: '',
      },
      folderId: '',
    };
  }

  if (!key) {
    return {
      success: false,
      error:
        'Chưa cấu hình Google Drive API Key trong trang Cài Đặt (/admin/settings) hoặc biến môi trường GOOGLE_DRIVE_API_KEY. Vui lòng cấu hình API Key để kết nối.',
      folders: [],
      images: [],
      files: [],
      currentFolder: {
        id: cleanFolderId,
        name: '',
      },
      folderId: cleanFolderId,
    };
  }

  try {
    // Query both subfolders and image files
    const q = encodeURIComponent(
      `'${cleanFolderId}' in parents and trashed = false and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/')`
    );
    const fields = encodeURIComponent(
      'files(id, name, mimeType, thumbnailLink, webContentLink, size, imageMediaMetadata, md5Checksum, modifiedTime)'
    );

    // Fetch folder name and folder content with pagination support
    const folderMetaPromise = fetch(
      `https://www.googleapis.com/drive/v3/files/${cleanFolderId}?fields=id,name&key=${key}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);

    let allRawFiles: any[] = [];
    let pageToken: string | undefined = undefined;
    let pageCount = 0;
    let hasFetchError = false;

    while (pageCount < 10) {
      const pageParam: string = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
      const fetchUrl: string = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields},nextPageToken&orderBy=folder,name&pageSize=100&key=${key}${pageParam}`;
      const filesRes = await fetch(fetchUrl);
      if (!filesRes.ok) {
        hasFetchError = true;
        break;
      }
      const pageData: any = await filesRes.json();
      if (Array.isArray(pageData.files)) {
        allRawFiles = allRawFiles.concat(pageData.files);
      }
      pageToken = pageData.nextPageToken;
      pageCount++;
      if (!pageToken) break;
    }

    if (hasFetchError && allRawFiles.length === 0) {
      return {
        success: false,
        error:
          'Không thể truy cập thư mục Google Drive này. Vui lòng kiểm tra lại quyền chia sẻ liên kết (đảm bảo chọn "Bất kỳ ai có đường liên kết đều có thể xem").',
        folders: [],
        images: [],
        files: [],
        currentFolder: {
          id: cleanFolderId,
          name: '',
        },
        folderId: cleanFolderId,
      };
    }

    const folderMeta = await folderMetaPromise;
    const currentFolderName = folderMeta?.name || 'Thư mục Drive';

    const folders: DriveFolderItem[] = [];
    const images: DriveFileItem[] = [];

    const validMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'image/avif',
      'image/svg+xml',
    ];

    for (const file of allRawFiles) {
      const fileName = file.name || '';
      const mime = (file.mimeType || '').toLowerCase();
      const size = file.size ? Number(file.size) : 0;

      // 1. Process Folders (ignore hidden folders)
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        if (!fileName.startsWith('.') && !fileName.startsWith('._')) {
          folders.push({
            id: file.id,
            name: fileName,
            mimeType: 'application/vnd.google-apps.folder',
          });
        }
      }
      // 2. Process Image Files (Strict filtering of macOS shadow files & system ghost files)
      else if (mime.includes('image/') || validMimeTypes.some((m) => mime.includes(m))) {
        if (
          fileName.startsWith('._') ||
          fileName.startsWith('.') ||
          fileName.includes('.DS_Store') ||
          fileName.endsWith('.localized') ||
          fileName.endsWith('.db')
        ) {
          continue;
        }

        if (file.size !== undefined && size <= 0) {
          continue;
        }

        const isValidMime = validMimeTypes.some((m) => mime.includes(m));
        if (!isValidMime) {
          continue;
        }

        const lh3Thumb = `https://lh3.googleusercontent.com/d/${file.id}=s400`;
        const rawThumb = file.thumbnailLink ? file.thumbnailLink.replace(/=s\d+/, '=s400') : lh3Thumb;

        images.push({
          id: file.id,
          name: fileName,
          mimeType: file.mimeType || 'image/jpeg',
          thumbnailLink: rawThumb,
          thumbnailUrl: rawThumb,
          directThumbnail: lh3Thumb,
          webContentLink: file.webContentLink,
          size: size > 0 ? size : undefined,
          width: file.imageMediaMetadata?.width,
          height: file.imageMediaMetadata?.height,
          md5Checksum: file.md5Checksum || undefined,
        });
      }
    }

    return {
      success: true,
      folders,
      images,
      files: images,
      currentFolder: {
        id: cleanFolderId,
        name: currentFolderName,
      },
      folderId: cleanFolderId,
    };
  } catch (err: any) {
    return {
      success: false,
      error:
        err.message ||
        'Không thể truy cập thư mục Google Drive này. Vui lòng kiểm tra lại quyền chia sẻ liên kết.',
      folders: [],
      images: [],
      files: [],
      currentFolder: {
        id: cleanFolderId,
        name: '',
      },
      folderId: cleanFolderId,
    };
  }
}

/**
 * Download raw image buffer from Google Drive file ID
 * CRITICAL: Downloads the full binary source file (alt=media), never low-res thumbnails
 */
export async function downloadDriveImageBuffer(
  fileId: string,
  apiKey?: string,
  fallbackUrl?: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const key = apiKey || process.env.GOOGLE_DRIVE_API_KEY || '';

  // Case 1: Drive API v3 alt=media (Official full binary original file download)
  if (key) {
    try {
      const driveApiUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${key}`;
      const res = await fetch(driveApiUrl, {
        headers: {
          Accept: 'image/*, */*',
        },
      });
      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuffer);
        if (buf.length > 1000) {
          return {
            buffer: buf,
            mimeType: res.headers.get('content-type') || 'image/jpeg',
          };
        }
      } else {
        console.warn(
          `[Drive API alt=media failed with status ${res.status} for file ${fileId}]`
        );
      }
    } catch (err: any) {
      console.warn(
        '[Drive API alt=media failed, trying direct full-res endpoints]:',
        err.message
      );
    }
  }

  // Case 3: Direct full-resolution download endpoints
  // Note: "=s0" tells Google Drive/Photos to return the unscaled 100% original binary file
  const directFullResUrls = [
    `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`,
    `https://lh3.googleusercontent.com/d/${fileId}=s0`,
    `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
  ];

  for (const url of directFullResUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/*, */*',
        },
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        // Skip if Google returned an HTML login or warning page
        if (!contentType.includes('text/html')) {
          const arrayBuffer = await res.arrayBuffer();
          const buf = Buffer.from(arrayBuffer);
          if (buf.length > 1000) {
            return {
              buffer: buf,
              mimeType: contentType || 'image/jpeg',
            };
          }
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  throw new Error(`Không thể tải dữ liệu ảnh gốc từ Google Drive File ID: ${fileId}`);
}

/**
 * Convert Image Buffer to high-resolution optimized .webp using sharp
 * Preserves luxury wedding photography clarity, skin tones and fine veil/dress details
 */
export async function convertBufferToOptimizedWebP(
  buffer: Buffer,
  originalFilename: string,
  subFolder?: string
): Promise<{
  publicUrl: string;
  filename: string;
  size: number;
  width: number;
  height: number;
}> {
  // 1. Ensure target directory exists
  const sanitizedSubFolder = subFolder ? subFolder.replace(/^\/+|\/+$/g, '') : 'products';
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', sanitizedSubFolder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 2. Clean and slugify filename
  const baseName = originalFilename
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const targetFilename = `${baseName}-${timestamp}-${randomSuffix}.webp`;
  const targetFilePath = path.join(uploadsDir, targetFilename);

  // 3. Process with sharp: High-Resolution Wedding Photography Standard
  try {
    let pipeline = sharp(buffer);
    const metadata = await pipeline.metadata();

    // Only resize if image exceeds 2048px (2K max for full-screen Lightbox)
    if (metadata.width && metadata.width > 2048) {
      pipeline = pipeline.resize({
        width: 2048,
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    // High quality WebP: quality 82%, effort 4 (optimal balance between detail and file size)
    await pipeline
      .webp({
        quality: 82,
        effort: 4,
        lossless: false,
      })
      .toFile(targetFilePath);

    // Generate responsive static variants: -sm.webp (640px) & -md.webp (1440px)
    await generateResponsiveWebPVariants(targetFilePath, targetFilePath);

    const stats = fs.statSync(targetFilePath);
    const outputMeta = await sharp(targetFilePath).metadata();

    return {
      publicUrl: `/uploads/${sanitizedSubFolder}/${targetFilename}`,
      filename: targetFilename,
      size: stats.size,
      width: outputMeta.width || metadata.width || 1920,
      height: outputMeta.height || metadata.height || 1080,
    };
  } catch (sharpError: any) {
    if (fs.existsSync(targetFilePath)) {
      try {
        fs.unlinkSync(targetFilePath);
      } catch {}
    }
    throw new Error(
      `Lỗi định dạng ảnh Sharp (${originalFilename}): ${sharpError.message || 'Không hỗ trợ định dạng này'}`
    );
  }
}

// ============================================================================
// RECURSIVE FOLDER & IMAGE SCANNING UTILITIES
// ============================================================================

export function slugifyFolder(name: string): string {
  if (!name) return 'folder';
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'folder'
  );
}

export interface ScannedFolderItem {
  id: string; // Google Drive folder ID
  name: string; // Folder display name (e.g. "Bảng giá Plus Moments" or "Gói 1")
  path: string; // Breadcrumb path: e.g. "Bảng giá Plus Moments / Gói 1"
  slug: string; // Disk/DB slug: e.g. "bang-gia-plus-moments-goi-1"
}

export interface ScannedImageItem {
  id: string; // Google Drive file ID
  name: string; // Image file name (e.g. "wedding_01.jpg")
  size?: number;
  mimeType: string;
  thumbnailLink?: string;
  folder: ScannedFolderItem;
  md5Checksum?: string;
}

export interface RecursiveScanResult {
  folders: ScannedFolderItem[];
  images: ScannedImageItem[];
}

/**
 * Recursively scans a Google Drive folder:
 * - Traverses all parent and subfolders
 * - Extracts every valid image associated with its specific folder
 * - Generates unique slugs and breadcrumb folder paths
 */
export async function getAllFilesRecursively(
  folderId: string,
  currentPath = '',
  apiKey?: string,
  visited = new Set<string>()
): Promise<RecursiveScanResult> {
  const cleanFolderId = parseGoogleDriveFolderId(folderId) || folderId;
  if (!cleanFolderId || visited.has(cleanFolderId)) {
    return { folders: [], images: [] };
  }
  visited.add(cleanFolderId);

  const key = apiKey || process.env.GOOGLE_DRIVE_API_KEY || '';
  const explorerResult = await listGoogleDriveFiles(cleanFolderId, key);

  const folderName = explorerResult.currentFolder?.name || 'Thư mục Drive';
  const fullPath = currentPath ? `${currentPath} / ${folderName}` : folderName;
  const folderSlug = slugifyFolder(fullPath.replace(/\s*\/\s*/g, '-'));

  const thisFolder: ScannedFolderItem = {
    id: cleanFolderId,
    name: folderName,
    path: fullPath,
    slug: folderSlug,
  };

  const images: ScannedImageItem[] = (explorerResult.images || []).map((img) => ({
    id: img.id,
    name: img.name,
    size: img.size,
    mimeType: img.mimeType,
    thumbnailLink: img.thumbnailLink || img.thumbnailUrl,
    folder: thisFolder,
    md5Checksum: img.md5Checksum,
  }));

  const collectedFolders: ScannedFolderItem[] = [thisFolder];
  const collectedImages: ScannedImageItem[] = [...images];

  // Recursively traverse every subfolder inside this folder
  for (const sub of explorerResult.folders || []) {
    const subResult = await getAllFilesRecursively(sub.id, fullPath, key, visited);
    collectedFolders.push(...subResult.folders);
    collectedImages.push(...subResult.images);
  }

  return {
    folders: collectedFolders,
    images: collectedImages,
  };
}

