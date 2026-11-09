import { exportDatabaseToSeedFiles } from '../src/lib/seed-exporter';

async function main() {
  console.log('--- ĐANG TIẾN HÀNH XUẤT DATABASE SNAPSHOT RA SEED MOCKUP ---');
  const result = await exportDatabaseToSeedFiles();

  console.log('✅ ' + result.message);
  console.log('🕒 Thời gian xuất:', result.exportedAt);
  console.log('📊 Thống kê dữ liệu đã snapshot:');
  console.table(result.counts);
  console.log('📁 Đã ghi đè thành công vào:');
  console.log('   - prisma/seed.ts');
  console.log('   - prisma/seed.js');
}

main()
  .catch((err) => {
    console.error('❌ Lỗi khi xuất seed snapshot:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

