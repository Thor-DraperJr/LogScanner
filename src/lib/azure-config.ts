// Azure configuration embedded at build time for static export
// GitHub Secrets updated - testing deployment
// This file reads from build-time injected credentials

let credentials: { endpoint: string; key: string } | null = null;

// Try to load credentials from build-time injected file
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  credentials = require('./azure-credentials.json');
  console.log('✅ Loaded Azure credentials from build-time injection');
} catch (error) {
  console.warn('⚠️ Could not load build-time credentials, falling back to env vars');
  console.warn('Error:', (error as Error).message);
}

// Fallback to environment variables if injection failed
const fallbackEndpoint = process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT;
const fallbackKey = process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY;

export const azureConfig = {
  endpoint: credentials?.endpoint || fallbackEndpoint,
  key: credentials?.key || fallbackKey,
} as const;

// Validation function
export function validateAzureConfig() {
  console.log('Azure config check:', {
    hasEndpoint: !!azureConfig.endpoint,
    hasKey: !!azureConfig.key,
    endpoint: azureConfig.endpoint,
    keyLength: azureConfig.key?.length || 0,
    source: credentials ? 'build-time-injection' : 'environment-variables',
    credentialsLoaded: !!credentials,
    envVarsAvailable: {
      endpoint: !!fallbackEndpoint,
      key: !!fallbackKey
    }
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
