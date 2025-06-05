import { Link, useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { Music } from 'lucide-react';

export function Signup() {
  const navigate = useNavigate();
  
  const handleSignupSuccess = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 auth-gradient">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <Music className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold gradient-text">Audiora</span>
          </Link>
          <h1 className="text-3xl font-bold gradient-text">Join Audiora</h1>
          <p className="mt-2 text-muted-foreground">
            Create an account to start learning languages through music
          </p>
        </div>
        
        <AuthForm type="signup" onSuccess={handleSignupSuccess} />
        
        <div className="text-center mt-4">
          <p className="text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary/90 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}