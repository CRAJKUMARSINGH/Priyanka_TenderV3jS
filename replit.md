# Tender Management System

## Overview

This is a comprehensive tender management system built with React frontend and Express.js backend. The application enables government agencies or organizations to manage tender processes, upload Excel files containing tender data, manage bidders, calculate bidder percentiles, and generate various types of documents for the tendering process.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **Validation**: Zod schemas shared between frontend and backend

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: Authentication and user management
- **Tenders**: Core tender information including number, description, and estimated amount
- **Bidders**: Contractor/bidder information with contact details
- **Bidder Percentiles**: Percentage calculations for each bidder per tender
- **Generated Documents**: Storage for PDF, Excel, and ZIP files

## Key Components

### Data Processing
- **Excel Processing**: Handles upload and parsing of tender Excel files (placeholder implementation ready for xlsx library integration)
- **PDF Generation**: Creates tender documents, comparison sheets, work summaries, and financial analysis reports
- **ZIP Generation**: Packages multiple documents into downloadable archives

### User Interface
- **Dashboard**: Central hub showing tender overview, statistics, and quick actions
- **File Upload**: Drag-and-drop Excel file upload with validation
- **Bidder Management**: Forms for adding and managing bidder information
- **Document Generation**: Interface for selecting and generating various document types

### Storage Layer
- **Interface-based Storage**: Abstract storage interface allowing for different implementations
- **Memory Storage**: Development implementation for rapid prototyping
- **Database Storage**: Production-ready PostgreSQL implementation

## Data Flow

1. **Tender Creation**: Users upload Excel files containing tender specifications
2. **Data Processing**: Excel data is parsed and stored in the database
3. **Bidder Management**: Bidders are added with their details and percentage calculations
4. **Document Generation**: System generates PDFs, comparison sheets, and analysis reports
5. **File Distribution**: Documents are packaged into ZIP files for download

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with excellent TypeScript support
- **@tanstack/react-query**: Powerful data synchronization for React applications
- **wouter**: Minimalist routing library for React

### UI Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Beautiful and customizable icon library

### Development Tools
- **typescript**: Static typing for improved developer experience
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon Database with connection pooling
- **Environment Variables**: DATABASE_URL required for database connectivity

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: esbuild compiles TypeScript server code to `dist/index.js`
- **Deployment**: Single Node.js process serving both API and static files

### Database Management
- **Migrations**: Drizzle Kit manages database schema migrations
- **Schema Evolution**: Type-safe schema changes with automatic migration generation
- **Connection Management**: Serverless-friendly connection handling

The application is designed to be deployment-ready for platforms like Railway, Vercel, or any Node.js hosting environment with PostgreSQL support.