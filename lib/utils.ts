import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createFocusScope() {
  let previousActiveElement: HTMLElement | null = null;
  
  return {
    trap: (container: HTMLElement) => {
      previousActiveElement = document.activeElement as HTMLElement;
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };
      
      container.addEventListener('keydown', handleKeyDown);
      firstElement?.focus();
      
      return () => {
        container.removeEventListener('keydown', handleKeyDown);
        previousActiveElement?.focus();
      };
    }
  };
}
