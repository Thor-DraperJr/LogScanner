'use client';

import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

interface CameraCaptureProps {
  onImageCapture: (imageData: string) => void;
}

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageCapture(result);
      }
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Capture Logbook Page</h2>
        <p className="text-gray-800 text-lg font-medium">
          Take a clear photo of your handwritten logbook page for best OCR results.
        </p>
      </div>

      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center space-y-4">
          <Camera className="h-16 w-16 text-gray-400 mx-auto" />
          
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-900">Ready to scan</h3>
            <p className="text-lg font-semibold text-gray-800">
              For best results:
            </p>
            <ul className="text-base font-medium text-gray-700 space-y-2">
              <li>• Use good lighting</li>
              <li>• Keep camera steady</li>
              <li>• Ensure text is clearly visible</li>
              <li>• Avoid shadows on the page</li>
            </ul>
          </div>

          <button
            onClick={triggerCamera}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isProcessing ? 'Processing...' : 'Take Photo'}
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Your image is processed locally and never stored on our servers
        </p>
      </div>
    </div>
  );
}
