import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background py-12">
      <div className="container-center">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <Music className="h-6 w-6 text-persian-500" />
              <span className="text-2xl font-bold gradient-text">Audiora</span>
            </Link>
            <p className="mt-4 text-muted-foreground">
              Learn languages through music. Engage with lyrics, practice pronunciation, and build your vocabulary.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-charcoal-800 dark:text-white mb-4">Languages</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/languages/spanish" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    Spanish
                  </Link>
                </li>
                <li>
                  <Link to="/languages/french" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    French
                  </Link>
                </li>
                <li>
                  <Link to="/languages/italian" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    Italian
                  </Link>
                </li>
                <li>
                  <Link to="/languages/german" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    German
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-charcoal-800 dark:text-white mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center">
          <p className="text-charcoal-600 dark:text-charcoal-300 text-sm">
            © {new Date().getFullYear()} Audiora. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-charcoal-600 dark:text-charcoal-300 hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
              Twitter
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-charcoal-600 dark:text-charcoal-300 hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
              Instagram
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-charcoal-600 dark:text-charcoal-300 hover:text-persian-500 dark:hover:text-persian-400 transition-colors">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}