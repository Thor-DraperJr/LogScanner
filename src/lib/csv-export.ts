// CSV export functionality for ForeFlight compatibility

import type { FlightLogEntry } from '@/types/logbook';
import { formatFlightTime } from './utils';

// ForeFlight-compatible CSV column headers
const CSV_HEADERS = [
  'Date',
  'Aircraft ID',
  'Aircraft Type',
  'Route',
  'Total Time',
  'PIC Time',
  'Dual Time',
  'Landings'
];

// Convert flight log entries to CSV format
export function generateCSV(entries: FlightLogEntry[]): string {
  if (entries.length === 0) {
    return CSV_HEADERS.join(',') + '\n';
  }
  
  const csvLines = [CSV_HEADERS.join(',')];
  
  for (const entry of entries) {
    const row = [
      formatDateForCSV(entry.date),
      escapeCSVField(entry.aircraftId || ''),
      escapeCSVField(entry.aircraftType || ''),
      escapeCSVField(entry.route || ''),
      formatFlightTime(entry.totalTime || 0),
      formatFlightTime(entry.picTime || 0),
      formatFlightTime(entry.dualTime || 0),
      entry.landings?.toString() || '0'
    ];
    
    csvLines.push(row.join(','));
  }
  
  return csvLines.join('\n');
}

// Format date for CSV (YYYY-MM-DD)
function formatDateForCSV(dateString: string): string {
  try {
    // Ensure consistent YYYY-MM-DD format
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

// Escape CSV fields that contain commas, quotes, or newlines
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

// Download CSV file
export function downloadCSV(csvContent: string, filename: string = 'logbook-export.csv'): void {
  try {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if ('msSaveBlob' in navigator) {
      // IE 10+
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any).msSaveBlob(blob, filename);
    } else {
      // Modern browsers
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Failed to download CSV:', error);
    throw new Error('Failed to download CSV file');
  }
}

// Validate CSV data before export
export function validateLogbookEntries(entries: FlightLogEntry[]): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  if (entries.length === 0) {
    errors.push('No flight log entries to export');
    return { valid: false, errors };
  }
  
  entries.forEach((entry, index) => {
    const entryNumber = index + 1;
    
    // Validate required fields
    if (!entry.date) {
      errors.push(`Entry ${entryNumber}: Missing date`);
    } else {
      // Validate date format
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        errors.push(`Entry ${entryNumber}: Invalid date format`);
      }
    }
    
    if (!entry.aircraftId) {
      errors.push(`Entry ${entryNumber}: Missing aircraft ID`);
    }
    
    if (!entry.totalTime || entry.totalTime <= 0) {
      errors.push(`Entry ${entryNumber}: Invalid total time`);
    }
    
    // Validate time logic
    if (entry.picTime && entry.dualTime && entry.picTime > 0 && entry.dualTime > 0) {
      errors.push(`Entry ${entryNumber}: Cannot have both PIC time and dual time for the same flight`);
    }
    
    if (entry.totalTime && entry.picTime && entry.picTime > entry.totalTime) {
      errors.push(`Entry ${entryNumber}: PIC time cannot exceed total time`);
    }
    
    if (entry.totalTime && entry.dualTime && entry.dualTime > entry.totalTime) {
      errors.push(`Entry ${entryNumber}: Dual time cannot exceed total time`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate sample CSV for demonstration
export function generateSampleCSV(): string {
  const sampleEntries: FlightLogEntry[] = [
    {
      date: '2024-01-15',
      aircraftId: 'N12345',
      aircraftType: 'C172',
      route: 'KPAO-KSQL',
      totalTime: 1.2,
      picTime: 1.2,
      dualTime: 0,
      landings: 2
    },
    {
      date: '2024-01-18',
      aircraftId: 'N67890',
      aircraftType: 'PA28',
      route: 'KSQL-KHWD',
      totalTime: 1.8,
      picTime: 0,
      dualTime: 1.8,
      landings: 3
    }
  ];
  
  return generateCSV(sampleEntries);
}
