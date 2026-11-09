import { PrismaClient, AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function initSuperAdmin() {
  console.log('--- KHỞI TẠO TÀI KHOẢN TỐI CAO SUPER_ADMIN ---');
  const existing = await prisma.adminUser.findUnique({
    where: { username: 'trunglnm' },
  });

  if (!existing) {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('PlusMoments@2026Secure!', salt);

    const user = await prisma.adminUser.create({
      data: {
        username: 'trunglnm',
        fullName: 'Lê Nguyễn Minh Trung',
        email: 'trunglnm@plusmoments.vn',
        role: AdminRole.SUPER_ADMIN,
        passwordHash: hashedPassword,
        isActive: true,
      },
    });
    console.log(`✅ Đã tạo thành công tài khoản SUPER_ADMIN: ${user.username} (${user.fullName})`);
  } else {
    console.log(`ℹ️ Tài khoản SUPER_ADMIN "${existing.username}" (${existing.fullName}) đã tồn tại trong cơ sở dữ liệu.`);
  }
}

initSuperAdmin()
  .catch((err) => {
    console.error('❌ Lỗi khi khởi tạo SUPER_ADMIN:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

