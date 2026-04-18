import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContextCore';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, User as UserIcon, Keyboard } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthScreen() {
  const navigate = useNavigate();
  const { user, signIn, signUp, signInWithGoogle, resendSignUpEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [signupEmailSent, setSignupEmailSent] = useState(false);
  const [fullName, setFullName] = useState('');

  // Auto-redirect to home when user is authenticated
  useEffect(() => {
    // Only redirect if NOT on the reset-password page
    if (user && window.location.pathname !== '/reset-password') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    const emailRedirectTo = window.location.origin;

    let error: Error | null = null;
    if (mode === 'signup') {
      const res = await signUp(email, password, fullName, emailRedirectTo);
      error = res.error;
      if (!error) {
        setSignupEmailSent(true);
        toast.success('Verification email sent. Please check your inbox.');
      }
    } else if (mode === 'signin') {
      const res = await signIn(email, password);
      error = res.error;
    } else if (mode === 'forgot') {
      const res = await resetPassword(email);
      error = res.error;
      if (!error) {
        toast.success('Password reset link sent to your email.');
        setMode('signin');
      }
    }

    setLoading(false);
    if (error) {
      toast.error(error.message);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email first.');
      return;
    }

    setResendLoading(true);
    const { error } = await resendSignUpEmail(email, window.location.origin);
    setResendLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Verification email resent.');
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
            className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5"
          >
            <Sparkles size={28} className="text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground">AuraTune</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === 'signup' ? 'Create your account to sync progress' : 
             mode === 'forgot' ? 'Enter your email to reset password' :
             'Welcome back — continue your journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
              required
            />
          </div>

          {mode !== 'forgot' && (
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                required
              />
            </div>
          )}

          {mode === 'signin' && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-xs text-primary font-medium hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 mt-2 glow-primary disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                {mode === 'signup' ? 'Create Account' : 
                 mode === 'forgot' ? 'Send Reset Link' :
                 'Sign In'}
                <ArrowRight size={18} />
              </>
            )}
          </motion.button>

          {signupEmailSent && mode === 'signup' && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Didn't receive it?</p>
              <button
                type="button"
                onClick={handleResend}
                className="mt-2 text-primary font-semibold disabled:opacity-50"
              >
                {resendLoading ? 'Resending...' : 'Resend verification email'}
              </button>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {mode === 'forgot' ? (
            <button onClick={() => setMode('signin')} className="text-primary font-semibold">
              Back to Sign In
            </button>
          ) : (
            <>
              {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                className="text-primary font-semibold"
              >
                {mode === 'signup' ? 'Sign In' : 'Sign Up'}
              </button>
            </>
          )}
        </p>

        {mode !== 'forgot' && (
          <>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => signInWithGoogle()}
              className="w-full py-3.5 rounded-xl glass border border-border/50 text-foreground font-semibold flex items-center justify-center gap-3 hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </motion.button>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <button
            onClick={() => {
              localStorage.setItem('guest_mode', 'true');
              window.dispatchEvent(new Event('guest_mode_enabled'));
              navigate('/');
            }}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now & continue as guest
          </button>
        </div>
      </motion.div>
    </div>
  );
}
