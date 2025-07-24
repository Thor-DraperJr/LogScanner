// Azure configuration embedded at build time for static export
// This file will have credentials injected during the build process
// GitHub Secrets updated - testing deployment

// Log all available environment variables for debugging
console.log('All NEXT_PUBLIC env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')));
console.log('NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT:', process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT);
console.log('NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY:', process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY ? 'SET' : 'NOT_SET');

export const azureConfig = {
  endpoint: process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT,
  key: process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY,
} as const;

// Validation function
export function validateAzureConfig() {
  console.log('Azure config check:', {
    hasEndpoint: !!azureConfig.endpoint,
    hasKey: !!azureConfig.key,
    endpoint: azureConfig.endpoint,
    keyLength: azureConfig.key?.length || 0,
    envVars: Object.keys(process.env).filter(key => key.includes('AZURE'))
  });

  // Return false if credentials are missing - this will prevent API calls
  if (!azureConfig.endpoint || !azureConfig.key) {
    console.error(`Missing Azure credentials. Endpoint: ${!!azureConfig.endpoint}, Key: ${!!azureConfig.key}`);
    return false;
  }

  if (!azureConfig.endpoint.includes('api.cognitive.microsoft.com')) {
    console.warn(`Invalid endpoint format: ${azureConfig.endpoint}`);
    return false;
  }

  return true;
}
