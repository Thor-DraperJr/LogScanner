// Configuration for LogScanner MVP
// Validates environment variables at runtime

export const config = {
  azure: {
    endpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT || process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT,
    key: process.env.AZURE_COMPUTER_VISION_KEY || process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY,
  },
  app: {
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  }
} as const;

// Runtime validation
export function validateConfig() {
  if (!config.azure.endpoint || !config.azure.key) {
    console.error('Azure credentials missing:', {
      endpoint: !!config.azure.endpoint,
      key: !!config.azure.key
    });
    throw new Error('Missing Azure Computer Vision credentials. Please check your environment variables.');
  }
  
  if (!config.azure.endpoint.includes('api.cognitive.microsoft.com')) {
    console.error('Invalid endpoint format:', config.azure.endpoint);
    throw new Error('Invalid Azure Computer Vision endpoint format.');
  }
  
  return true;
}

// Export for client-side usage (without sensitive data)
export const clientConfig = {
  app: config.app,
} as const;
