import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  className = "" 
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`frosted-glass p-6 rounded-xl border border-accent-teal-500/20 hover:border-accent-teal-400/30 transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-accent-teal-500/20 rounded-lg">
          <Icon className="h-5 w-5 text-accent-teal-400" />
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-text-cream100">{value}</div>
        <div className="text-sm text-text-cream300">{title}</div>
        {subtitle && (
          <div className="text-xs text-text-cream400">{subtitle}</div>
        )}
      </div>
    </motion.div>
  );
}