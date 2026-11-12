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

  const smPath = path.join(dir, `${baseName}-sm.webp`);
  const mdPath = path.join(dir, `${baseName}-md.webp`);

  // Variant 1: -sm.webp (width: 640px, quality: 72, effort: 4) ~20-35 KiB
  const pSm = sharp(sourceInput)
    .resize({ width: 640, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 72, effort: 4 })
    .toFile(smPath)
    .catch((err) => {
      console.warn(`[IMAGE_VARIANTS] Failed to create -sm variant for ${targetFilePath}:`, err.message);
      return null;
    });

  // Variant 2: -md.webp (width: 1440px, quality: 78, effort: 4) ~110-140 KiB
  const pMd = sharp(sourceInput)
    .resize({ width: 1440, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: 78, effort: 4 })
    .toFile(mdPath)
    .catch((err) => {
      console.warn(`[IMAGE_VARIANTS] Failed to create -md variant for ${targetFilePath}:`, err.message);
      return null;
    });

  await Promise.all([pSm, pMd]);

  return { smPath, mdPath };
}

