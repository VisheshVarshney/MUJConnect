import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface LinkWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  url: string;
}

export default function LinkWarningDialog({
  isOpen,
  onClose,
  onProceed,
  url,
}: LinkWarningDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                External Link Warning
              </h3>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              This link leads to:{' '}
              <span className="font-mono text-sm break-all">{url}</span>
            </p>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to proceed?
            </p>

            <div className="flex gap-3">
              <button
                onClick={onProceed}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Proceed
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Stay
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
