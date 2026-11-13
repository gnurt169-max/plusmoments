import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  console.log('⚠️ [generate-image-variants] Thư mục public/uploads không tồn tại. Bỏ qua.');
  process.exit(0);
}

function getAllWebpFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    // CHỈ bỏ qua file ẩn bắt đầu bằng dấu chấm '.' (tuyệt đối KHÔNG bỏ qua file bắt đầu bằng dấu '-')
    if (file.startsWith('.')) continue;

    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getAllWebpFiles(fullPath));
      } else if (
        file.endsWith('.webp') &&
        !file.endsWith('-sm.webp') &&
        !file.endsWith('-md.webp')
      ) {
        results.push(fullPath);
      }
    } catch {
      // bỏ qua file không thể đọc
    }
  }
  return results;
}

const allFiles = getAllWebpFiles(uploadsDir);
console.log(`⚡ [generate-image-variants] Tìm thấy ${allFiles.length} file ảnh WebP gốc trong public/uploads.`);

let processedCount = 0;
let createdSmCount = 0;
let createdMdCount = 0;
let skippedCount = 0;

async function processFile(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);

  const smPath = path.join(dir, `${baseName}-sm.webp`);
  const mdPath = path.join(dir, `${baseName}-md.webp`);

  const force = process.argv.includes('--force') || process.env.FORCE_REGENERATE === 'true';
  const needSm = force || !fs.existsSync(smPath);
  const needMd = force || !fs.existsSync(mdPath);

  if (!needSm && !needMd) {
    skippedCount++;
    return;
  }

  try {
    const tasks = [];

    if (needSm) {
      tasks.push(
        sharp(filePath)
          .resize({ width: 540, withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 75, effort: 6 })
          .toFile(smPath)
          .then(() => {
            createdSmCount++;
          })
      );
    }

    if (needMd) {
      tasks.push(
        sharp(filePath)
          .resize({ width: 1440, withoutEnlargement: true, fit: 'inside' })
          .webp({ quality: 80, effort: 5 })
          .toFile(mdPath)
          .then(() => {
            createdMdCount++;
          })
      );
    }

    await Promise.all(tasks);
    processedCount++;

    if (processedCount % 25 === 0 || processedCount === allFiles.length) {
      console.log(`  📸 Đã xử lý ${processedCount}/${allFiles.length} ảnh gốc (+${createdSmCount} -sm, +${createdMdCount} -md)...`);
    }
  } catch (err) {
    console.warn(`  ⚠️ Lỗi xử lý biến thể cho ${filePath}:`, err.message);
  }
}

// Chạy theo batch concurrency 8
async function run() {
  const concurrency = 8;
  for (let i = 0; i < allFiles.length; i += concurrency) {
    const batch = allFiles.slice(i, i + concurrency);
    await Promise.all(batch.map(processFile));
  }

  console.log(`\n==================================================`);
  console.log(`🎉 [generate-image-variants] HOÀN TẤT XỬ LÝ BIẾN THỂ ẢNH:`);
  console.log(`   - Tổng số file ảnh WebP gốc quét được: ${allFiles.length}`);
  console.log(`   - Tổng số file -sm.webp (540w) vừa tạo mới: ${createdSmCount}`);
  console.log(`   - Tổng số file -md.webp (1440w) vừa tạo mới: ${createdMdCount}`);
  console.log(`   - Số file ảnh đã có sẵn biến thể (bỏ qua): ${skippedCount}`);
  console.log(`==================================================\n`);
}

run().catch((err) => {
  console.error('Fatal error during variant generation:', err);
  process.exit(1);
});

