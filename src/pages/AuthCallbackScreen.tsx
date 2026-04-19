import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';

export default function AuthCallbackScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const finishOAuthFlow = async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

        const errorDescription = query.get('error_description') || hash.get('error_description');
        if (errorDescription) {
          toast.error(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
          return;
        }

        const code = query.get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            toast.error(error.message);
          }
        }

        await supabase.auth.getSession();
      } catch {
        toast.error('Unable to complete sign-in. Please try again.');
      } finally {
        if (isMounted) {
          navigate('/', { replace: true });
        }
      }
    };

    void finishOAuthFlow();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-6">
      <div className="glass rounded-2xl px-5 py-4 flex items-center gap-3 text-foreground">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm font-medium">Completing sign-in...</span>
      </div>
    </div>
  );
}
