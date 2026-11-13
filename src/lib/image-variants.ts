import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Generates responsive WebP variants (-sm.webp @ 640px and -md.webp @ 1440px)
 * alongside a base WebP file.
 *
 * @param sourceInput File path on disk or Buffer in RAM
 * @param targetFilePath The full disk path to the original .webp file
 */
export async function generateResponsiveWebPVariants(
  sourceInput: string | Buffer,
  targetFilePath: string
): Promise<{ smPath: string; mdPath: string }> {
  const dir = path.dirname(targetFilePath);
  const ext = path.extname(targetFilePath);
  const baseName = path.basename(targetFilePath, ext);

  // Defensive guard: Never generate variants of an existing variant
  if (baseName.endsWith('-sm') || baseName.endsWith('-md')) {
    return { smPath: targetFilePath, mdPath: targetFilePath };
  }

  // Ensure target directory exists
  if (!fs.existsSync(dir)) {
    await fs.promises.mkdir(dir, { recursive: true });
  }

  const smPath = path.join(dir, `${baseName}-sm.webp`);
  const mdPath = path.join(dir, `${baseName}-md.webp`);

  try {
    const inputBuffer = Buffer.isBuffer(sourceInput)
      ? sourceInput
      : await fs.promises.readFile(sourceInput);

    // Variant 1: -sm.webp (width: 540px, quality: 75, effort: 6) ~15-25 KiB
    const pSm = sharp(inputBuffer)
      .resize({ width: 540, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 75, effort: 6 })
      .toFile(smPath)
      .catch((err) => {
        console.warn(`[IMAGE_VARIANTS] Failed to create -sm variant for ${targetFilePath}:`, err.message);
        return null;
      });

    // Variant 2: -md.webp (width: 1440px, quality: 80, effort: 5) ~110-140 KiB
    const pMd = sharp(inputBuffer)
      .resize({ width: 1440, withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: 80, effort: 5 })
      .toFile(mdPath)
      .catch((err) => {
        console.warn(`[IMAGE_VARIANTS] Failed to create -md variant for ${targetFilePath}:`, err.message);
        return null;
      });

    await Promise.all([pSm, pMd]);
  } catch (err: any) {
    console.warn(`[IMAGE_VARIANTS] Failed to process variants for ${targetFilePath}:`, err.message);
  }

  return { smPath, mdPath };
}

/**
 * Default warm-beige (#F3EFEA) tiny 16x16 SVG data URL fallback
 */
export const DEFAULT_WARM_BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YzRUZFQSIvPjwvc3ZnPg==';

/**
 * Generates a tiny 16px blurred WebP Base64 placeholder (~150-250 bytes) for instant blur-up rendering.
 */
export async function generateTinyBlurDataUrl(
  inputBufferOrPath: Buffer | string
): Promise<string> {
  try {
    const inputBuffer = Buffer.isBuffer(inputBufferOrPath)
      ? inputBufferOrPath
      : await fs.promises.readFile(inputBufferOrPath);

    const tinyBuffer = await sharp(inputBuffer)
      .resize({ width: 16, withoutEnlargement: true })
      .blur(1)
      .webp({ quality: 20 })
      .toBuffer();

    return `data:image/webp;base64,${tinyBuffer.toString('base64')}`;
  } catch {
    return DEFAULT_WARM_BLUR_DATA_URL;
  }
}

/**
 * Resolves a public URL (e.g. /uploads/...) to a 16px Base64 blurDataUrl if the file exists on disk,
 * otherwise returns DEFAULT_WARM_BLUR_DATA_URL.
 */
export async function resolvePublicUrlBlurDataUrl(publicUrl: string): Promise<string> {
  if (!publicUrl || !publicUrl.startsWith('/uploads/') || publicUrl.includes('..')) {
    return DEFAULT_WARM_BLUR_DATA_URL;
  }
  const fullPath = path.join(process.cwd(), 'public', publicUrl.replace(/^\//, '').split('?')[0]);
  if (!fs.existsSync(fullPath)) {
    return DEFAULT_WARM_BLUR_DATA_URL;
  }
  return generateTinyBlurDataUrl(fullPath);
}

/**
 * Safely deletes an original image file along with its responsive WebP variants (-sm.webp & -md.webp)
 * using Promise.allSettled so missing variants never throw a 500 error.
 */
export async function deleteImageWithVariants(absoluteOriginalPath: string): Promise<void> {
  const pathsToDelete = [absoluteOriginalPath];
  if (
    absoluteOriginalPath.endsWith('.webp') &&
    !absoluteOriginalPath.endsWith('-sm.webp') &&
    !absoluteOriginalPath.endsWith('-md.webp')
  ) {
    const base = absoluteOriginalPath.slice(0, -5);
    pathsToDelete.push(`${base}-sm.webp`, `${base}-md.webp`);
  }
  await Promise.allSettled(
    pathsToDelete.map((filePath) => fs.promises.unlink(filePath).catch(() => {}))
  );
}


