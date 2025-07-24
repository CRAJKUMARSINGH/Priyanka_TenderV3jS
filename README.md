# Tender Management System

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Install server dependencies:
```bash
npm install
```

2. Install client dependencies:
```bash
cd client && npm install
```

### Running the Application

#### Method 1: Running Server and Client Separately (Recommended)

1. Start the server:
```bash
# In the root directory
npm run dev
```

2. In a separate terminal, start the client:
```bash
# Navigate to the client directory
cd client
npm run dev
```

#### Method 2: Using Vite Directly

If you encounter issues with the npm scripts, you can try running Vite directly:

```bash
# Navigate to the client directory
cd client
npx vite
```

### Windows-specific Instructions

On Windows, you may need to modify the `dev` script in package.json:

```json
"dev": "set NODE_ENV=development && tsx server/index.ts"
```

Or use cross-env:

```bash
npm install --save-dev cross-env
```

Then update the script:

```json
"dev": "cross-env NODE_ENV=development tsx server/index.ts"
```

### Troubleshooting

If you encounter path resolution issues:

1. Make sure both the server and client are running
2. Check that the client's vite.config.ts has the correct path aliases
3. Verify that the proxy settings in the client's vite.config.ts are pointing to the correct server URL

## Excel Upload Feature

The application now includes robust Excel file processing with:
- Improved validation for Excel data structure
- Better error handling and user feedback
- Safe numeric value parsing
- Fixed precision issues with numeric values

If you encounter any issues with Excel uploads, please check the browser console for detailed error messages.

## Bidder Percentile Feature

The bidder percentile feature has been improved with:
- Better validation of numeric inputs
- Proper handling of decimal precision
- Enhanced error messages
- Improved data type conversion