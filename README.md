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

#### Method 1: Using the Start Script (Recommended for Windows)

The easiest way to run the application is to use the provided start script:

```bash
# In the root directory
npm run start-app
```

For Windows users:
```bash
# In the root directory
npm run start-app:windows
```

Or directly run the batch file:
```bash
start-app.bat
```

#### Method 2: Running Server and Client Separately

1. Start the server:
```bash
# In the root directory
npm run dev:server
```

2. In a separate terminal, start the client:
```bash
# In the root directory
npm run dev:client
```

For Windows users:
```bash
# In the root directory
npm run dev:windows:server

# In another terminal
npm run dev:windows:client
```

#### Method 3: Using Vite Directly

If you encounter issues with the npm scripts, you can try running Vite directly:

```bash
# Set environment variables
set NODE_ENV=development
set PORT=3001

# Start the server
node --loader tsx server/index.ts

# In another terminal, navigate to the client directory
cd client
npx vite --port 3000
```

### Port Configuration

The application uses the following ports:
- Server: 3001
- Client: 3000

You can access the application at:
- http://localhost:3000

### Windows-specific Instructions

Windows users should use the Windows-specific scripts:

```bash
npm run dev:windows:server
npm run dev:windows:client
```

Or use the batch file:
```bash
start-app.bat
```

### Troubleshooting

If you encounter port conflicts:
1. Check if another application is using ports 3000 or 3001
2. Modify the PORT environment variable to use different ports
3. Update the proxy settings in client/vite.config.ts accordingly

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