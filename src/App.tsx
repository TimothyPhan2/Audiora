import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

// Layout components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

// Pages
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Pricing } from '@/pages/Pricing';
import { Dashboard } from '@/pages/Dashboard';

function AppContent() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isDashboardPage = pathname === '/dashboard';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isDashboardPage && <Header />}
      <main className={isDashboardPage ? "" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      {!isAuthPage && !isDashboardPage && <Footer />}
      <Toaster position="top-right" />
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