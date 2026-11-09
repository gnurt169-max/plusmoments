'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  reverse?: boolean;
  className?: string;
  enableHoverTilt?: boolean;
}

export function FloatingCard({
  children,
  delay = 0,
  duration = 6,
  reverse = false,
  className = '',
  enableHoverTilt = true,
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{
        y: reverse ? [0, 8, 0] : [0, -8, 0],
        rotate: reverse ? [0, -0.4, 0] : [0, 0.4, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay,
      }}
      whileHover={
        enableHoverTilt
          ? {
              y: -12,
              scale: 1.02,
              transition: { duration: 0.3, ease: 'easeOut' },
            }
          : undefined
      }
      className={`transition-shadow duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

