import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
  hideClose?: boolean;
}

export function Modal({ open, onClose, children, title, hideClose }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card relative w-full max-w-md bg-surface"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && <h2 className="mb-3 text-xl font-extrabold text-ink">{title}</h2>}
            {!hideClose && onClose && (
              <button
                onClick={onClose}
                aria-label="Fechar"
                className="absolute right-3 top-3 text-muted hover:text-ink"
              >
                <X size={22} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
