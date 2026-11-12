import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const serverAppDir = path.join(projectRoot, '.next', 'server', 'app');
const serverPagesDir = path.join(projectRoot, '.next', 'server', 'pages');
const staticCssDir = path.join(projectRoot, '.next', 'static', 'css');

// Helper to find all .html files recursively
function getHtmlFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = [
  ...getHtmlFiles(serverAppDir),
  ...getHtmlFiles(serverPagesDir),
];

console.log(`⚡ [inline-css] Bắt đầu quét ${htmlFiles.length} file HTML trong .next/server...`);

const cssCache = new Map();
let totalInlined = 0;

for (const htmlPath of htmlFiles) {
  let content = fs.readFileSync(htmlPath, 'utf8');
  let fileInlinedCount = 0;

  // Match <link ... rel="stylesheet" ...> or <link rel="stylesheet" ...>
  const linkRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi;

  const newContent = content.replace(linkRegex, (linkTag) => {
    const hrefMatch = linkTag.match(/href=["'](\/_next\/static\/css\/([^"']+))["']/i);
    if (!hrefMatch) return linkTag;

    const [_, fullHref, cssFilename] = hrefMatch;
    const cssFilePath = path.join(staticCssDir, cssFilename);

    if (!fs.existsSync(cssFilePath)) {
      console.warn(`  ⚠️ [inline-css] Không tìm thấy file CSS trên đĩa: ${cssFilePath}`);
      return linkTag;
    }

    if (!cssCache.has(cssFilename)) {
      cssCache.set(cssFilename, fs.readFileSync(cssFilePath, 'utf8'));
    }

    const cssContent = cssCache.get(cssFilename);
    fileInlinedCount++;
    totalInlined++;

    // Thay thế thẻ <link> chặn hiển thị bằng thẻ <style> nội tuyến với data-precedence và data-href
    return `<style data-precedence="next" data-href="${fullHref}">${cssContent}</style>`;
  });

  if (fileInlinedCount > 0) {
    fs.writeFileSync(htmlPath, newContent, 'utf8');
    console.log(`  ✅ Đã inline ${fileInlinedCount} CSS file vào ${path.relative(projectRoot, htmlPath)}`);
  }
}

console.log(`🎉 [inline-css] Đã hoàn tất inline Critical CSS! Tổng cộng ${totalInlined} thẻ stylesheet đã chuyển thành <style> nội tuyến.`);

