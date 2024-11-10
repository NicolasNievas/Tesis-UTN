// components/Alert.tsx
import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'destructive' | 'success';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant = 'destructive',
  className = '' 
}) => {
  const baseStyles = "flex items-center gap-2 p-4 mb-4 rounded-md border";
  
  const variantStyles = {
    destructive: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-700 border-green-200"
  };

  const Icon = variant === 'destructive' ? AlertTriangle : CheckCircle2;

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </div>
  );
};