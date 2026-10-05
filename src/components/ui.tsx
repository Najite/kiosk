import { type ReactNode } from 'react';

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
}: {
  children: ReactNode;
  variant?: 'neutral' | 'cyan' | 'emerald' | 'amber' | 'rose';
  size?: 'xs' | 'sm';
}) {
  const variants: Record<string, string> = {
    neutral: 'bg-white/5 text-gray-400 border-white/10',
    cyan: 'bg-cyan/10 text-cyan border-cyan/20',
    emerald: 'bg-emerald/10 text-emerald border-emerald/20',
    amber: 'bg-amber/10 text-amber border-amber/20',
    rose: 'bg-rose/10 text-rose border-rose/20',
  };
  const sizes: Record<string, string> = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium uppercase tracking-wider ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    AVAILABLE: 'bg-emerald',
    IN_ESCROW: 'bg-amber',
    SETTLED: 'bg-cyan',
    PENDING: 'bg-amber',
    RELEASED: 'bg-emerald',
  };
  const color = colors[status] || 'bg-gray-500';
  return (
    <span className="relative flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ping`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

export function Panel({
  children,
  className = '',
  glow = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={`panel ${glow ? 'glow-cyan' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-cyan">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = 'cyan',
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: ReactNode;
  accent?: 'cyan' | 'emerald' | 'amber' | 'rose';
}) {
  const accents: Record<string, string> = {
    cyan: 'text-cyan',
    emerald: 'text-emerald',
    amber: 'text-amber',
    rose: 'text-rose',
  };
  return (
    <div className="panel p-4 relative overflow-hidden group hover:border-white/15 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">{label}</p>
          <p className={`mono text-2xl font-bold mt-1 ${accents[accent]}`}>{value}</p>
          {sub && <p className="text-[11px] text-gray-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ${accents[accent]} opacity-60`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) {
  const variants: Record<string, string> = {
    primary: 'bg-cyan text-obsidian hover:bg-cyan-dim font-semibold',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
    danger: 'bg-rose/10 text-rose border border-rose/20 hover:bg-rose/20',
    emerald: 'bg-emerald text-obsidian hover:bg-emerald-dim font-semibold',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  className = '',
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan/50 focus:ring-1 focus:ring-cyan/20 transition-all ${className}`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-1.5">
      {children}
    </label>
  );
}

export function Modal({
  open,
  onClose,
  children,
  title,
  width = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative ${width} w-full max-h-[90vh] overflow-y-auto panel p-6 animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-lg leading-none">
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
    >
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? 'bg-cyan/30' : 'bg-white/10'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
            checked ? 'translate-x-5 bg-cyan' : 'translate-x-1 bg-gray-400'
          }`}
        />
      </span>
      {label && <span className="text-sm text-gray-400">{label}</span>}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-600 mb-3">
          {icon}
        </div>
      )}
      <p className="text-sm font-medium text-gray-400">{title}</p>
      {description && <p className="text-xs text-gray-600 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
