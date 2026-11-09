'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { ConsultationForm } from '@/components/home/ConsultationForm';

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: string;
  promoText?: string;
  title?: string;
  subtitle?: string;
}

export function ConsultationModal({
  isOpen,
  onClose,
  defaultPackage = '',
  promoText = 'Bảo lưu ưu đãi 2.000.000đ khi đăng ký tư vấn hôm nay',
  title = 'Đăng Ký Tư Vấn & Nhận Báo Giá Trọn Gói',
  subtitle,
}: ConsultationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle || `Để lại thông tin để PlusMoments gửi trọn bộ catalog ảnh cưới và ${promoText}.`}
    >
      <ConsultationForm
        defaultPackage={defaultPackage}
        onSuccess={onClose}
        redirectOnSuccess={false}
      />
    </Modal>
  );
}

export default ConsultationModal;
