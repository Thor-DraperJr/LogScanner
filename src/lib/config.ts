// Configuration for LogScanner MVP
// Validates environment variables at runtime

export const config = {
  azure: {
    endpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT!,
    key: process.env.AZURE_COMPUTER_VISION_KEY!,
  },
  app: {
    environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  }
} as const;

// Runtime validation
export function validateConfig() {
  if (!config.azure.endpoint || !config.azure.key) {
    throw new Error('Missing Azure Computer Vision credentials. Please check your .env.local file.');
  }
  
  if (!config.azure.endpoint.includes('cognitiveservices.azure.com')) {
    throw new Error('Invalid Azure Computer Vision endpoint format.');
  }
  
  return true;
}

// Export for client-side usage (without sensitive data)
export const clientConfig = {
  app: config.app,
} as const;
