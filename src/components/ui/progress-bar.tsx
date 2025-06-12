import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  className?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ 
  progress, 
  className, 
  showPercentage = false, 
  size = 'md' 
}: ProgressBarProps) {
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={cn("w-full", className)}>
      {showPercentage && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-cream400">Progress</span>
          <span className="text-xs text-text-cream300 font-medium">{progress}%</span>
        </div>
      )}
      <div className={cn(
        "w-full bg-base-dark3/50 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <div
          className="h-full bg-gradient-to-r from-accent-teal-400 to-accent-mint-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}