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

export interface LeadCustomerConfirmationEmailProps {
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  leadId?: string;
  conceptOfInterest?: string;
  eventDate?: string;
  budgetRange?: string;
  notes?: string;
  studioHotline?: string;
  studioHotlineDisplay?: string;
  studioAddress?: string;
  zaloUrl?: string;
}

export default function LeadCustomerConfirmationEmail({
  customerName = 'Quý Khách',
  customerEmail,
  customerPhone,
  leadId = 'PM-LEAD-88',
  conceptOfInterest = 'Pre-Wedding Luxury & Studio Editorial',
  eventDate,
  budgetRange,
  notes,
  studioHotline = '0903768871',
  studioHotlineDisplay = '0903.768.871',
  studioAddress = '31 Hùng Vương, Phường An Đông',
  zaloUrl = 'https://zalo.me/0903768871',
}: LeadCustomerConfirmationEmailProps) {
  const formattedLeadId = leadId.startsWith('PM-') ? leadId : `PM-${leadId.slice(-6).toUpperCase()}`;

  return (
    <Html lang="vi">
      <Head />
      <Preview>[PlusMoments] Đã tiếp nhận đăng ký nhận ưu đãi & catalog ảnh cưới của bạn</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* HEADER BRANDING */}
          <Section style={headerSection}>
            <Text style={brandSubtitle}>LUXURY WEDDING STUDIO</Text>
            <Heading style={brandTitle}>PLUSMOMENTS</Heading>
            <div style={badgeContainer}>
              <span style={badge}>✓ BẢO LƯU ƯU ĐÃI 2.000.000Đ THÀNH CÔNG</span>
            </div>
          </Section>

          {/* GREETING & INTRO */}
          <Section style={contentSection}>
            <Text style={greeting}>
              Kính gửi <strong>{customerName}</strong>,
            </Text>
            <Text style={paragraph}>
              PlusMoments đã ghi nhận thông tin đăng ký tư vấn gói chụp của hai bạn và đã <strong>kích hoạt mã bảo lưu ưu đãi 2.000.000đ</strong>. Chuyên viên tư vấn của studio sẽ chủ động liên hệ qua SĐT/Zalo trong ít phút để gửi trọn bộ catalog ảnh cưới và tư vấn chi tiết concept.
            </Text>

            {/* REQUEST SUMMARY CARD */}
            <Section style={summaryCard}>
              <Text style={summaryCardTitle}>TÓM TẮT YÊU CẦU TƯ VẤN</Text>
              <Hr style={cardDivider} />

              <Row style={dataRow}>
                <Column style={labelCol}>Mã Đăng Ký:</Column>
                <Column style={valueCol}>
                  <strong style={orderIdHighlight}>#{formattedLeadId}</strong>
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Dâu Rể:</Column>
                <Column style={valueCol}>
                  <strong style={nameHighlight}>{customerName}</strong>
                </Column>
              </Row>

              {customerPhone && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Số Điện Thoại:</Column>
                  <Column style={valueCol}>{customerPhone}</Column>
                </Row>
              )}

              <Row style={dataRow}>
                <Column style={labelCol}>Concept Quan Tâm:</Column>
                <Column style={valueCol}>
                  <strong style={conceptHighlight}>{conceptOfInterest || 'Tư vấn theo concept riêng'}</strong>
                </Column>
              </Row>

              {eventDate && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Thời Gian Dự Kiến:</Column>
                  <Column style={valueCol}>{eventDate}</Column>
                </Row>
              )}

              {budgetRange && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Ngân Sách Dự Kiến:</Column>
                  <Column style={valueCol}>{budgetRange}</Column>
                </Row>
              )}

              {notes && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Ghi Chú Riêng:</Column>
                  <Column style={valueCol}>{notes}</Column>
                </Row>
              )}
            </Section>

            {/* PROMISE & COMMITMENT */}
            <Section style={promiseBox}>
              <Text style={promiseTitle}>CAM KẾT DỊCH VỤ TẠI PLUSMOMENTS</Text>
              <Text style={promiseItem}>• <strong>Không phát sinh chi phí:</strong> Toàn bộ trang phục cưới cao cấp, makeup stylist và xe đưa đón nội ô đều trọn gói.</Text>
              <Text style={promiseItem}>• <strong>Chất lượng Cinematic:</strong> Mỗi album là một tác phẩm mang hơi thở điện ảnh, màu sắc trường tồn cùng thời gian.</Text>
              <Text style={promiseItem}>• <strong>Bảo lưu voucher 2.000.000đ:</strong> Áp dụng trực tiếp vào hợp đồng khi bạn chốt lịch chụp trong tháng này.</Text>
            </Section>

            {/* CALL TO ACTION BUTTON */}
            <Section style={ctaSection}>
              <Link href={zaloUrl} style={primaryButton}>
                💬 Nhắn Zalo Studio Nhận Catalog Ngay
              </Link>
            </Section>
          </Section>

          {/* FOOTER */}
          <Section style={footerSection}>
            <Text style={footerBrand}>PLUSMOMENTS WEDDING STUDIO</Text>
            <Text style={footerText}>Hotline CSKH: <strong>{studioHotlineDisplay}</strong></Text>
            <Text style={footerText}>Địa chỉ: {studioAddress}</Text>
            <Text style={footerCopyright}>© {new Date().getFullYear()} PlusMoments. Mọi quyền được bảo lưu.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// -----------------------------------------------------------------------------
