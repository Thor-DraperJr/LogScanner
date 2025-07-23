'use client';

import { azureConfig, validateAzureConfig } from '@/lib/azure-config';

export default function DebugInfo() {
  // Force validation check
  const isConfigured = validateAzureConfig();
  
  return (
    <div className="p-4 bg-gray-100 rounded-lg text-sm">
      <h3 className="font-bold mb-2">Debug Information</h3>
      
      <div className="space-y-1">
        <div>Azure Config Valid: {isConfigured ? 'YES' : 'NO'}</div>
        <div>Endpoint Available: {azureConfig.endpoint ? 'YES' : 'NO'}</div>  
        <div>Key Available: {azureConfig.key ? 'YES' : 'NO'}</div>
        
        {/* Show actual values (first few chars only for security) */}
        <div className="text-xs text-gray-600 mt-2">
          <div>Endpoint: {azureConfig.endpoint ? `${azureConfig.endpoint.substring(0, 30)}...` : 'undefined'}</div>
          <div>Key: {azureConfig.key ? `${azureConfig.key.substring(0, 8)}...` : 'undefined'}</div>
        </div>
        
        {/* Show all environment variables starting with NEXT_PUBLIC_ */}
        <div className="mt-4">
          <div className="font-semibold">All NEXT_PUBLIC_ Environment Variables:</div>
          <div className="text-xs">
            {Object.entries(process.env)
              .filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
              .map(([key, value]) => (
                <div key={key}>{key}: {value ? 'SET' : 'NOT SET'}</div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
