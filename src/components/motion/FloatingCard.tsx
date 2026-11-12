import React from 'react';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  reverse?: boolean;
  className?: string;
  enableHoverTilt?: boolean;
}

/**
 * Tối ưu hiệu năng: Sử dụng CSS Animations & Transitions thuần túy (GPU Accelerated),
 * loại bỏ hoàn toàn chi phí khởi tạo JavaScript và vòng lặp RAF của framer-motion trên main-thread.
 */
export function FloatingCard({
  children,
  delay = 0,
  duration = 6,
  reverse = false,
  className = '',
  enableHoverTilt = true,
}: FloatingCardProps) {
  const animClass = reverse ? 'animate-float-reverse' : 'animate-float';
  const hoverClass = enableHoverTilt
    ? 'hover:-translate-y-2 hover:scale-[1.01] transition-transform duration-500 ease-out will-change-transform'
    : '';

  return (
    <div
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
      className={`${animClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}

export default FloatingCard;

