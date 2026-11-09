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

export interface AdminNewLeadAlertEmailProps {
  leadId: string;
  customerName: string;
  customerPhone: string;
  zaloPhone?: string | null;
  customerEmail?: string | null;
  eventDate?: string | null;
  budgetRange?: string | null;
  conceptOfInterest?: string | null;
  notes?: string | null;
  sourceUrl?: string | null;
  utmSource?: string | null;
  createdAt?: string;
  adminDashboardUrl?: string;
}

export default function AdminNewLeadAlertEmail({
  leadId = 'PM-LEAD-88',
  customerName = 'Nguyễn Văn A & Trần Thị B',
  customerPhone = '0903768871',
  zaloPhone,
  customerEmail,
  eventDate,
  budgetRange = 'Từ 15 - 25 triệu',
  conceptOfInterest = 'Pre-Wedding Luxury',
  notes,
  sourceUrl,
  utmSource,
  createdAt,
  adminDashboardUrl = 'https://plusmoments.vn/admin/leads',
}: AdminNewLeadAlertEmailProps) {
  const formattedLeadId = leadId.startsWith('PM-') ? leadId : `PM-${leadId.slice(-6).toUpperCase()}`;
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

  return (
    <Html lang="vi">
      <Head />
      <Preview>🔥 [LEAD MỚI] Dâu rể {customerName} vừa đăng ký nhận báo giá!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* HEADER */}
          <Section style={headerSection}>
            <div style={badgeContainer}>
              <span style={badge}>🔥 CẢNH BÁO LEAD TƯ VẤN MỚI</span>
            </div>
            <Heading style={title}>PlusMoments Studio CRM</Heading>
            <Text style={subtitle}>Có dâu rể vừa đăng ký nhận báo giá & ưu đãi trên website</Text>
          </Section>

          {/* MAIN CONTENT */}
          <Section style={contentSection}>
            {/* CALL BUTTON HIGHLIGHT AT THE TOP */}
            <Section style={callNowContainer}>
              <Link href={`tel:${cleanPhone}`} style={callNowButton}>
                📞 BẤM ĐỂ GỌI CHO KHÁCH NGAY ({customerPhone})
              </Link>
            </Section>

            {/* LEAD INFO CARD */}
            <Section style={leadCard}>
              <Text style={cardTitle}>CHI TIẾT KHÁCH HÀNG</Text>
              <Hr style={cardDivider} />

              <Row style={dataRow}>
                <Column style={labelCol}>Mã Lead:</Column>
                <Column style={valueCol}>
                  <strong style={leadIdHighlight}>#{formattedLeadId}</strong>
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
                    📞 <strong>{customerPhone}</strong>
                  </Link>
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Zalo:</Column>
                <Column style={valueCol}>
                  {zaloPhone ? (
                    <Link href={`https://zalo.me/${zaloPhone.replace(/[^0-9]/g, '')}`} style={zaloLink}>
                      💬 {zaloPhone}
                    </Link>
                  ) : (
                    <span style={fadedText}>Trùng với SĐT</span>
                  )}
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Email Khách:</Column>
                <Column style={valueCol}>
                  {customerEmail && customerEmail.trim() ? (
                    <Link href={`mailto:${customerEmail.trim()}`} style={emailLink}>
                      ✉️ {customerEmail.trim()}
                    </Link>
                  ) : (
                    <span style={fadedText}>Không cung cấp</span>
                  )}
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Ngày Dự Kiến Cưới/Chụp:</Column>
                <Column style={valueCol}>
                  <strong>{eventDate || 'Chưa xác định'}</strong>
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Ngân Sách Dự Kiến:</Column>
                <Column style={valueCol}>
                  <span style={budgetTag}>{budgetRange || 'Chưa rõ'}</span>
                </Column>
              </Row>

              <Row style={dataRow}>
                <Column style={labelCol}>Concept / Gói Quan Tâm:</Column>
                <Column style={valueCol}>
                  <strong>{conceptOfInterest || 'Tư vấn tổng quan'}</strong>
                </Column>
              </Row>

              {notes && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Ghi Chú Riêng:</Column>
                  <Column style={valueCol}>
                    <span style={notesText}>"{notes}"</span>
                  </Column>
                </Row>
              )}

              {utmSource && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Nguồn Chiến Dịch:</Column>
                  <Column style={valueCol}>
                    <code>{utmSource}</code>
                  </Column>
                </Row>
              )}

              {createdAt && (
                <Row style={dataRow}>
                  <Column style={labelCol}>Thời Gian Đăng Ký:</Column>
                  <Column style={valueCol}>{createdAt}</Column>
                </Row>
              )}
            </Section>

            {/* DASHBOARD LINK BUTTON */}
            <Section style={secondaryActionSection}>
              <Link href={adminDashboardUrl} style={secondaryButton}>
                ⚡ Mở Trang Quản Trị Leads & Chăm Sóc Khách Hàng →
              </Link>
            </Section>
          </Section>

          {/* FOOTER */}
          <Section style={footerSection}>
            <Text style={footerText}>Thông báo tự động từ hệ thống quản trị PlusMoments Studio.</Text>
            <Text style={footerSubtext}>Vui lòng chăm sóc dâu rể trong vòng 15 phút để đạt tỷ lệ chốt đơn cao nhất.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// -----------------------------------------------------------------------------
