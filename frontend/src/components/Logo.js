import React from 'react';

export function LogoIcon({ className = "w-10 h-10" }) {
  return (
    <img 
      src="/original-logo.png" 
      alt="mekan360" 
      className={className}
    />
  );
}

export function LogoFull({ className = "h-10" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/original-logo.png" 
        alt="mekan360" 
        className="w-10 h-10"
      />
      <span className="font-heading text-xl font-semibold text-primary">mekan360</span>
    </div>
  );
}

export default LogoIcon;
