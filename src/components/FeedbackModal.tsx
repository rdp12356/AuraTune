import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContextCore';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ open, onClose }: Props) {
  const [feedback, setFeedback] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSending(true);

    try {
      const { error } = await supabase.functions.invoke('send-feedback', {
        body: {
          feedback: feedback.trim(),
          userEmail: user?.email || 'unknown',
        },
      });

      if (error) throw error;

      setSent(true);
      setTimeout(() => {
        onClose();
        setSent(false);
        setFeedback('');
      }, 2000);
    } catch (err) {
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/45 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 300 }}
            animate={{ y: 0 }}
            exit={{ y: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto glass rounded-t-3xl p-6 pb-10"
          >
            {sent ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center py-8 gap-3"
              >
                <CheckCircle size={48} className="text-green-500" />
                <p className="text-lg font-semibold text-foreground">Thank you for your feedback!</p>
                <p className="text-sm text-muted-foreground">We appreciate your input.</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">Send Feedback</h2>
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-muted/50">
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  We'd love to hear your thoughts. Tell us what you like, what could be better, or any ideas you have.
                </p>

                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Your feedback..."
                  className="w-full min-h-[140px] rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  autoFocus
                />

                <motion.button whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                  disabled={!feedback.trim() || sending}
                  className="w-full mt-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Feedback
                    </>
                  )}
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
