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

export interface OrderConfirmationEmailProps {
  customerName: string;
  customerEmail?: string;
  phone: string;
  orderId: string;
  packageName?: string;
  packagePrice?: string;
  bookingDate?: string;
  notes?: string;
  studioHotline?: string;
  studioHotlineDisplay?: string;
  studioAddress?: string;
  zaloUrl?: string;
}

export default function OrderConfirmationEmail({
  customerName = 'Quý khách',
  customerEmail,
  phone = '0903768871',
  orderId = 'PM-2026-88',
  packageName = 'Gói Chụp Pre-Wedding Luxury',
  packagePrice,
  bookingDate,
  notes,
  studioHotline = '0903768871',
  studioHotlineDisplay = '0903.768.871',
  studioAddress = '31 Hùng Vương, Phường An Đông',
  zaloUrl = 'https://zalo.me/0903768871',
}: OrderConfirmationEmailProps) {
  const formattedOrderId = orderId.startsWith('PM-') ? orderId : `PM-${orderId.slice(-6).toUpperCase()}`;

  return (
    <Html lang="vi">
      <Head />
      <Preview>Xác nhận đặt lịch chụp ảnh cưới tại PlusMoments Studio - Mã đơn #{formattedOrderId}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* HEADER BRANDING */}
          <Section style={headerSection}>
            <Text style={brandSubtitle}>LUXURY WEDDING STUDIO</Text>
            <Heading style={brandTitle}>PLUSMOMENTS</Heading>
            <div style={badgeContainer}>
              <span style={badge}>✓ XÁC NHẬN ĐẶT LỊCH THÀNH CÔNG</span>
            </div>
          </Section>

          {/* GREETING & INTRO */}
          <Section style={contentSection}>
            <Text style={greeting}>
              Kính gửi <strong>{customerName}</strong>,
            </Text>
            <Text style={paragraph}>
              PlusMoments rất vinh hạnh được đồng hành cùng hai bạn trên hành trình lưu giữ những khoảnh khắc tình yêu tinh khôi và thiêng liêng nhất. Yêu cầu đặt lịch của bạn đã được tiếp nhận thành công vào hệ thống của studio.
            </Text>

            {/* ORDER SUMMARY CARD */}
            <Section style={summaryCard}>
              <Text style={summaryCardTitle}>THÔNG TIN CHI TIẾT ĐẶT LỊCH</Text>
              <Hr style={cardDivider} />

              <Row style={dataRow}>
                <Column style={labelCol}>Mã Đơn / Booking ID:</Column>
                <Column style={valueCol}>
                  <strong style={orderIdHighlight}>#{formattedOrderId}</strong>
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Dịch Vụ / Gói Chụp:</Column>
                <Column style={valueCol}>
                  <strong style={packageHighlight}>{packageName || 'Tư vấn theo concept riêng'}</strong>
                  {packagePrice && (
                    <Text style={priceSubtext}>Giá gói tham khảo: {packagePrice}</Text>
                  )}
                </Column>
              </Row>

              {bookingDate && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Ngày Dự Kiến Chụp:</Column>
                  <Column style={valueCol}>{bookingDate}</Column>
                </Row>
              )}

              <Row style={dataRow}>
                <Column style={labelCol}>Số Điện Thoại:</Column>
                <Column style={valueCol}>{phone}</Column>
              </Row>

              {customerEmail && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Email Nhận Báo Giá:</Column>
                  <Column style={valueCol}>{customerEmail}</Column>
                </Row>
              )}

              {notes && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Ghi Chú & Yêu Cầu:</Column>
                  <Column style={valueCol}><em>"{notes}"</em></Column>
                </Row>
              )}
            </Section>

            {/* COMMITMENT & NEXT STEPS */}
            <Section style={commitmentBox}>
              <Heading as="h3" style={commitmentTitle}>
                Quy Trình Hỗ Trợ Tiếp Theo:
              </Heading>
              <Text style={commitmentText}>
                • Chuyên viên tư vấn của PlusMoments sẽ chủ động liên hệ qua điện thoại hoặc Zalo trong vòng <strong>30 phút</strong> (khung giờ 09:00 - 21:00) để trao đổi chi tiết concept, gửi moodboard trang phục và lên lịch thử váy cưới hoàn toàn miễn phí.
              </Text>
              <Text style={commitmentText}>
                • Ưu đãi bảo lưu <strong>2.000.000đ</strong> và các quà tặng đi kèm đã được giữ trước theo số điện thoại của bạn.
              </Text>
            </Section>

            {/* ACTION BUTTONS */}
            <Section style={ctaSection}>
              <Link href={`tel:${studioHotline}`} style={primaryBtn}>
                Hotline Studio: {studioHotlineDisplay}
              </Link>
              <Link href={zaloUrl} style={secondaryBtn}>
                Chat Zalo Tư Vấn Nhanh
              </Link>
            </Section>
          </Section>

          {/* FOOTER */}
          <Section style={footerSection}>
            <Text style={footerStudioName}>PLUSMOMENTS WEDDING STUDIO</Text>
            <Text style={footerText}>
              Địa chỉ: {studioAddress} | Hotline: {studioHotlineDisplay}
            </Text>
            <Text style={footerText}>
              Website: <Link href="https://plusmoments.vn" style={footerLink}>plusmoments.vn</Link>
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerCopyright}>
              © 2026 PlusMoments Wedding Studio. Email này được gửi tự động để xác nhận yêu cầu đặt lịch của quý khách.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ==========================================