// LUXURY MINIMALIST STYLES
// -----------------------------------------------------------------------------
const main = {
  backgroundColor: '#F5F5F0',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '30px 0',
};

const container = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  border: '1px solid #E7E5E4',
  maxWidth: '600px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
};

const headerSection = {
  backgroundColor: '#1C1917',
  padding: '36px 32px',
  textAlign: 'center' as const,
};

const brandSubtitle = {
  color: '#C5A880',
  fontSize: '10px',
  fontWeight: '600',
  letterSpacing: '3px',
  margin: '0 0 6px',
  textTransform: 'uppercase' as const,
};

const brandTitle = {
  color: '#FFFFFF',
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '24px',
  fontWeight: '300',
  letterSpacing: '5px',
  margin: '0 0 16px',
};

const badgeContainer = {
  display: 'inline-block',
};

const badge = {
  backgroundColor: 'rgba(197, 168, 128, 0.15)',
  color: '#D4AF37',
  border: '1px solid #D4AF37',
  borderRadius: '20px',
  fontSize: '10px',
  fontWeight: '600',
  letterSpacing: '1px',
  padding: '6px 14px',
  textTransform: 'uppercase' as const,
};

const contentSection = {
  padding: '32px 28px 24px',
};

const greeting = {
  fontSize: '15px',
  color: '#1C1917',
  margin: '0 0 12px',
};

const paragraph = {
  fontSize: '13.5px',
  lineHeight: '1.7',
  color: '#57534E',
  margin: '0 0 24px',
  fontWeight: '300',
};

const summaryCard = {
  backgroundColor: '#FAF8F5',
  borderRadius: '12px',
  border: '1px solid #EAE3D9',
  padding: '18px 20px',
  marginBottom: '20px',
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
  margin: '0 0 12px',
};

const dataRow = {
  marginBottom: '8px',
};

const labelCol = {
  width: '38%',
  fontSize: '12px',
  color: '#78716C',
  fontWeight: '500',
};

const valueCol = {
  width: '62%',
  fontSize: '12.5px',
  color: '#1C1917',
  textAlign: 'right' as const,
};

const orderIdHighlight = {
  fontFamily: "Menlo, Monaco, Consolas, monospace",
  color: '#B45309',
  fontSize: '12px',
};

const nameHighlight = {
  color: '#1C1917',
};

const conceptHighlight = {
  color: '#1C1917',
  fontSize: '12.5px',
};

const promiseBox = {
  backgroundColor: '#F5F5F0',
  borderRadius: '10px',
  padding: '16px 18px',
  marginBottom: '24px',
  border: '1px dashed #D6D3D1',
};

const promiseTitle = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1.5px',
  color: '#44403C',
  margin: '0 0 8px',
  textTransform: 'uppercase' as const,
};

const promiseItem = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#57534E',
  margin: '0 0 6px',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 0 16px',
};

const primaryButton = {
  backgroundColor: '#1C1917',
  color: '#FAF8F5',
  borderRadius: '10px',
  fontSize: '12.5px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  padding: '13px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
};

const footerSection = {
  backgroundColor: '#FBF9F7',
  borderTop: '1px solid #E7E5E4',
  padding: '24px 20px',
  textAlign: 'center' as const,
};

const footerBrand = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#1C1917',
  margin: '0 0 6px',
};

const footerText = {
  fontSize: '11.5px',
  color: '#78716C',
  margin: '0 0 4px',
};

const footerCopyright = {
  fontSize: '10.5px',
  color: '#A8A29E',
  margin: '12px 0 0',
};

