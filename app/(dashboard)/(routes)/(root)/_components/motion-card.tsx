"use client";

import { motion } from "framer-motion";

interface MotionCardProps {
  children: React.ReactNode;
  className?: string;
}

export const MotionCard = ({
  children,
  className,
}: MotionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      whileHover={{ y: -1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

