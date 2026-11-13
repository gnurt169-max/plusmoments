import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '../public/uploads');

let scannedVariants = 0;
let deletedOrphans = 0;
let freedBytes = 0;

function formatMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function scanAndCleanOrphans(dirPath) {
  if (!fs.existsSync(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    // Only skip hidden files starting with '.'
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      scanAndCleanOrphans(fullPath);
    } else if (entry.isFile()) {
      const isSm = entry.name.endsWith('-sm.webp');
      const isMd = entry.name.endsWith('-md.webp');

      if (!isSm && !isMd) continue;

      scannedVariants++;

      // Determine expected original .webp path
      const suffixLength = 8; // '-sm.webp' or '-md.webp' is 8 chars
      const baseNameWithoutVariant = entry.name.slice(0, -suffixLength);
      const originalFileName = `${baseNameWithoutVariant}.webp`;
      const originalFilePath = path.join(dirPath, originalFileName);

      if (!fs.existsSync(originalFilePath)) {
        try {
          const stats = fs.statSync(fullPath);
          const fileSize = stats.size || 0;
          fs.unlinkSync(fullPath);
          deletedOrphans++;
          freedBytes += fileSize;
          const relPath = path.relative(UPLOADS_DIR, fullPath);
          console.log(`🗑️  Đã xóa biến thể mồ côi: ${relPath} (${(fileSize / 1024).toFixed(1)} KB)`);
        } catch (err) {
          console.warn(`⚠️ Không thể xóa ${fullPath}:`, err.message);
        }
      }
    }
  }
}

console.log(`🔍 [images:cleanup] Đang quét các file biến thể (-sm.webp, -md.webp) trong: ${UPLOADS_DIR}...`);
scanAndCleanOrphans(UPLOADS_DIR);
console.log('==================================================');
console.log(`✅ Hoàn tất dọn dẹp biến thể mồ côi!`);
console.log(`   - Tổng số file biến thể đã kiểm tra : ${scannedVariants}`);
console.log(`   - Tổng số biến thể mồ côi đã xóa    : ${deletedOrphans}`);
console.log(`   - Tổng dung lượng ổ đĩa giải phóng  : ${formatMB(freedBytes)} MB (${(freedBytes / 1024).toFixed(1)} KB)`);
console.log('==================================================');

