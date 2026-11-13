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


