import fs from 'fs/promises';
import path from 'path';

/**
 * Synchronizes new password hash directly into static seed/mockup files:
 * - prisma/seed.ts
 * - prisma/seed.js
 * - src/lib/seed-exporter.ts
 *
 * This ensures that even when the server restarts, databases re-seed, or VPS is deployed,
 * the newly changed password remains the permanent static mockup value.
 */
export async function syncSuperAdminPasswordToSeeds(newPasswordHash: string): Promise<boolean> {
  const rootDir = process.cwd();
  const seedTsPath = path.join(rootDir, 'prisma', 'seed.ts');
  const seedJsPath = path.join(rootDir, 'prisma', 'seed.js');
  const seedExporterPath = path.join(rootDir, 'src', 'lib', 'seed-exporter.ts');

  let updatedCount = 0;

  // 1. Update prisma/seed.ts
  try {
    let content = await fs.readFile(seedTsPath, 'utf-8');

    // Replace in snapshot JSON object if exists
    if (content.includes('"superAdminPasswordHash"')) {
      content = content.replace(
        /"superAdminPasswordHash":\s*"[^"]+"/g,
        `"superAdminPasswordHash": "${newPasswordHash}"`
      );
    }

    // Replace in adminUser create block
    content = content.replace(
      /passwordHash:\s*['"]\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}['"]/g,
      `passwordHash: '${newPasswordHash}'`
    );

    await fs.writeFile(seedTsPath, content, 'utf-8');
    updatedCount++;
    console.log('[SEED SYNC] ✓ Successfully synchronized new Super Admin password hash into prisma/seed.ts');
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not update prisma/seed.ts:', err);
  }

  // 2. Update prisma/seed.js
  try {
    let content = await fs.readFile(seedJsPath, 'utf-8');

    if (content.includes('"superAdminPasswordHash"')) {
      content = content.replace(
        /"superAdminPasswordHash":\s*"[^"]+"/g,
        `"superAdminPasswordHash": "${newPasswordHash}"`
      );
    }

    content = content.replace(
      /passwordHash:\s*['"]\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}['"]/g,
      `passwordHash: '${newPasswordHash}'`
    );

    await fs.writeFile(seedJsPath, content, 'utf-8');
    updatedCount++;
    console.log('[SEED SYNC] ✓ Successfully synchronized new Super Admin password hash into prisma/seed.js');
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not update prisma/seed.js:', err);
  }

  // 3. Update src/lib/seed-exporter.ts template generator
  try {
    let content = await fs.readFile(seedExporterPath, 'utf-8');

    content = content.replace(
      /passwordHash:\s*['"]\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}['"]/g,
      `passwordHash: '${newPasswordHash}'`
    );

    content = content.replace(
      /superAdminPasswordHash:\s*['"]\$2[aby]\$[0-9]{2}\$[A-Za-z0-9./]{53}['"]/g,
      `superAdminPasswordHash: '${newPasswordHash}'`
    );

    await fs.writeFile(seedExporterPath, content, 'utf-8');
    updatedCount++;
    console.log('[SEED SYNC] ✓ Successfully synchronized new Super Admin password hash into src/lib/seed-exporter.ts');
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not update src/lib/seed-exporter.ts:', err);
  }

  return updatedCount > 0;
}

export interface BankSeedData {
  bankBin: string;
  bankShortName: string;
  bankAccountNumber: string;
  bankAccountName?: string;
  paymentWebhookKey?: string;
}

/**
 * Synchronizes Bank and VietQR configuration directly into:
 * - src/lib/settings.ts defaultSettings fallback values
 * - prisma/seed.ts (permanent database seed snapshot)
 * - prisma/seed.js (runtime database seed snapshot)
 */
export async function syncBankSettingsToSeeds(bankData: BankSeedData): Promise<boolean> {
  const rootDir = process.cwd();
  const settingsTsPath = path.join(rootDir, 'src', 'lib', 'settings.ts');

  // 1. Update src/lib/settings.ts fallback defaults
  try {
    let settingsContent = await fs.readFile(settingsTsPath, 'utf-8');

    if (bankData.bankBin) {
      settingsContent = settingsContent.replace(/bankBin:\s*['"][^'"]*['"]/g, `bankBin: '${bankData.bankBin}'`);
    }
    if (bankData.bankShortName) {
      settingsContent = settingsContent.replace(/bankShortName:\s*['"][^'"]*['"]/g, `bankShortName: '${bankData.bankShortName}'`);
    }
    if (bankData.bankAccountNumber !== undefined) {
      settingsContent = settingsContent.replace(/bankAccountNumber:\s*['"][^'"]*['"]/g, `bankAccountNumber: '${bankData.bankAccountNumber}'`);
    }
    if (bankData.bankAccountName !== undefined) {
      settingsContent = settingsContent.replace(/bankAccountName:\s*['"][^'"]*['"]/g, `bankAccountName: '${bankData.bankAccountName}'`);
    }
    if (bankData.paymentWebhookKey !== undefined) {
      settingsContent = settingsContent.replace(/paymentWebhookKey:\s*['"][^'"]*['"]/g, `paymentWebhookKey: '${bankData.paymentWebhookKey}'`);
    }

    await fs.writeFile(settingsTsPath, settingsContent, 'utf-8');
    console.log('[SEED SYNC] ✓ Successfully updated default bank settings in src/lib/settings.ts');
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not update src/lib/settings.ts:', err);
  }

  // 2. Export full current database snapshot (including updated bank settings) to prisma/seed.ts & prisma/seed.js
  try {
    const { exportDatabaseToSeedFiles } = await import('@/lib/seed-exporter');
    await exportDatabaseToSeedFiles();
    console.log('[SEED SYNC] ✓ Successfully synchronized bank configuration into prisma/seed.ts and prisma/seed.js');
    return true;
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not export to seed files:', err);
    return false;
  }
}

/**
 * Synchronizes adminReceiverEmail directly into:
 * - database NotificationSetting
 * - prisma/seed.ts (permanent database seed snapshot)
 * - prisma/seed.js (runtime database seed snapshot)
 */
export async function syncNotificationEmailToSeeds(email: string): Promise<boolean> {
  const rootDir = process.cwd();
  const seedTsPath = path.join(rootDir, 'prisma', 'seed.ts');
  const seedJsPath = path.join(rootDir, 'prisma', 'seed.js');

  const cleanEmail = email.trim();
  let updatedCount = 0;

  // 1. Update database record first so exportDatabaseToSeedFiles captures it cleanly
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.notificationSetting.upsert({
      where: { id: 'default' },
      update: { adminReceiverEmail: cleanEmail },
      create: { id: 'default', adminReceiverEmail: cleanEmail },
    });
  } catch (dbErr) {
    console.warn('[SEED SYNC WARN] Could not update notificationSetting in DB:', dbErr);
  }

  // 2. Export complete database snapshot to seed files
  try {
    const { exportDatabaseToSeedFiles } = await import('@/lib/seed-exporter');
    await exportDatabaseToSeedFiles();
    console.log('[SEED SYNC] ✓ Exported database snapshot with updated adminReceiverEmail to seed files');
    updatedCount++;
  } catch (exportErr) {
    console.warn('[SEED SYNC WARN] Could not export to seed files:', exportErr);
  }

  // 3. Guarantee direct replacement in seed files
  try {
    let content = await fs.readFile(seedTsPath, 'utf-8');
    if (!content.includes(`"adminReceiverEmail": "${cleanEmail}"`)) {
      content = content.replace(/"adminReceiverEmail":\s*"[^"]*"/g, `"adminReceiverEmail": "${cleanEmail}"`);
      await fs.writeFile(seedTsPath, content, 'utf-8');
    }
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not update prisma/seed.ts:', err);
  }

  try {
    let content = await fs.readFile(seedJsPath, 'utf-8');
    if (!content.includes(`"adminReceiverEmail": "${cleanEmail}"`)) {
      content = content.replace(/"adminReceiverEmail":\s*"[^"]*"/g, `"adminReceiverEmail": "${cleanEmail}"`);
      await fs.writeFile(seedJsPath, content, 'utf-8');
    }
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not update prisma/seed.js:', err);
  }

  return updatedCount > 0;
}

export interface SmtpSeedData {
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPass?: string;
  emailFrom?: string;
  adminNotifyEmail?: string;
  consultLeadEmailSubject?: string | null;
  consultLeadEmailBody?: string | null;
  packageOrderEmailSubject?: string | null;
  packageOrderEmailBody?: string | null;
}

/**
 * Synchronizes complete SMTP Email Pro settings directly into:
 * - src/lib/settings.ts defaultSettings fallback
 * - prisma/seed.ts (permanent database seed snapshot)
 * - prisma/seed.js (runtime database seed snapshot)
 */
export async function syncSmtpSettingsToSeeds(data: SmtpSeedData): Promise<boolean> {
  const rootDir = process.cwd();
  const settingsTsPath = path.join(rootDir, 'src', 'lib', 'settings.ts');

  // 1. Update fallback values in src/lib/settings.ts
  try {
    let settingsContent = await fs.readFile(settingsTsPath, 'utf-8');
    if (data.smtpEnabled !== undefined) {
      settingsContent = settingsContent.replace(/smtpEnabled:\s*(true|false)/g, `smtpEnabled: ${data.smtpEnabled}`);
    }
    if (data.smtpHost !== undefined) {
      settingsContent = settingsContent.replace(/smtpHost:\s*['"][^'"]*['"]/g, `smtpHost: '${data.smtpHost}'`);
    }
    if (data.smtpPort !== undefined) {
      settingsContent = settingsContent.replace(/smtpPort:\s*[0-9]+/g, `smtpPort: ${data.smtpPort}`);
    }
    if (data.smtpSecure !== undefined) {
      settingsContent = settingsContent.replace(/smtpSecure:\s*(true|false)/g, `smtpSecure: ${data.smtpSecure}`);
    }
    if (data.smtpUser !== undefined) {
      settingsContent = settingsContent.replace(/smtpUser:\s*['"][^'"]*['"]/g, `smtpUser: '${data.smtpUser}'`);
    }
    if (data.smtpPass !== undefined) {
      settingsContent = settingsContent.replace(/smtpPass:\s*['"][^'"]*['"]/g, `smtpPass: '${data.smtpPass}'`);
    }
    if (data.emailFrom !== undefined) {
      settingsContent = settingsContent.replace(/emailFrom:\s*['"][^'"]*['"]/g, `emailFrom: '${data.emailFrom}'`);
    }
    if (data.adminNotifyEmail !== undefined) {
      settingsContent = settingsContent.replace(/adminNotifyEmail:\s*['"][^'"]*['"]/g, `adminNotifyEmail: '${data.adminNotifyEmail}'`);
    }
    await fs.writeFile(settingsTsPath, settingsContent, 'utf-8');
    console.log('[SEED SYNC] ✓ Successfully updated default SMTP settings in src/lib/settings.ts');
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not update src/lib/settings.ts:', err);
  }

  // 2. Export full current database snapshot (with updated SMTP config) to prisma/seed.ts & prisma/seed.js
  try {
    const { exportDatabaseToSeedFiles } = await import('@/lib/seed-exporter');
    await exportDatabaseToSeedFiles();
    console.log('[SEED SYNC] ✓ Successfully synchronized SMTP configuration into prisma/seed.ts and prisma/seed.js');
    return true;
  } catch (err) {
    console.warn('[SEED SYNC WARN] Could not export to seed files:', err);
    return false;
  }
}
