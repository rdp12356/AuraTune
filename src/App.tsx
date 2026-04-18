import { lazy, Suspense, useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PlayerProvider } from "@/context/PlayerContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContextCore";
import { SessionTrackerProvider } from "./components/SessionTrackerProvider";

const HomeScreen = lazy(() => import("./pages/HomeScreen"));
const AuthScreen = lazy(() => import("./pages/AuthScreen"));
const PlayerScreen = lazy(() => import("./pages/PlayerScreen"));
const OnboardingScreen = lazy(() => import("./pages/OnboardingScreen"));
const StatsScreen = lazy(() => import("./pages/StatsScreen"));
const ProfileScreen = lazy(() => import("./pages/ProfileScreen"));
const ResetPasswordScreen = lazy(() => import("./pages/ResetPasswordScreen"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BottomNav = lazy(() => import("./components/BottomNav"));
const AchievementToast = lazy(() => import("./components/AchievementToast"));

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
  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem('onboarding_complete') === 'true');
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('guest_mode') === 'true');

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
        {/* Public/Special Routes */}
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        
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
      {onboardingDone && (user || guestMode) && <BottomNav />}
    </SessionTrackerProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<AppLoading />}>
                <AppRoutes />
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
