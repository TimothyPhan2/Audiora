import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, ExternalLink } from 'lucide-react';

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
}

export function EmailConfirmationModal({ isOpen, onClose, email }: EmailConfirmationModalProps) {
  const handleCloseTab = () => {
    // Close the current tab/window
    window.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-base-dark2 border border-accent-teal-500/20">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-accent-teal-500/20 rounded-full flex items-center justify-center">
            <Mail className="w-8 h-8 text-accent-teal-400" />
          </div>
          <DialogTitle className="text-xl font-semibold text-text-cream100">
            Check Your Email
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-center">
          <p className="text-text-cream300">
            We've sent a confirmation link to:
          </p>
          {email && (
            <p className="text-accent-teal-400 font-medium bg-accent-teal-500/10 px-3 py-2 rounded-lg">
              {email}
            </p>
          )}
          
          <div className="space-y-3 text-sm text-text-cream400">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Click the link in your email to confirm your account</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <ExternalLink className="w-4 h-4 text-accent-teal-400" />
              <span>The confirmation will open in a new tab</span>
            </div>
          </div>
          
          <div className="pt-4 space-y-3">
            <Button
              onClick={handleCloseTab}
              className="w-full button-gradient-primary text-white"
            >
              Close This Tab
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-text-cream400 hover:text-text-cream200"
            >
              Keep Tab Open
            </Button>
          </div>
          
          <div className="text-xs text-text-cream400 pt-2">
            <p>Didn't receive the email? Check your spam folder or try signing up again.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}