// STYLES
// -----------------------------------------------------------------------------
const main = {
  backgroundColor: '#F3F4F6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '24px 0',
};

const container = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  border: '1px solid #E5E7EB',
  maxWidth: '600px',
  margin: '0 auto',
  overflow: 'hidden',
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
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
  backgroundColor: '#DC2626',
  color: '#FFFFFF',
  borderRadius: '20px',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '5px 14px',
  textTransform: 'uppercase' as const,
};

const title = {
  color: '#FFFFFF',
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: '22px',
  fontWeight: '400',
  margin: '0 0 6px',
};

const subtitle = {
  color: '#D6D3D1',
  fontSize: '12px',
  margin: '0',
  fontWeight: '300',
};

const contentSection = {
  padding: '24px',
};

const callNowContainer = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const callNowButton = {
  backgroundColor: '#16A34A',
  color: '#FFFFFF',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '0.5px',
  padding: '14px 24px',
  textDecoration: 'none',
  display: 'block',
  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
};

const leadCard = {
  backgroundColor: '#FAF8F5',
  borderRadius: '12px',
  border: '1px solid #E7E5E4',
  padding: '18px 20px',
  marginBottom: '20px',
};

const cardTitle = {
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '2px',
  color: '#78716C',
  textTransform: 'uppercase' as const,
  margin: '0 0 10px',
};

const cardDivider = {
  borderTop: '1px solid #E7E5E4',
  margin: '0 0 12px',
};

const dataRow = {
  marginBottom: '9px',
};

const labelCol = {
  width: '40%',
  fontSize: '12px',
  color: '#78716C',
  fontWeight: '500',
};

const valueCol = {
  width: '60%',
  fontSize: '12.5px',
  color: '#1C1917',
  textAlign: 'right' as const,
};

const leadIdHighlight = {
  fontFamily: "Menlo, Monaco, Consolas, monospace",
  color: '#B45309',
  fontSize: '12px',
};

const nameHighlight = {
  color: '#1C1917',
  fontSize: '13.5px',
};

const phoneLink = {
  color: '#16A34A',
  textDecoration: 'none',
  fontSize: '13.5px',
};

const zaloLink = {
  color: '#0284C7',
  textDecoration: 'none',
};

const emailLink = {
  color: '#B45309',
  textDecoration: 'none',
};

const fadedText = {
  color: '#A8A29E',
  fontStyle: 'italic',
};

const budgetTag = {
  backgroundColor: '#FEF3C7',
  color: '#92400E',
  borderRadius: '6px',
  padding: '2px 8px',
  fontSize: '11px',
  fontWeight: '600',
};

const notesText = {
  color: '#57534E',
  fontStyle: 'italic',
};

const secondaryActionSection = {
  textAlign: 'center' as const,
  padding: '6px 0 12px',
};

const secondaryButton = {
  backgroundColor: '#1C1917',
  color: '#FFFFFF',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: '600',
  padding: '12px 20px',
  textDecoration: 'none',
  display: 'inline-block',
};

const footerSection = {
  backgroundColor: '#F9FAFB',
  borderTop: '1px solid #E5E7EB',
  padding: '18px 20px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '11px',
  color: '#6B7280',
  margin: '0 0 4px',
};

const footerSubtext = {
  fontSize: '10.5px',
  color: '#9CA3AF',
  margin: '0',
  fontStyle: 'italic',
};

