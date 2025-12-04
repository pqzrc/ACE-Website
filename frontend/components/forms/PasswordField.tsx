'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}

export default function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  minLength = 8,
  className = '',
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider ml-1">
        {label}
        {required && <span className="text-neon-rose ml-1">*</span>}
      </label>
      <div className="relative group">
        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-sky-aqua transition-colors z-10" />
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="w-full bg-deep-navy/50 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:border-sky-aqua/50 focus:ring-sky-aqua/50 transition-all"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-3.5 text-gray-500 hover:text-sky-aqua transition-colors z-10 focus:outline-none"
          aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
