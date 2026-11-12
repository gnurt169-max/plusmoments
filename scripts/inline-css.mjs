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

// 1. Tinh gọn CSS font tĩnh trên đĩa: Loại bỏ các block @font-face không dùng cho tiếng Việt (cyrillic, latin-ext)
// để loại bỏ triệt để các file font cyrillic & latin-ext dư thừa (~126 KiB)
function optimizeFontCss(css) {
  if (!css.includes('@font-face') || !css.includes('unicode-range')) {
    return css;
  }
  return css.replace(/@font-face\s*\{[^}]*\}/gi, (block) => {
    const lower = block.toLowerCase();
    const isCyrillic = lower.includes('u+0400') || lower.includes('u+0460') || lower.includes('u+0301');
    const isLatinExt = lower.includes('u+0100-02ba');
    if (isCyrillic || isLatinExt) {
      return '';
    }
    return block;
  });
}

const cssCache = new Map();

// Tối ưu trước toàn bộ file CSS trong .next/static/css
if (fs.existsSync(staticCssDir)) {
  const cssFiles = fs.readdirSync(staticCssDir).filter((f) => f.endsWith('.css'));
  for (const file of cssFiles) {
    const filePath = path.join(staticCssDir, file);
    let rawCss = fs.readFileSync(filePath, 'utf8');
    rawCss = optimizeFontCss(rawCss);
    cssCache.set(file, rawCss);
    fs.writeFileSync(filePath, rawCss, 'utf8');
    console.log(`  🔍 [inline-css] Đã tối ưu font & cache file CSS: ${file}`);
  }
}

const htmlFiles = [
  ...getHtmlFiles(serverAppDir),
  ...getHtmlFiles(serverPagesDir),
];

console.log(`⚡ [inline-css] Bắt đầu quét ${htmlFiles.length} file HTML trong .next/server...`);

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
      let rawCss = fs.readFileSync(cssFilePath, 'utf8');
      rawCss = optimizeFontCss(rawCss);
      cssCache.set(cssFilename, rawCss);
      // Ghi đè lại file CSS tĩnh trên đĩa để triệt tiêu các font dư thừa (cyrillic, latin-ext ~88 KiB)
      fs.writeFileSync(cssFilePath, rawCss, 'utf8');
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

