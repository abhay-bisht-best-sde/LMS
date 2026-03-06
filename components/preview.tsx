"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill/dist/quill.bubble.css";

interface PreviewProps {
  value: string;
};

export const Preview = ({
  value,
}: PreviewProps) => {
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ReactQuill
        theme="bubble"
        value={value}
        readOnly
      />
    </motion.div>
  );
};
