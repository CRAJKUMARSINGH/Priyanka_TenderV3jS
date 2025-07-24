# 🚨 QUICK FIX for Windows Users

## Your Current Issue

You're running `npx vite` which only starts the **frontend**. The "Failed to add bidder percentile" and "Failed to upload Excel file" errors happen because the **backend API server** isn't running.

## ⚡ IMMEDIATE SOLUTION

### Option 1: Stop vite and run full application (Recommended)

1. **Stop your current vite process** (Press `Ctrl+C` in PowerShell)

2. **Install the Windows compatibility package**:
   ```powershell
   npm install cross-env
   ```

3. **Run the complete application**:
   ```powershell
   npm run dev
   ```

### Option 2: Keep vite running, add backend separately

**Keep your current `npx vite` running**, then:

1. **Open a NEW PowerShell window** in the same project folder

2. **In the NEW window, install cross-env**:
   ```powershell
   npm install cross-env
   ```

3. **Start the backend server**:
   ```powershell
   npm run dev:server
   ```

Now you have:
- **Frontend** (your current vite): http://localhost:12000
- **Backend** (API server): Running in background

## ✅ Expected Result

After following either option, your Excel upload and bidder percentile features will work because both frontend and backend are running together.

## 🔍 How to Verify It's Working

1. Go to http://localhost:12000
2. Try adding a bidder with percentile - should work now
3. Try uploading an Excel file - should work now

## 💡 Why This Happens

- `npx vite` = Frontend only (no API)
- `npm run dev` = Frontend + Backend (complete app)

The application needs both parts to function properly!

## 🆘 If You Still Have Issues

1. Make sure you're in the correct project directory
2. Check that both commands completed without errors
3. Verify you can access http://localhost:12000
4. Check browser console (F12) for any error messages