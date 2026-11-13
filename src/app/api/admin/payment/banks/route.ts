import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface BankItem {
  id?: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported?: number;
  lookupSupported?: number;
}

// Fallback bank list if external VietQR API is unreachable
const FALLBACK_BANKS: BankItem[] = [
  { bin: '970422', code: 'MB', shortName: 'MBBank', name: 'Ngân hàng TMCP Quân Đội', logo: 'https://api.vietqr.io/img/MB.png' },
  { bin: '970436', code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam', logo: 'https://api.vietqr.io/img/VCB.png' },
  { bin: '970415', code: 'CTG', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công Thương Việt Nam', logo: 'https://api.vietqr.io/img/CTG.png' },
  { bin: '970418', code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu Tư và Phát Triển Việt Nam', logo: 'https://api.vietqr.io/img/BIDV.png' },
  { bin: '970407', code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam', logo: 'https://api.vietqr.io/img/TCB.png' },
  { bin: '970432', code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', logo: 'https://api.vietqr.io/img/VPB.png' },
  { bin: '970416', code: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu', logo: 'https://api.vietqr.io/img/ACB.png' },
  { bin: '970423', code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng TMCP Tiên Phong', logo: 'https://api.vietqr.io/img/TPB.png' },
  { bin: '970403', code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng TMCP Sài Gòn Thương Tín', logo: 'https://api.vietqr.io/img/STB.png' },
  { bin: '970437', code: 'HDB', shortName: 'HDBank', name: 'Ngân hàng TMCP Phát Triển TP.HCM', logo: 'https://api.vietqr.io/img/HDB.png' },
  { bin: '970441', code: 'VIB', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc Tế Việt Nam', logo: 'https://api.vietqr.io/img/VIB.png' },
  { bin: '970448', code: 'OCB', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông', logo: 'https://api.vietqr.io/img/OCB.png' },
  { bin: '970443', code: 'SHB', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội', logo: 'https://api.vietqr.io/img/SHB.png' },
  { bin: '970454', code: 'VCCB', shortName: 'BVBank', name: 'Ngân hàng TMCP Bản Việt', logo: 'https://api.vietqr.io/img/VCCB.png' },
  { bin: '970426', code: 'MSB', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải', logo: 'https://api.vietqr.io/img/MSB.png' },
  { bin: '970440', code: 'SEAB', shortName: 'SeABank', name: 'Ngân hàng TMCP Đông Nam Á', logo: 'https://api.vietqr.io/img/SEAB.png' },
  { bin: '970449', code: 'LPB', shortName: 'LPBank', name: 'Ngân hàng TMCP Lộc Phát Việt Nam', logo: 'https://api.vietqr.io/img/LPB.png' },
  { bin: '970405', code: 'VAB', shortName: 'VietABank', name: 'Ngân hàng TMCP Việt Á', logo: 'https://api.vietqr.io/img/VAB.png' },
  { bin: '970428', code: 'NAB', shortName: 'Nam A Bank', name: 'Ngân hàng TMCP Nam Á', logo: 'https://api.vietqr.io/img/NAB.png' },
];

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const res = await fetch('https://api.vietqr.io/v2/banks', {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) {
      throw new Error(`VietQR API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data.code === '00' && Array.isArray(data.data)) {
      const banks = data.data.map((b: any) => ({
        id: b.id,
        name: b.name,
        code: b.code,
        bin: b.bin,
        shortName: b.shortName,
        logo: b.logo,
        transferSupported: b.transferSupported,
        lookupSupported: b.lookupSupported,
      }));

      return NextResponse.json({ success: true, banks });
    }

    return NextResponse.json({ success: true, banks: FALLBACK_BANKS });
  } catch (error: any) {
    console.warn('[VIETQR_BANKS_WARN] Could not fetch remote bank list, using fallback:', error.message);
    return NextResponse.json({ success: true, banks: FALLBACK_BANKS });
  }
}

