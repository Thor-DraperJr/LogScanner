# GitHub Copilot Development Instructions for LogScanner MVP

> **Context**: This project was developed from extensive planning documents focusing on creating a streamlined MVP for converting handwritten pilot logbooks to ForeFlight-compatible CSV files.

## 🎯 **Primary Development Principles**

1. **Mobile-First**: All UI components must work seamlessly on mobile devices
2. **PWA-Optimized**: Progressive Web App with offline capabilities
3. **TypeScript Strict**: Type safety throughout the entire codebase
4. **Azure Computer Vision**: Primary OCR service for handwriting recognition
5. **Security by Design**: Environment variables in `.env.local` (never committed)
6. **Performance**: Fast camera capture and OCR processing
7. **User Experience**: Intuitive interface for pilots

## 🔐 **Environment Security**

### Local Development
```bash
# .env.local (NEVER commit this file)
AZURE_COMPUTER_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_COMPUTER_VISION_KEY=your-secret-key-here
NEXT_PUBLIC_APP_ENV=development
```

### Secure Configuration
```typescript
// lib/config.ts
export const config = {
  azure: {
    endpoint: process.env.AZURE_COMPUTER_VISION_ENDPOINT!,
    key: process.env.AZURE_COMPUTER_VISION_KEY!,
  }
} as const;

// Validate at runtime
if (!config.azure.endpoint || !config.azure.key) {
  throw new Error('Missing Azure Computer Vision credentials');
}
```

### Azure MCP Server
- Use Azure MCP server for enhanced development experience
- Monitor API costs and performance during development
- Get security recommendations for Azure resources

## 🛠️ **Technology Stack Guidelines**

### Frontend Framework
- **Next.js 14** with App Router
- **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library
- **PWA** configuration with next-pwa

### Key Dependencies
```json
{
  "next": "^14.0.0",
  "@azure/cognitiveservices-computervision": "latest",
  "tailwindcss": "latest",
  "@radix-ui/react-*": "latest",
  "lucide-react": "latest"
}
```

### File Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── camera/
│   ├── review/
│   └── export/
├── components/
│   ├── ui/
│   ├── camera/
│   ├── ocr/
│   └── data-review/
├── lib/
│   ├── azure-ocr.ts
│   ├── csv-export.ts
│   └── data-parser.ts
└── types/
    └── logbook.ts
```

## 📱 **Core Components to Build**

### 1. Camera Capture Component
```typescript
// Features needed:
- Mobile camera access via navigator.mediaDevices
- Image capture and compression
- Preview and retake functionality
- Optimal image quality for OCR
```

### 2. Azure OCR Integration
```typescript
// OCR Service requirements:
- Azure Computer Vision Read API
- Handwriting recognition mode
- Confidence scoring for extracted text
- Error handling for failed requests
```

### 3. Data Extraction & Parsing
```typescript
// Logbook field recognition:
- Date patterns (MM/DD/YYYY, DD/MM/YYYY)
- Aircraft registration (N-numbers)
- Time formats (decimal hours: 1.5, 2.3)
- Route patterns (KPAO-KSQL)
- Numeric landing counts
```

### 4. Data Review Interface
```typescript
// User editing capabilities:
- Field-by-field validation
- Easy correction of OCR mistakes
- Visual feedback for confidence levels
- Save/restore draft functionality
```

### 5. CSV Export
```typescript
// ForeFlight compatibility:
- Exact column headers required
- Proper date formatting
- Decimal time conversion
- Download trigger functionality
```

## 🎨 **UI/UX Guidelines**

### Mobile-First Design
- Touch-friendly buttons (minimum 44px)
- Large, clear typography
- Intuitive gesture support
- Landscape and portrait orientation

### Color Scheme
- Aviation-inspired blues and whites
- High contrast for readability
- Clear success/error states
- Professional appearance

### Component Patterns
```typescript
// Use consistent patterns:
- Loading states for OCR processing
- Error boundaries for failed operations
- Toast notifications for user feedback
- Progressive disclosure for complex features
```

## 🔧 **Key Development Areas**

### Camera Integration
```typescript
// Implementation focus:
- HTTPS requirement for camera access
- Image compression for faster OCR
- Multiple format support (JPEG, PNG)
- Error handling for permission denial
```

### OCR Processing
```typescript
// Azure Computer Vision setup:
- Async/await pattern for API calls
- Retry logic for failed requests
- Progress indicators for long operations
- Local caching for processed results
```

### Data Validation
```typescript
// Logbook data validation:
- Date range checking (realistic flight dates)
- Time format validation (decimal hours)
- Aircraft registration format (FAA standards)
- Route format (airport identifiers)
```

### Performance Optimization
```typescript
// Key areas:
- Image compression before OCR
- Debounced user input
- Lazy loading of components
- Efficient re-renders
```

## 📊 **Data Models**

### Core Types
```typescript
interface FlightLogEntry {
  date: string;           // YYYY-MM-DD format
  aircraftId: string;     // Registration number
  aircraftType: string;   // C172, PA28, etc.
  route: string;          // KPAO-KSQL
  totalTime: number;      // Decimal hours
  picTime?: number;       // Pilot in Command time
  dualTime?: number;      // Dual instruction time
  landings: number;       // Number of landings
  confidence?: number;    // OCR confidence (0-1)
}

interface OCRResult {
  text: string;
  confidence: number;
  boundingBox: number[];
}
```

## 🚀 **MVP Feature Prioritization**

### Must-Have
1. Camera capture working on mobile
2. Basic Azure OCR integration
3. Simple data display

### Should-Have
1. Data editing interface
2. Field validation
3. CSV generation

### Nice-to-Have
1. PWA installation
2. Offline capability
3. Advanced error handling

## ⚠️ **Security & Common Pitfalls**

### Security Rules
1. **Never commit `.env.local`** - Always in `.gitignore`
2. **Use environment variables** - Never hardcode credentials
3. **Azure key rotation** - Use secure storage in production

### Development Pitfalls
1. **Over-engineering**: Keep components simple for MVP
2. **Desktop-first thinking**: Always test on mobile devices
3. **Complex state management**: Use React state and localStorage
4. **Perfect OCR expectation**: Build robust editing interface
5. **Feature creep**: Stick to core logbook conversion only

## 🧪 **Testing Strategy**

### Manual Testing
- Real handwritten logbook samples
- Various mobile devices and browsers
- Different lighting conditions for camera
- Edge cases in handwriting recognition

### Automated Testing
- OCR response parsing
- CSV format validation
- Component rendering
- Error boundary functionality

## 📝 **Development Notes**

- Focus on the pilot user experience
- Prioritize mobile performance
- Keep Azure costs minimal during development
- Use real logbook images for testing
- Gather early user feedback from pilots
- Document OCR accuracy improvements