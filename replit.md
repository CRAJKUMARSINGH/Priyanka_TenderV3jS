# Tender Document Generation System

## Overview

This is a full-stack web application designed for PWD (Public Works Department) offices to streamline tender document generation. The system processes Excel files containing tender data and generates standardized statutory documents including Comparative Statements, Scrutiny Sheets, Work Orders, and Acceptance Letters in both DOC and PDF formats.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom PWD government theme colors
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **File Processing**: XLSX for Excel file parsing, Multer for file uploads
- **Document Generation**: DOCX library for Word documents, Puppeteer for PDF generation

## Key Components

### Data Processing Pipeline
1. **Excel Upload**: Users upload Excel files containing tender data
2. **Data Extraction**: Server processes Excel files to extract statutory information
3. **Validation**: Zod schemas ensure data integrity and type safety
4. **Storage**: Processed data stored in PostgreSQL via Drizzle ORM
5. **Document Generation**: Single-click generation of all required documents

### Document Types Generated
- **Comparative Statement**: A4 landscape format with tender comparison table
- **Scrutiny Sheet**: Detailed tender evaluation document
- **Work Order**: Official work assignment document
- **Acceptance Letter**: Tender acceptance notification

### Storage Strategy
- **Memory Storage**: Current implementation uses in-memory storage for development
- **Database Schema**: Designed for PostgreSQL with tables for users, tender data, and generated documents
- **File Management**: Generated documents stored in local file system with database references

## Data Flow

1. **File Upload**: Client uploads Excel file via drag-and-drop interface
2. **Processing**: Server extracts tender data using predefined statutory format
3. **Validation**: Data validated against Zod schemas before storage
4. **Storage**: Tender data stored with unique identifiers
5. **Generation**: Single button triggers generation of all four document types
6. **Packaging**: Documents bundled into ZIP file for download
7. **Delivery**: Client receives ZIP containing all documents in DOC and PDF formats

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- UI components (@radix-ui/react-* for accessible components)
- Styling (Tailwind CSS, class-variance-authority for component variants)
- Data fetching (@tanstack/react-query)
- Form handling (react-hook-form with @hookform/resolvers)

### Backend Dependencies
- Server framework (Express.js with TypeScript support)
- Database (Drizzle ORM, @neondatabase/serverless for PostgreSQL)
- File processing (multer for uploads, xlsx for Excel parsing)
- Document generation (docx for Word files, puppeteer for PDF conversion)
- Validation (zod for runtime type checking)

### Development Dependencies
- Build tools (Vite, esbuild for production builds)
- TypeScript (tsx for development server, TypeScript compiler)
- Replit integration (@replit/vite-plugin-runtime-error-modal)

## Deployment Strategy

### Development Environment
- Uses Vite dev server for hot module replacement
- TSX for running TypeScript server with live reload
- Integrated with Replit for cloud development

### Production Build
- Vite builds optimized client bundle to `dist/public`
- esbuild bundles server code for Node.js deployment
- Environment variables for database configuration
- Single command deployment with `npm run build && npm start`

### Database Configuration
- Drizzle configured for PostgreSQL via DATABASE_URL environment variable
- Migration support via `drizzle-kit push` command
- Schema definitions in shared directory for type safety

### File Structure
- `client/`: React frontend application
- `server/`: Express.js backend with API routes
- `shared/`: Common schemas and types shared between client and server
- `attached_assets/`: Statutory document templates and requirements
- Configuration files in root for tools and deployment

The application is designed to be deployed on cloud platforms with environment-based configuration for different deployment scenarios.