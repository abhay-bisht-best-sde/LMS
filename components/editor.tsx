"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import "react-quill/dist/quill.snow.css";

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
};

export const Editor = ({
  onChange,
  value,
}: EditorProps) => {
  const ReactQuill = useMemo(() => dynamic(() => import("react-quill"), { ssr: false }), []);

  return (
    <motion.div
      className="bg-white"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
      />
    </motion.div>
  );
};
