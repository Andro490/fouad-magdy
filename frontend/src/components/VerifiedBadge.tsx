import React from 'react';

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className = "w-5 h-5" }: VerifiedBadgeProps) {
  return (
    <div 
      className={`inline-flex items-center justify-center rounded-full bg-[#7c3aed] ${className} flex-shrink-0`}
      style={{ boxShadow: '0 0 8px rgba(124, 58, 237, 0.4)' }}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-3/5 h-3/5 text-white" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}
