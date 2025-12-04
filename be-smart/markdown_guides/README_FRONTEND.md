# 🎯 BE SMART Hackathon - Frontend

> Complete, production-ready frontend built with React + Vite + Tailwind CSS
> American Airlines-inspired design system

---

## 📚 Documentation Index

**Start here** → [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - What was built and what to do now

**Quick workflows** → [QUICK_START.md](./QUICK_START.md) - Fast reference for common tasks

**Verify setup** → [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) - Step-by-step checks

**Full guide** → [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) - Complete component & API docs

---

## ⚡ TL;DR - Get Started in 3 Steps

### 1. Setup Environment

```bash
# Create .env file with:
VITE_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. Install & Run

```bash
cd be-smart
npm install
npm run dev
```

### 3. Preview Everything

Open http://localhost:5173/ui-catalog

---

## 🎨 What's Included

### Components (21 total)

- Buttons, Inputs, Cards
- Loading spinners, Skeletons
- Error displays, Empty states
- Page layouts, Sections, Forms
- Header, Footer, Theme toggle

### Pages (6 total)

- Home, Login, Dashboard
- Problem Statement, Not Found
- **UI Catalog** (component preview)

### Services & Hooks

- API service layer (user, auth)
- `useApi` - API calls with loading/error states
- `useAuth` - Authentication management
- Toast notifications system

### Theme

- American Airlines colors
- Fully switchable themes
- CSS variable-based (easy rebrand)

---

## 🚀 Tomorrow's Workflow

### Add a New Page

1. Copy existing page → Modify → Add route
2. Use `useApi` for data fetching
3. Show toasts for user feedback

### Make API Calls

1. Add service function in `services/`
2. Use `useApi` hook in component
3. Handle loading/error/data states

### Use Components

1. Check `/ui-catalog` for available components
2. Copy component usage pattern
3. Customize props

---

## 📁 Project Structure

```
be-smart/src/
├── components/
│   ├── common/          # 11 reusable components
│   ├── layout/          # Header, Footer
│   └── auth/            # Google auth button
├── pages/               # 6 route-level pages
├── services/            # API service layer
├── hooks/               # useApi, useAuth
├── contexts/            # Toast notifications
├── utils/               # HTTP client (api.js)
├── App.jsx              # Routing
├── main.jsx             # Entry point
└── index.css            # Theme tokens
```

---

## 🎯 Key Features

✅ **Zero hardcoded colors** - All use CSS variables
✅ **Mobile responsive** - Works on all screen sizes
✅ **Loading states** - Built into every data fetch
✅ **Error handling** - Consistent across all API calls
✅ **Toast notifications** - Auto-dismiss user feedback
✅ **Theme switching** - Default ↔ AA theme
✅ **No linter errors** - Clean, production-ready code

---

## 📖 Quick Links

- **UI Catalog**: http://localhost:5173/ui-catalog
- **Setup Guide**: [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)
- **Quick Reference**: [QUICK_START.md](./QUICK_START.md)
- **Full Docs**: [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)

---

## 🆘 Need Help?

**Issue**: Component doesn't exist
→ Check `/ui-catalog` - 21 components ready

**Issue**: Don't know how to make API call
→ See `services/userService.js` for examples

**Issue**: Need a new page
→ Copy `DashboardPage.jsx` as template

**Issue**: Want to show user feedback
→ Use `useToast()` hook

---

## 💡 Pro Tips

1. Keep `/ui-catalog` open in separate tab
2. Always use services for API calls
3. Copy existing pages as templates
4. Test mobile view early (Ctrl+Shift+M)
5. Use toast notifications for every action

---

## 🏆 You're Ready!

Everything is built, tested, and documented.

**Next**: Run `npm run dev` and start building your hackathon solution! 🚀

---

Built with ❤️ for BE SMART Hackathon
Sponsored by American Airlines
