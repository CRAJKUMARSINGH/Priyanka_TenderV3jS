# Development Setup Guide

This guide provides detailed instructions for setting up the development environment for the Tender Management System.

## Windows Setup

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Git (optional, for version control)

### Installation Steps

1. Clone the repository (if using Git):
```bash
git clone https://github.com/CRAJKUMARSINGH/Priyanka_TenderV3jS.git
cd Priyanka_TenderV3jS
```

2. Install server dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a client-side vite.config.ts file if it doesn't exist:
```typescript
// client/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:12000',
        changeOrigin: true,
      }
    }
  },
});
```

5. Create a client-side tsconfig.json file if it doesn't exist:
```json
{
  "extends": "../tsconfig.json",
  "include": ["src/**/*"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"]
    }
  }
}
```

6. Update package.json scripts for Windows compatibility:
```json
"scripts": {
  "dev": "set NODE_ENV=development && tsx server/index.ts",
  "build": "npm run build:client && npm run build:server",
  "build:client": "vite build",
  "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
  "start": "set NODE_ENV=production && node dist/index.js",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

7. Alternatively, install cross-env for better cross-platform compatibility:
```bash
npm install --save-dev cross-env
```

Then update scripts:
```json
"scripts": {
  "dev": "cross-env NODE_ENV=development tsx server/index.ts",
  "start": "cross-env NODE_ENV=production node dist/index.js",
  // other scripts remain the same
}
```

## Running the Application

### Method 1: Using npm scripts
```bash
# In one terminal, start the server
npm run dev

# In another terminal, start the client
cd client
npm run dev
```

### Method 2: Using the start-app.js script
```bash
node start-app.js
```

### Method 3: Using npx directly
```bash
# In one terminal, start the server
set NODE_ENV=development && npx tsx server/index.ts

# In another terminal, start the client
cd client
npx vite
```

## Troubleshooting Common Issues

### Excel Upload Issues
- Make sure the Excel file has the expected structure
- Check browser console for detailed error messages
- Verify that the server is running and accessible

### Bidder Percentile Issues
- Ensure percentage values are valid numbers between -99.99 and 99.99
- Check that bidder and tender IDs are valid
- Verify that bidder details are properly formatted

### Path Resolution Issues
- Check that the vite.config.ts file has the correct path aliases
- Verify that the tsconfig.json file has the correct path mappings
- Make sure all required dependencies are installed

### Server Connection Issues
- Verify that the server is running on the expected port (default: 12000)
- Check that the client proxy settings are pointing to the correct server URL
- Ensure no firewall or antivirus software is blocking the connection