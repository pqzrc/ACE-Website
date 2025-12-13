import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  className?: string;
  children?: ReactNode;
  minLength?: number;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon: Icon,
  iconColor = 'text-gray-500',
  className = '',
  children,
  minLength,
}: FormFieldProps) {
  const baseClasses = 'w-full bg-deep-navy/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 transition-all';
  const iconFocusColor = iconColor.replace('text-', 'text-').replace('gray-500', 'sky-aqua');

  if (children) {
    // Select field
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
          {label}
          {required && <span className="text-neon-rose ml-1">*</span>}
        </label>
        <div className="relative group">
          {Icon && (
            <Icon className={`absolute left-4 top-3.5 w-5 h-5 ${iconColor} group-focus-within:${iconFocusColor} transition-colors z-10`} />
          )}
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`${baseClasses} focus:border-purple-500/50 focus:ring-purple-500/50 appearance-none ${className}`}
          >
            {children}
          </select>
        </div>
      </div>
    );
  }

  // Input field
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
        {label}
        {required && <span className="text-neon-rose ml-1">*</span>}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className={`absolute left-4 top-3.5 w-5 h-5 ${iconColor} group-focus-within:${iconFocusColor} transition-colors`} />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className={`${baseClasses} ${Icon ? 'focus:border-sky-aqua/50 focus:ring-sky-aqua/50' : 'focus:border-purple-500/50 focus:ring-purple-500/50'} ${className}`}
        />
      </div>
    </div>
  );
}

