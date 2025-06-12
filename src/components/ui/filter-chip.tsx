import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function FilterChip({ label, isActive, onClick, icon, className }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap",
        isActive
          ? "bg-accent-teal-500 text-white shadow-lg hover:bg-accent-teal-400"
          : "bg-base-dark3/60 text-text-cream300 border border-accent-teal-500/20 hover:border-accent-teal-400/40 hover:bg-accent-teal-500/10",
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {label}
    </button>
  );
}