import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SuccessMessageProps {
  title: string;
  message: string;
  email?: string;
  linkHref?: string;
  linkText?: string;
  subMessage?: string;
}

export default function SuccessMessage({
  title,
  message,
  email,
  linkHref = '/login',
  linkText = 'Retour à la base',
  subMessage,
}: SuccessMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-neon-rose/10 blur-[100px] rounded-full -z-10" />

      <div className="glass-panel p-8 rounded-2xl max-w-md w-full text-center animate-float">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          {message}
          {email && (
            <>
              {' '}
              <span className="text-sky-aqua font-mono">{email}</span>
            </>
          )}
          {subMessage && (
            <>
              <br />
              <span className="block mt-2 text-gray-300">{subMessage}</span>
            </>
          )}
        </p>
        <Link
          href={linkHref}
          className="inline-flex items-center justify-center w-full bg-surface hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl transition-all gap-2 group"
        >
          {linkText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

