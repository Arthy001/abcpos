import React from "react";

interface BahtIconProps {
  className?: string;
  size?: number;
}

export const BahtIcon: React.FC<BahtIconProps> = ({ className = "w-4 h-4", size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Vertical line through Baht */}
      <line x1="12" y1="2" x2="12" y2="22" />
      {/* Capital B curve for Baht symbol */}
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7V5z" />
      <path d="M7 12h6.5a3.5 3.5 0 0 1 0 7H7v-7z" />
    </svg>
  );
};

export const CircleBahtIcon: React.FC<BahtIconProps> = ({ className = "w-4 h-4", size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <path d="M8.5 7h4a2.5 2.5 0 0 1 0 5H8.5V7z" />
      <path d="M8.5 12h4.5a2.5 2.5 0 0 1 0 5H8.5v-5z" />
    </svg>
  );
};
