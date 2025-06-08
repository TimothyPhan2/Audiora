import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';

export function Login() {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center relative">
          {/* Floating Music Notes */}
          <div className="floating-note text-teal-400 text-3xl" style={{ left: '-20%' }}>♪</div>
          <div className="floating-note text-mint-400 text-4xl" style={{ right: '-20%' }}>♫</div>
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-10 w-10" />
            <span className="text-3xl font-bold gradient-text">Audiora</span>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Welcome Back</h1>
          <p className="mt-2 text-cream-200">
            Sign in to continue your language learning journey
          </p>
        </div>
        
        <AuthForm type="login" onSuccess={handleLoginSuccess} />
        
        <div className="text-center mt-4">
          <p className="text-cream-200">
            Don't have an account?{' '}
            <Link to="/signup" className="text-mint-400 hover:text-mint-300 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}