// LUXURY MINIMALIST STYLES
// ==========================================
const main = {
  backgroundColor: '#F5F2EC',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  padding: '30px 10px',
  margin: '0',
};

const container = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  maxWidth: '580px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
  border: '1px solid #EAE3D9',
};

const headerSection = {
  backgroundColor: '#1C1917',
  padding: '40px 24px 32px',
  textAlign: 'center' as const,
  borderBottom: '2px solid #D4AF37',
};

const brandSubtitle = {
  color: '#D4AF37',
  fontSize: '10px',
  fontWeight: '600',
  letterSpacing: '3px',
  textTransform: 'uppercase' as const,
  margin: '0 0 6px',
};

const brandTitle = {
  color: '#FFFFFF',
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '26px',
  fontWeight: '300',
  letterSpacing: '5px',
  margin: '0 0 16px',
};

const badgeContainer = {
  display: 'inline-block',
};

const badge = {
  backgroundColor: 'rgba(212, 175, 55, 0.15)',
  color: '#E6CA65',
  border: '1px solid #D4AF37',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: '600',
  letterSpacing: '1.5px',
  padding: '6px 14px',
  textTransform: 'uppercase' as const,
};

const contentSection = {
  padding: '36px 32px 28px',
};

const greeting = {
  fontSize: '15px',
  color: '#1C1917',
  margin: '0 0 12px',
};

const paragraph = {
  fontSize: '14px',
  lineHeight: '1.7',
  color: '#57534E',
  margin: '0 0 24px',
  fontWeight: '300',
};

const summaryCard = {
  backgroundColor: '#FAF8F5',
  borderRadius: '12px',
  border: '1px solid #EAE3D9',
  padding: '20px 22px',
  marginBottom: '24px',
};

const summaryCardTitle = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#8A7A66',
  textTransform: 'uppercase' as const,
  margin: '0 0 10px',
};

const cardDivider = {
  borderTop: '1px solid #EAE3D9',
  margin: '0 0 14px',
};

const dataRow = {
  marginBottom: '10px',
};

const labelCol = {
  width: '40%',
  fontSize: '12px',
  color: '#78716C',
  fontWeight: '500',
};

const valueCol = {
  width: '60%',
  fontSize: '13px',
  color: '#1C1917',
  textAlign: 'right' as const,
};

const orderIdHighlight = {
  fontFamily: "Menlo, Monaco, Consolas, 'Courier New', monospace",
  color: '#B45309',
  fontSize: '13px',
};

const packageHighlight = {
  color: '#1C1917',
};

const priceSubtext = {
  fontSize: '11px',
  color: '#059669',
  margin: '3px 0 0',
  fontWeight: '600',
};

const commitmentBox = {
  backgroundColor: '#F7F5F0',
  borderLeft: '3px solid #D4AF37',
  padding: '16px 18px',
  borderRadius: '4px',
  marginBottom: '28px',
};

const commitmentTitle = {
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#1C1917',
  textTransform: 'uppercase' as const,
  margin: '0 0 8px',
};

const commitmentText = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#57534E',
  margin: '4px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '10px',
};

const primaryBtn = {
  display: 'inline-block',
  backgroundColor: '#1C1917',
  color: '#FFFFFF',
  padding: '12px 22px',
  borderRadius: '25px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  textTransform: 'uppercase' as const,
  margin: '0 6px 8px',
};

const secondaryBtn = {
  display: 'inline-block',
  backgroundColor: '#0068FF',
  color: '#FFFFFF',
  padding: '12px 22px',
  borderRadius: '25px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  margin: '0 6px 8px',
};

const footerSection = {
  backgroundColor: '#FAF8F5',
  borderTop: '1px solid #EAE3D9',
  padding: '24px 28px',
  textAlign: 'center' as const,
};

const footerStudioName = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#1C1917',
  margin: '0 0 6px',
};

const footerText = {
  fontSize: '11px',
  color: '#78716C',
  margin: '3px 0',
};

const footerLink = {
  color: '#B45309',
  textDecoration: 'none',
};

const footerDivider = {
  borderTop: '1px solid #E7DFD5',
  margin: '14px 0',
};

const footerCopyright = {
  fontSize: '10px',
  color: '#A8A29E',
  margin: '0',
  lineHeight: '1.5',
};

