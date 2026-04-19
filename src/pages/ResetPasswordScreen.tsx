import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Lock, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AppLogo from '@/components/AppLogo';
import { useAuth } from '@/context/AuthContextCore';

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      navigate(user ? '/profile' : '/');
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex flex-col items-center justify-center px-6">
      {/* Decorative glow */}
      <div className="absolute top-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-5"
          >
            <AppLogo className="w-16 h-16" imageClassName="p-1.5" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">AuraTune</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {user ? 'Choose a strong new password' : 'Set your new password below'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              required
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              required
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 mt-4 glow-primary disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                Update Password
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {user ? (
            <button
              onClick={() => navigate('/profile')}
              className="text-primary font-semibold"
            >
              Back to Profile
            </button>
          ) : (
            <>
              Remembered your password?{' '}
              <button
                onClick={() => navigate('/')}
                className="text-primary font-semibold"
              >
                Sign In
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
