"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SuccessPopup({ show, onClose }: { show: boolean; onClose: () => void }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 10000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-semibold"
        >
          🎉 Your Video Successfully Published to YouTube
        </motion.div>
      )}
    </AnimatePresence>
  );
}
