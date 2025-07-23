// Azure Computer Vision OCR integration for LogScanner MVP

import { config, validateConfig } from './config';
import type { OCRResponse, OCRResult } from '@/types/logbook';

// Initialize Azure Computer Vision client
async function initializeOCRClient() {
  validateConfig();
  
  // Use REST API approach for better browser compatibility
  return {
    endpoint: config.azure.endpoint,
    key: config.azure.key,
  };
}

// Process image with Azure Computer Vision Read API
export async function processImageOCR(imageData: string): Promise<OCRResponse> {
  try {
    const client = await initializeOCRClient();
    
    // Convert base64 to blob
    const base64Data = imageData.split(',')[1];
    const binaryData = atob(base64Data);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    
    // Submit image for analysis
    const submitResponse = await fetch(`${client.endpoint}/vision/v3.2/read/analyze`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': client.key,
        'Content-Type': 'application/octet-stream',
      } as HeadersInit,
      body: bytes,
    });
    
    if (!submitResponse.ok) {
      throw new Error(`OCR submission failed: ${submitResponse.statusText}`);
    }
    
    // Get operation location for polling
    const operationLocation = submitResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      throw new Error('No operation location returned from OCR service');
    }
    
    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    do {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const resultResponse = await fetch(operationLocation, {
        headers: {
          'Ocp-Apim-Subscription-Key': client.key,
        } as HeadersInit,
      });
      
      if (!resultResponse.ok) {
        throw new Error(`OCR result fetch failed: ${resultResponse.statusText}`);
      }
      
      result = await resultResponse.json();
      attempts++;
    } while (result.status === 'running' && attempts < maxAttempts);
    
    if (result.status !== 'succeeded') {
      throw new Error(`OCR processing failed with status: ${result.status}`);
    }
    
    // Process results
    const ocrResults: OCRResult[] = [];
    let rawText = '';
    
    if (result.analyzeResult?.readResults) {
      for (const page of result.analyzeResult.readResults) {
        for (const line of page.lines || []) {
          ocrResults.push({
            text: line.text,
            confidence: line.appearance?.style?.confidence || 0.8,
            boundingBox: line.boundingBox || [],
          });
          rawText += line.text + '\n';
        }
      }
    }
    
    return {
      results: ocrResults,
      rawText: rawText.trim(),
      processing: false,
    };
    
  } catch (error) {
    console.error('OCR processing error:', error);
    return {
      results: [],
      rawText: '',
      processing: false,
      error: error instanceof Error ? error.message : 'Unknown OCR error',
    };
  }
}

// Parse logbook data from OCR text
export function parseLogbookData(ocrText: string): Partial<import('@/types/logbook').FlightLogEntry>[] {
  const lines = ocrText.split('\n').filter(line => line.trim());
  const entries: Partial<import('@/types/logbook').FlightLogEntry>[] = [];
  
  for (const line of lines) {
    const entry = parseLogbookLine(line);
    if (entry && Object.keys(entry).length > 1) {
      entries.push(entry);
    }
  }
  
  return entries;
}

// Parse individual logbook line
function parseLogbookLine(line: string): Partial<import('@/types/logbook').FlightLogEntry> | null {
  const entry: Partial<import('@/types/logbook').FlightLogEntry> = {};
  
  // Date patterns (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
  const datePattern = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/;
  const dateMatch = line.match(datePattern);
  if (dateMatch) {
    if (dateMatch[4]) {
      // YYYY-MM-DD format
      entry.date = `${dateMatch[4]}-${dateMatch[5].padStart(2, '0')}-${dateMatch[6].padStart(2, '0')}`;
    } else {
      // MM/DD/YYYY format (assuming US format for now)
      entry.date = `${dateMatch[3]}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
    }
  }
  
  // Aircraft registration (N-numbers)
  const aircraftPattern = /N\d{1,5}[A-Z]{0,2}/i;
  const aircraftMatch = line.match(aircraftPattern);
  if (aircraftMatch) {
    entry.aircraftId = aircraftMatch[0].toUpperCase();
  }
  
  // Aircraft type (common types)
  const typePattern = /\b(C172|C152|C182|C206|PA28|PA44|SR20|SR22|DA40|DA42)\b/i;
  const typeMatch = line.match(typePattern);
  if (typeMatch) {
    entry.aircraftType = typeMatch[0].toUpperCase();
  }
  
  // Route pattern (KXXX-KYYY or XXX-YYY)
  const routePattern = /\b[A-Z]{3,4}-[A-Z]{3,4}\b/;
  const routeMatch = line.match(routePattern);
  if (routeMatch) {
    entry.route = routeMatch[0].toUpperCase();
  }
  
  // Flight times (decimal format)
  const timePattern = /\b(\d{1,2}\.\d{1})\b/g;
  const timeMatches = [...line.matchAll(timePattern)];
  if (timeMatches.length > 0) {
    entry.totalTime = parseFloat(timeMatches[0][1]);
    if (timeMatches.length > 1) {
      entry.picTime = parseFloat(timeMatches[1][1]);
    }
    if (timeMatches.length > 2) {
      entry.dualTime = parseFloat(timeMatches[2][1]);
    }
  }
  
  // Landings (usually single or double digits)
  const landingsPattern = /\b(\d{1,2})\s*(?:landing|ldg)/i;
  const landingsMatch = line.match(landingsPattern);
  if (landingsMatch) {
    entry.landings = parseInt(landingsMatch[1]);
  } else {
    // Look for standalone numbers that might be landings
    const numbersPattern = /\b(\d{1,2})\b/g;
    const numbers = [...line.matchAll(numbersPattern)];
    if (numbers.length > 0) {
      // Take the last number as potential landings
      entry.landings = parseInt(numbers[numbers.length - 1][1]);
    }
  }
  
  return Object.keys(entry).length > 0 ? entry : null;
}
