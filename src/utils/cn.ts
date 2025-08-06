// src/player/ui/utils/cn.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to conditionally join class names together.
 * It uses `tailwind-merge` to intelligently resolve conflicting Tailwind classes.
 *
 * @param {...ClassValue} inputs - A list of class values to be merged.
 * @returns {string} The merged class name string.
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs))
}
