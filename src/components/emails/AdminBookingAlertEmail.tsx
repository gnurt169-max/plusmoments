import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Hr,
} from '@react-email/components';

export interface AdminBookingAlertEmailProps {
  orderId: string;
  customerName: string;
  phone: string;
  zalo?: string | null;
  customerEmail?: string | null;
  packageName?: string | null;
  weddingDate?: string | null;
  estimatedBudget?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
  utmSource?: string | null;
  createdAt?: string;
  adminDashboardUrl?: string;
}

export default function AdminBookingAlertEmail({
  orderId = 'PM-2026-88',
  customerName = 'Khách Hàng',
  phone = '0903768871',
  zalo,
  customerEmail,
  packageName = 'Gói Chụp Pre-Wedding Luxury',
  weddingDate,
  estimatedBudget,
  notes,
  sourceUrl,
  utmSource,
  createdAt,
  adminDashboardUrl = 'https://plusmoments.vn/admin/leads',
}: AdminBookingAlertEmailProps) {
  const formattedOrderId = orderId.startsWith('PM-') ? orderId : `PM-${orderId.slice(-6).toUpperCase()}`;
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  return (
    <Html lang="vi">
      <Head />
      <Preview>🔔 [ĐƠN MỚI] {customerName} ({phone}) - {packageName || 'Tư Vấn'}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* HEADER */}
          <Section style={headerSection}>
            <div style={badgeContainer}>
              <span style={badge}>🔔 THÔNG BÁO KHÁCH HÀNG MỚI</span>
            </div>
            <Heading style={title}>PlusMoments CRM</Heading>
            <Text style={subtitle}>Có yêu cầu tư vấn / đặt lịch chụp ảnh cưới mới</Text>
          </Section>

          {/* MAIN CONTENT */}
          <Section style={contentSection}>
            {/* LEAD INFO CARD */}
            <Section style={leadCard}>
              <Row style={dataRow}>
                <Column style={labelCol}>Mã Booking:</Column>
                <Column style={valueCol}>
                  <strong style={orderIdHighlight}>#{formattedOrderId}</strong>
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Họ Tên Dâu Rể:</Column>
                <Column style={valueCol}>
                  <strong style={nameHighlight}>{customerName}</strong>
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Số Điện Thoại:</Column>
                <Column style={valueCol}>
                  <Link href={`tel:${cleanPhone}`} style={phoneLink}>
                    📞 {phone}
                  </Link>
                </Column>
              </Row>

              {zalo && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Zalo:</Column>
                  <Column style={valueCol}>
                    <Link href={`https://zalo.me/${zalo.replace(/[^0-9]/g, '')}`} style={zaloLink}>
                      💬 {zalo}
                    </Link>
                  </Column>
                </Row>
              )}

              {customerEmail && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Email Khách:</Column>
                  <Column style={valueCol}>{customerEmail}</Column>
                </Row>
              )}

              <Row style={dataRow}>
                <Column style={labelCol}>Gói Quan Tâm:</Column>
                <Column style={valueCol}>
                  <strong style={packageHighlight}>{packageName || 'Tư vấn theo yêu cầu'}</strong>
                </Column>
              </Row>

              {weddingDate && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Ngày Dự Kiến Cưới/Chụp:</Column>
                  <Column style={valueCol}>{weddingDate}</Column>
                </Row>
              )}

              {estimatedBudget && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Dự Kiến Ngân Sách:</Column>
                  <Column style={valueCol}>{estimatedBudget}</Column>
                </Row>
              )}

              {notes && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Ghi Chú Khách:</Column>
                  <Column style={valueCol}><em>"{notes}"</em></Column>
                </Row>
              )}

              {sourceUrl && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Trang Gửi Form:</Column>
                  <Column style={valueCol}><span style={sourceText}>{sourceUrl}</span></Column>
                </Row>
              )}

              {utmSource && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Kênh Quảng Cáo:</Column>
                  <Column style={valueCol}>{utmSource}</Column>
                </Row>
              )}

              {createdAt && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Thời Gian Tiếp Nhận:</Column>
                  <Column style={valueCol}>{createdAt}</Column>
                </Row>
              )}
            </Section>

            {/* ACTION BUTTONS */}
            <Section style={ctaSection}>
              <Link href={adminDashboardUrl} style={primaryBtn}>
                Mở CMS Quản Lý Khách Hàng
              </Link>
              <Link href={`tel:${cleanPhone}`} style={callBtn}>
                Gọi Ngay Cho Khách
              </Link>
            </Section>
          </Section>

          {/* FOOTER */}
          <Section style={footerSection}>
            <Text style={footerCopyright}>
              Hệ thống thông báo tự động PlusMoments CRM • Đảm bảo liên hệ chăm sóc khách hàng trong vòng 15 phút.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// STYLES
const main = {
  backgroundColor: '#F5F2EC',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '24px 10px',
  margin: '0',
};

const container = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  maxWidth: '560px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  border: '1px solid #EAE3D9',
};

const headerSection = {
  backgroundColor: '#1C1917',
  padding: '30px 24px',
  textAlign: 'center' as const,
};

const badgeContainer = {
  display: 'inline-block',
  marginBottom: '10px',
};

const badge = {
  backgroundColor: '#B45309',
  color: '#FFFFFF',
  borderRadius: '16px',
  fontSize: '10px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '4px 12px',
  textTransform: 'uppercase' as const,
};

const title = {
  color: '#FFFFFF',
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '22px',
  fontWeight: '400',
  letterSpacing: '2px',
  margin: '0 0 4px',
};

const subtitle = {
  color: '#A8A29E',
  fontSize: '12px',
  margin: '0',
};

const contentSection = {
  padding: '28px 24px 20px',
};

const leadCard = {
  backgroundColor: '#FAF8F5',
  borderRadius: '12px',
  border: '1px solid #EAE3D9',
  padding: '18px 20px',
  marginBottom: '20px',
};

const dataRow = {
  marginBottom: '9px',
};

const labelCol = {
  width: '42%',
  fontSize: '12px',
  color: '#78716C',
  fontWeight: '500',
};

const valueCol = {
  width: '58%',
  fontSize: '13px',
  color: '#1C1917',
  textAlign: 'right' as const,
};

const orderIdHighlight = {
  fontFamily: "Menlo, Monaco, Consolas, monospace",
  color: '#B45309',
};

const nameHighlight = {
  color: '#1C1917',
  fontSize: '14px',
};

const packageHighlight = {
  color: '#B45309',
};

const phoneLink = {
  color: '#059669',
  fontWeight: '700',
  textDecoration: 'none',
  fontSize: '14px',
};

const zaloLink = {
  color: '#0068FF',
  fontWeight: '600',
  textDecoration: 'none',
};

const sourceText = {
  fontSize: '11px',
  color: '#78716C',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '10px',
};

const primaryBtn = {
  display: 'inline-block',
  backgroundColor: '#1C1917',
  color: '#FFFFFF',
  padding: '11px 20px',
  borderRadius: '20px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  margin: '0 4px 8px',
};

const callBtn = {
  display: 'inline-block',
  backgroundColor: '#059669',
  color: '#FFFFFF',
  padding: '11px 20px',
  borderRadius: '20px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  margin: '0 4px 8px',
};

const footerSection = {
  backgroundColor: '#FAF8F5',
  borderTop: '1px solid #EAE3D9',
  padding: '16px 20px',
  textAlign: 'center' as const,
};

const footerCopyright = {
  fontSize: '11px',
  color: '#A8A29E',
  margin: '0',
};

