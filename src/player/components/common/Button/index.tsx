import React, { forwardRef } from 'react';

// Define the props for our button. It accepts all standard button props
// plus an optional aria-label for accessibility.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    'aria-label': string; // Make aria-label mandatory for accessibility
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className, ...props }, ref) => {
        // Define the base styles that all player buttons will share.
        const baseStyles = `
      p-2 rounded-full transition-colors duration-200
      hover:bg-white/20
      focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-primary focus-visible:ring-offset-2
      focus-visible:ring-offset-black/50
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

        // A simple utility to merge the base styles with any custom classes passed in.
        const finalClassName = `${baseStyles} ${className || ''}`.trim();

        return (
            <button ref={ref} className={finalClassName} {...props}>
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
