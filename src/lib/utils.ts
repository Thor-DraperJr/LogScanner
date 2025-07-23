// Utility functions for LogScanner MVP

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility for merging Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateString;
  }
}

// Format time in decimal hours
export function formatFlightTime(hours: number): string {
  return hours.toFixed(1);
}

// Validate aircraft registration (basic N-number format)
export function validateAircraftId(registration: string): boolean {
  const nNumberPattern = /^N\d{1,5}[A-Z]{0,2}$/;
  return nNumberPattern.test(registration.toUpperCase());
}

// Validate route format (ICAO airport codes)
export function validateRoute(route: string): boolean {
  const routePattern = /^[A-Z]{3,4}-[A-Z]{3,4}$/;
  return routePattern.test(route.toUpperCase());
}

// Parse decimal time from various formats
export function parseFlightTime(timeStr: string): number {
  const cleaned = timeStr.replace(/[^\d.:]/g, '');
  
  // Handle HH:MM format
  if (cleaned.includes(':')) {
    const [hours, minutes] = cleaned.split(':');
    return parseFloat(hours) + (parseFloat(minutes || '0') / 60);
  }
  
  // Handle decimal format
  return parseFloat(cleaned) || 0;
}

// Compress image for OCR processing
export function compressImage(canvas: HTMLCanvasElement, quality: number = 0.8): string {
  return canvas.toDataURL('image/jpeg', quality);
}
