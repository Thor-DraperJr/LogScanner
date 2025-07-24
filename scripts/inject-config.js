#!/usr/bin/env node

/**
 * This script injects Azure credentials into the build at build time
 * It reads from environment variables and writes to a config file
 */

const fs = require('fs');
const path = require('path');

const endpoint = process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT;
const key = process.env.NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY;

console.log('🔧 Injecting Azure configuration...');
console.log('Endpoint available:', !!endpoint);
console.log('Key available:', !!key);

if (!endpoint || !key) {
  console.error('❌ Missing Azure credentials in environment variables');
  console.error('NEXT_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT:', !!endpoint);
  console.error('NEXT_PUBLIC_AZURE_COMPUTER_VISION_KEY:', !!key);
  process.exit(1);
}

const config = {
  endpoint,
  key,
  injectedAt: new Date().toISOString(),
  source: 'build-time-injection'
};

const configPath = path.join(__dirname, '../src/lib/azure-credentials.json');
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✅ Azure configuration injected successfully');
console.log('Config written to:', configPath);
