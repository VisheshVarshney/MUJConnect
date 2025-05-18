import * as React from "react";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number;
  className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 ${className}`}>
      <motion.div
        className="bg-blue-500 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}