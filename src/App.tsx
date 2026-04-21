import { lazy, Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { toast } from "sonner";

import AchievementToast from "@/components/AchievementToast";
import BottomNav from "@/components/BottomNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import MiniPlayer from "@/components/MiniPlayer";
import { SessionTrackerProvider } from "./components/SessionTrackerProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContextCore";
import { usePlayer } from "@/context/PlayerContextCore";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";

const AuthScreen = lazy(() => import("./pages/AuthScreen"));
const AuthCallbackScreen = lazy(() => import("./pages/AuthCallbackScreen"));
const HomeScreen = lazy(() => import("./pages/HomeScreen"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OnboardingScreen = lazy(() => import("./pages/OnboardingScreen"));
const PlayerScreen = lazy(() => import("./pages/PlayerScreen"));
const ProfileScreen = lazy(() => import("./pages/ProfileScreen"));
const ResetPasswordScreen = lazy(() => import("./pages/ResetPasswordScreen"));
const StatsScreen = lazy(() => import("./pages/StatsScreen"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AppRoutes() {
  const { loading, user } = useAuth();
  const { stop } = usePlayer();
  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem('onboarding_complete') === 'true');
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('guest_mode') === 'true');

  useEffect(() => {
    // Handle error parameters from Supabase (e.g. expired links)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const errorDescription = params.get('error_description');
    
    if (errorDescription) {
      toast.error(errorDescription.replace(/\+/g, ' '));
      // Clear the hash without reloading the page
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  // Stop audio when user logs out
  useEffect(() => {
    if (!user) {
      stop();
    }
  }, [user, stop]);

  useEffect(() => {
    const handleOnboardingComplete = () => {
      setOnboardingDone(true);
    };
    const handleGuestMode = () => {
      setGuestMode(true);
    };
    window.addEventListener('onboarding_complete', handleOnboardingComplete);
    window.addEventListener('guest_mode_enabled', handleGuestMode);
    return () => {
      window.removeEventListener('onboarding_complete', handleOnboardingComplete);
      window.removeEventListener('guest_mode_enabled', handleGuestMode);
    };
  }, []);

  if (loading) {
    return <AppLoading />;
  }

  return (
    <SessionTrackerProvider>
      <AchievementToast />
      <Routes>
        {/* Reset password always accessible regardless of auth state */}
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        {/* OAuth callback route for deterministic auth completion */}
        <Route path="/auth/callback" element={<AuthCallbackScreen />} />

        {/* Guarded Routes */}
        {!onboardingDone ? (
          <Route path="*" element={<OnboardingScreen />} />
        ) : !user && !guestMode ? (
          <Route path="*" element={<AuthScreen />} />
        ) : (
          <>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/player" element={<PlayerScreen />} />
            <Route path="/stats" element={<StatsScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="*" element={<NotFound />} />
          </>
        )}
      </Routes>
      <MiniPlayer />
      {onboardingDone && (user || guestMode) && <BottomNav />}
    </SessionTrackerProvider>
  );
}

function AppContent() {
  return (
    <Suspense fallback={<AppLoading />}>
      <AppRoutes />
    </Suspense>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <PlayerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </PlayerProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
