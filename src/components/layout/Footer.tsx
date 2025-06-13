import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-background py-6 border-t border-border">
      <div className="container-center">
        <div className="flex flex-col items-center justify-center text-center text-sm text-muted-foreground space-y-2">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <img src="/audiora_logo_variant1.png" alt="Audiora Logo" className="h-6 w-6" />
            <span className="font-medium">Audiora</span>
          </Link>
          <p>
            Learn languages through music | © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}