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
  console.log('Environment check:', {
    serverEndpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT,
    publicEndpoint: process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT,
    serverKey: process.env.AZURE_COMPUTER_VISION_KEY ? 'SET' : 'NOT_SET',
    publicKey: process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY ? 'SET' : 'NOT_SET',
    finalEndpoint: config.azure.endpoint,
    finalKey: config.azure.key ? 'SET' : 'NOT_SET',
    allEnvKeys: typeof window === 'undefined' ? Object.keys(process.env).filter(k => k.includes('AZURE')) : 'CLIENT_SIDE'
  });

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
