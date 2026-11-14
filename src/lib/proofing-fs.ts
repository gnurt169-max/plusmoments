import fs from 'fs';
import path from 'path';

export interface ProofingImageFile {
  fileName: string;
  url: string;
  thumbUrl: string;
  smallUrl: string;
  sizeBytes: number;
}

export function resolveFolderPhysicalDir(folderSlug: string): { dir: string; baseUrl: string } | null {
  if (!folderSlug || typeof folderSlug !== 'string') return null;
  const cleanSlug = folderSlug.trim();

  // 1. Try public/uploads/folders/[folderSlug]
  const dir1 = path.join(process.cwd(), 'public', 'uploads', 'folders', cleanSlug);
  if (fs.existsSync(dir1) && fs.statSync(dir1).isDirectory()) {
    return { dir: dir1, baseUrl: `/uploads/folders/${cleanSlug}` };
  }

  // 2. Try public/uploads/[folderSlug]
  const dir2 = path.join(process.cwd(), 'public', 'uploads', cleanSlug);
  if (fs.existsSync(dir2) && fs.statSync(dir2).isDirectory()) {
    return { dir: dir2, baseUrl: `/uploads/${cleanSlug}` };
  }

  return null;
}

export function scanProofingFolderImages(folderSlug: string): ProofingImageFile[] {
  const resolved = resolveFolderPhysicalDir(folderSlug);
  if (!resolved) return [];

  const { dir, baseUrl } = resolved;
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    console.error('[PROOFING_SCAN_ERROR]:', err);
    return [];
  }

  const allFiles = new Set(entries.filter((e) => e.isFile()).map((e) => e.name));
  const validImageExts = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);
  const images: ProofingImageFile[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!validImageExts.has(ext)) continue;

    // Skip thumbnail variants: -md.webp, -sm.webp
    if (entry.name.endsWith('-md.webp') || entry.name.endsWith('-sm.webp')) {
      continue;
    }

    const baseNameWithoutExt = entry.name.slice(0, -ext.length);
    const mdVariant = `${baseNameWithoutExt}-md.webp`;
    const smVariant = `${baseNameWithoutExt}-sm.webp`;

    const fullPath = path.join(dir, entry.name);
    let sizeBytes = 0;
    try {
      sizeBytes = fs.statSync(fullPath).size;
    } catch {}

    const url = `${baseUrl}/${entry.name}`;
    const thumbUrl = allFiles.has(mdVariant) ? `${baseUrl}/${mdVariant}` : url;
    const smallUrl = allFiles.has(smVariant) ? `${baseUrl}/${smVariant}` : thumbUrl;

    images.push({
      fileName: entry.name,
      url,
      thumbUrl,
      smallUrl,
      sizeBytes,
    });
  }

  // Natural numeric sort (e.g. img_1, img_2, img_10)
  images.sort((a, b) => a.fileName.localeCompare(b.fileName, undefined, { numeric: true }));

  return images;
}
