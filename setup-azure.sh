#!/bin/bash

# Azure Computer Vision Setup Script for LogScanner MVP
# This script creates the necessary Azure resources for OCR functionality

set -e

echo "🚀 Setting up Azure Computer Vision for LogScanner MVP"
echo "=================================================="

# Configuration
RESOURCE_GROUP_NAME="logscanner-rg"
COMPUTER_VISION_NAME="logscanner-vision"
LOCATION="eastus"  # Change if needed
SKU="F0"  # Free tier

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP_NAME"
echo "  Computer Vision: $COMPUTER_VISION_NAME"
echo "  Location: $LOCATION"
echo "  SKU: $SKU"
echo ""

# Check if logged in
echo "🔐 Checking Azure authentication..."
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure CLI"
    echo "Please run: az login"
    exit 1
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "✅ Authenticated with subscription: $SUBSCRIPTION_ID"
echo ""

# Create resource group
echo "📦 Creating resource group..."
if az group show --name $RESOURCE_GROUP_NAME &> /dev/null; then
    echo "✅ Resource group '$RESOURCE_GROUP_NAME' already exists"
else
    az group create \
        --name $RESOURCE_GROUP_NAME \
        --location $LOCATION
    echo "✅ Created resource group '$RESOURCE_GROUP_NAME'"
fi
echo ""

# Create Computer Vision service
echo "👁️ Creating Computer Vision service..."
if az cognitiveservices account show \
    --name $COMPUTER_VISION_NAME \
    --resource-group $RESOURCE_GROUP_NAME &> /dev/null; then
    echo "✅ Computer Vision service '$COMPUTER_VISION_NAME' already exists"
else
    az cognitiveservices account create \
        --name $COMPUTER_VISION_NAME \
        --resource-group $RESOURCE_GROUP_NAME \
        --kind ComputerVision \
        --sku $SKU \
        --location $LOCATION
    echo "✅ Created Computer Vision service '$COMPUTER_VISION_NAME'"
fi
echo ""

# Get service details
echo "📋 Getting service details..."
ENDPOINT=$(az cognitiveservices account show \
    --name $COMPUTER_VISION_NAME \
    --resource-group $RESOURCE_GROUP_NAME \
    --query properties.endpoint -o tsv)

KEY=$(az cognitiveservices account keys list \
    --name $COMPUTER_VISION_NAME \
    --resource-group $RESOURCE_GROUP_NAME \
    --query key1 -o tsv)

echo "✅ Service Details:"
echo "  Endpoint: $ENDPOINT"
echo "  Key: ${KEY:0:8}..." # Show only first 8 characters for security
echo ""

# Update .env.local file
echo "🔧 Updating .env.local file..."
ENV_FILE=".env.local"

# Backup existing .env.local if it exists
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backed up existing .env.local"
fi

# Create new .env.local
cat > "$ENV_FILE" << EOF
# Azure Computer Vision Configuration for LogScanner MVP
# Generated on $(date)
AZURE_COMPUTER_VISION_ENDPOINT=$ENDPOINT
AZURE_COMPUTER_VISION_KEY=$KEY
NEXT_PUBLIC_APP_ENV=development
EOF

echo "✅ Updated $ENV_FILE with Azure credentials"
echo ""

echo "🎉 Setup Complete!"
echo "================"
echo "Your LogScanner MVP is now configured with Azure Computer Vision."
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open the app on your mobile device (HTTPS required for camera)"
echo "3. Test with a handwritten logbook page"
echo ""
echo "📊 Resource Summary:"
echo "  Resource Group: $RESOURCE_GROUP_NAME"
echo "  Computer Vision: $COMPUTER_VISION_NAME"
echo "  Endpoint: $ENDPOINT"
echo "  SKU: $SKU (Free tier - 5,000 transactions/month)"
echo ""
echo "💰 Cost: Free tier includes 5,000 transactions per month"
echo "🔒 Security: Credentials saved to .env.local (not committed to git)"
