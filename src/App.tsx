import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store';

// Layout components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Pages
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Onboarding } from '@/pages/Onboarding';
import { Pricing } from '@/pages/Pricing';
import { Dashboard } from '@/pages/Dashboard';
import { Lessons } from '@/pages/Lessons';
import { PracticePage } from '@/pages/Practice';
import { ProgressPage } from '@/pages/Progress';
import { Settings } from '@/pages/Settings';
import { AuthCallback } from '@/pages/AuthCallback';
import { Success } from '@/pages/Success';

function AppContent() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding' || pathname === '/auth/callback';
  const isDashboardPage = pathname === '/dashboard';
  const isPracticePage = pathname === '/practice';
  const isProgressPage = pathname === '/progress';
  const isSettingsPage = pathname === '/settings';
  const { setSession } = useAuthStore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isDashboardPage && <Header />}
      <main className={isDashboardPage || isPracticePage || isProgressPage || isSettingsPage ? "" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </main>
      {!isAuthPage && !isDashboardPage && !isPracticePage && !isProgressPage && !isSettingsPage && <Footer />}
      <Toaster position="top-right" duration={2500}/>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;