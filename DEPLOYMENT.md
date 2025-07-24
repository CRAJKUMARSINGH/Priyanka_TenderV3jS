# Vercel Deployment Guide

## Prerequisites

1. **Database Setup**: Set up a PostgreSQL database (recommended: Neon, Supabase, or Railway)
2. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)

## Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
DATABASE_URL=postgresql://username:password@hostname:port/database_name
SESSION_SECRET=your-super-secret-session-key-here
NODE_ENV=production
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

## Database Migration

After deployment, run database migrations:

```bash
npm run db:push
```

## Project Structure for Vercel

```
├── api/                    # Vercel serverless functions
│   └── index.ts           # Main API entry point
├── client/                # React frontend
│   ├── src/
│   └── package.json       # Client dependencies
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   └── routes.ts         # API routes
├── shared/               # Shared types and schemas
├── vercel.json          # Vercel configuration
└── package.json         # Root dependencies
```

## Important Notes

1. **File Uploads**: Large file uploads may hit Vercel's 50MB limit
2. **Database**: Use a cloud PostgreSQL service (Neon recommended)
3. **Environment**: All environment variables must be set in Vercel dashboard
4. **Build**: The build process is handled automatically by Vercel

## Troubleshooting

### Build Errors
- Check that all dependencies are in the correct package.json files
- Ensure TypeScript types are properly configured

### Runtime Errors
- Check Vercel function logs in the dashboard
- Verify environment variables are set correctly
- Ensure database connection is working

### Database Issues
- Verify DATABASE_URL format
- Check database permissions
- Run migrations if needed

## Performance Optimization

1. **Code Splitting**: Implemented in vite.config.ts
2. **Caching**: Static assets are cached by Vercel CDN
3. **Compression**: Enabled by default on Vercel
4. **Database**: Use connection pooling for better performance