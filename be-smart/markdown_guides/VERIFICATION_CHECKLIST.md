# ✅ Frontend Setup Verification Checklist

## Before You Start Development

### 1. Environment Variables

- [ ] Check if `be-smart/.env` file exists
  - If NO, create it with these variables:
    ```
    VITE_BASE_URL=http://localhost:3000
    VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
    ```
- [ ] Verify `VITE_BASE_URL` points to correct backend:

  - **Local backend**: `http://localhost:3000`
  - **EC2 backend**: `http://ec2-52-15-61-144.us-east-2.compute.amazonaws.com:3000`

- [ ] Verify `VITE_GOOGLE_CLIENT_ID` is set (get from Google Cloud Console if needed)

### 2. Dependencies Installed

```bash
cd be-smart
npm install
```

- [ ] No errors during installation
- [ ] `node_modules/` folder created

### 3. Development Server Starts

```bash
npm run dev
```

- [ ] Server starts without errors
- [ ] Terminal shows: `Local: http://localhost:5173`
- [ ] Open browser to http://localhost:5173
- [ ] Page loads without errors

### 4. Verify Core Functionality

Visit these URLs and verify they work:

- [ ] http://localhost:5173 - Home page loads
- [ ] http://localhost:5173/login - Login page loads
- [ ] http://localhost:5173/dashboard - Dashboard page loads
- [ ] http://localhost:5173/problem - Problem Statement page loads
- [ ] http://localhost:5173/ui-catalog - **UI Catalog page loads** (IMPORTANT!)
- [ ] http://localhost:5173/nonexistent - Shows 404 page

### 5. Test Theme Toggle

- [ ] Click sun/moon icon in header
- [ ] Theme switches between default and AA theme
- [ ] Refresh page - theme persists

### 6. Test Mobile Responsiveness

- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Test mobile view - hamburger menu appears
- [ ] Click hamburger - menu opens
- [ ] Navigation works on mobile

### 7. Check Browser Console

- [ ] Open DevTools Console (F12 → Console tab)
- [ ] No red errors (warnings are okay)
- [ ] If errors exist, note them for fixing

---

## Backend Connection Test (When Backend is Ready)

### Option A: Local Backend

1. [ ] Backend server running on `http://localhost:3000`
2. [ ] `.env` has `VITE_BASE_URL=http://localhost:3000`
3. [ ] Restart `npm run dev` after changing `.env`
4. [ ] Try making a test API call
5. [ ] Check Network tab - requests go to localhost:3000

### Option B: EC2 Backend

1. [ ] EC2 instance running
2. [ ] Backend deployed on EC2
3. [ ] `.env` has `VITE_BASE_URL=http://ec2-52-15-61-144.us-east-2.compute.amazonaws.com:3000`
4. [ ] Restart `npm run dev` after changing `.env`
5. [ ] Try making a test API call
6. [ ] Check Network tab - requests go to EC2 URL

---

## Component Testing (UI Catalog)

Go to http://localhost:5173/ui-catalog and verify:

- [ ] All button variants display correctly
- [ ] Input fields work (type in them)
- [ ] Loading spinners animate
- [ ] Error display shows with retry button
- [ ] Empty state shows with action button
- [ ] Skeleton loading animations work
- [ ] Cards display correctly
- [ ] Form components work
- [ ] Toolbar displays with left/center/right sections
- [ ] Theme colors display correctly

---

## Toast Notifications Test

1. [ ] Open browser console
2. [ ] In Console tab, run:
   ```javascript
   // Get toast context (if component is on page)
   // Or test from a page with a button that triggers toast
   ```
3. [ ] Create a test button somewhere that shows toast
4. [ ] Verify toast appears in top-right
5. [ ] Verify toast auto-dismisses after 5 seconds
6. [ ] Verify close button works

---

## Common Issues & Fixes

### Issue: `.env` variables not loading

**Fix**:

- Ensure file is named exactly `.env` (not `.env.txt`)
- Ensure variables start with `VITE_`
- Restart `npm run dev` after creating/editing `.env`

### Issue: "Module not found" errors

**Fix**:

```bash
cd be-smart
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 5173 already in use

**Fix**:

- Kill existing Vite process
- Or change port in `vite.config.js`: `server: { port: 5174 }`

### Issue: CORS errors when calling backend

**Fix**:

- Backend needs to allow `http://localhost:5173` in CORS config
- Check backend `server.js` - should have `localhost:5173` in `allowedOrigins`

### Issue: Google Sign-In button doesn't appear

**Fix**:

- Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env`
- Check browser console for Google script errors
- Ensure Google Cloud Console has correct redirect URIs

---

## Ready for Development Checklist

- [ ] All pages load without errors
- [ ] UI Catalog works (can preview all components)
- [ ] Theme toggle works
- [ ] Mobile responsive design works
- [ ] Environment variables configured
- [ ] Backend connection configured (when backend is ready)
- [ ] Browser console has no errors

---

## Files Created for You

### Components (21 files)

- `src/components/common/` (11 components)
  - Button, Input, Card, LoadingSpinner, ErrorDisplay
  - Skeleton, EmptyState, Page, Section, FormRow, Toolbar, ThemeToggle
- `src/components/layout/` (2 components)
  - Header, Footer

### Pages (6 files)

- HomePage, LoginPage, DashboardPage
- ProblemStatementPage, NotFoundPage, UICatalogPage

### Services (2 files)

- userService.js, authService.js

### Hooks (2 files)

- useApi.js, useAuth.js

### Contexts (1 file)

- ToastContext.jsx

### Configuration & Docs

- App.jsx (updated with routing)
- main.jsx (updated with ToastProvider)
- index.css (updated with theme tokens)
- FRONTEND_GUIDE.md (full documentation)
- QUICK_START.md (quick reference)
- VERIFICATION_CHECKLIST.md (this file)

---

## Next Steps

1. Complete this checklist
2. Fix any issues found
3. Read `QUICK_START.md` for tomorrow's workflow
4. Bookmark `/ui-catalog` for quick component reference
5. Start building! 🚀

---

## Need Help?

If something doesn't work:

1. Check browser console for errors
2. Check terminal for Vite errors
3. Verify `.env` file exists and has correct values
4. Ensure `npm install` ran successfully
5. Try restarting the dev server

**Pro tip**: Keep the UI Catalog page open in a separate tab for quick reference while coding!
