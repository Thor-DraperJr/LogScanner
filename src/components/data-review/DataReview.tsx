'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Download, Loader2 } from 'lucide-react';
import { parseLogbookData } from '@/lib/azure-ocr';
import { generateCSV, downloadCSV, validateLogbookEntries } from '@/lib/csv-export';
import type { FlightLogEntry } from '@/types/logbook';

interface DataReviewProps {
  imageData: string;
  onDataConfirm: (data: FlightLogEntry[]) => void;
  onBack: () => void;
}

export default function DataReview({ imageData, onDataConfirm, onBack }: DataReviewProps) {
  const [extractedData, setExtractedData] = useState<FlightLogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Call the API route instead of direct Azure OCR
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData }),
      });

      if (!response.ok) {
        throw new Error(`OCR request failed: ${response.statusText}`);
      }

      const ocrResult = await response.json();
      
      if (ocrResult.error) {
        setError(ocrResult.error);
        return;
      }

      const parsedData = parseLogbookData(ocrResult.rawText);
      const entriesWithIds = parsedData.map((entry, index) => ({
        id: `entry-${index}`,
        date: entry.date || '',
        aircraftId: entry.aircraftId || '',
        aircraftType: entry.aircraftType || '',
        route: entry.route || '',
        totalTime: entry.totalTime || 0,
        picTime: entry.picTime || 0,
        dualTime: entry.dualTime || 0,
        landings: entry.landings || 0,
        confidence: 0.8,
        ...entry,
      })) as FlightLogEntry[];

      setExtractedData(entriesWithIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  }, [imageData]);

  useEffect(() => {
    processImage();
  }, [processImage]);

  const updateEntry = (index: number, field: keyof FlightLogEntry, value: string | number) => {
    const updatedData = [...extractedData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setExtractedData(updatedData);
  };

  const removeEntry = (index: number) => {
    const updatedData = extractedData.filter((_, i) => i !== index);
    setExtractedData(updatedData);
  };

  const handleConfirm = () => {
    const validation = validateLogbookEntries(extractedData);
    if (!validation.valid) {
      setError(`Validation errors: ${validation.errors.join(', ')}`);
      return;
    }
    onDataConfirm(extractedData);
  };

  const handleDownload = () => {
    try {
      const csv = generateCSV(extractedData);
      downloadCSV(csv, `logbook-export-${new Date().toISOString().split('T')[0]}.csv`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (isProcessing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Processing Image</h2>
        </div>
        
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Extracting text from your logbook page...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Processing Error</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">Processing Failed</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={onBack}
            className="mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Review Extracted Data</h2>
        </div>
        <span className="text-sm text-gray-500">
          {extractedData.length} entries found
        </span>
      </div>

      {extractedData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No flight entries detected in the image.</p>
          <button
            onClick={onBack}
            className="mt-4 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Try Different Image
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {extractedData.map((entry, index) => (
              <div key={entry.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-gray-600 text-xs">Date</label>
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => updateEntry(index, 'date', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Aircraft ID</label>
                    <input
                      type="text"
                      value={entry.aircraftId}
                      onChange={(e) => updateEntry(index, 'aircraftId', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="N12345"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Type</label>
                    <input
                      type="text"
                      value={entry.aircraftType}
                      onChange={(e) => updateEntry(index, 'aircraftType', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="C172"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Route</label>
                    <input
                      type="text"
                      value={entry.route}
                      onChange={(e) => updateEntry(index, 'route', e.target.value)}
                      className="w-full p-1 border rounded text-sm"
                      placeholder="KPAO-KSQL"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Total Time</label>
                    <input
                      type="number"
                      step="0.1"
                      value={entry.totalTime}
                      onChange={(e) => updateEntry(index, 'totalTime', parseFloat(e.target.value) || 0)}
                      className="w-full p-1 border rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-gray-600 text-xs">Landings</label>
                    <input
                      type="number"
                      value={entry.landings}
                      onChange={(e) => updateEntry(index, 'landings', parseInt(e.target.value) || 0)}
                      className="w-full p-1 border rounded text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(index)}
                  className="mt-2 text-red-600 text-xs hover:text-red-800"
                >
                  Remove Entry
                </button>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Confirm & Continue
            </button>
          </div>
        </>
      )}
    </div>
  );
}
