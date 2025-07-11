import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); 
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/')
  };
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container-center flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-8 w-8" />
            <span className="text-2xl font-bold gradient-text">Audiora</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
             
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  className="justify-start px-0 text-muted-foreground hover:text-foreground"
                >
                  Logout
                </Button>
              
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="btn-primary">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Navigation Toggle */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-accent/20 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md">
          <div className="container-center py-4 flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className="text-muted-foreground hover:text-foreground py-2 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-muted-foreground hover:text-foreground py-2 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button 
                  onClick={() => {
                    handleLogout();
                  }} 
                  variant="ghost" 
                  className="justify-start px-0 text-charcoal-600 hover:text-charcoal-800"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    Login
                  </Button>
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full btn-primary">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}