import React from 'react';

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className = "w-5 h-5" }: VerifiedBadgeProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Spinning serrated circle */}
      <svg 
        viewBox="0 0 24 24" 
        className="absolute inset-0 w-full h-full animate-spin text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]"
        style={{ animationDuration: '4s' }}
        fill="currentColor"
      >
        <path d="M12 22.75l-2.9-1.32-3.16.5-.83-3.08-2.73-1.63 1.25-2.93-1.85-2.7 2.1-2.28-.1-3.2 3.08-.88 1.4-2.86 3.06.84L12 1.25l2.67 1.95 3.06-.84 1.4 2.86 3.08.88-.1 3.2 2.1 2.28-1.85 2.7 1.25 2.93-2.73 1.63-.83 3.08-3.16-.5L12 22.75z" />
      </svg>
      {/* Static checkmark (White so it contrasts with the blue background) */}
      <svg 
        viewBox="0 0 24 24" 
        className="relative z-10 w-3/5 h-3/5 text-white" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
