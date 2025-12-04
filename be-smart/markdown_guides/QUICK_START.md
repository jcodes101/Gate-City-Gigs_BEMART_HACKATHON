# ⚡ Quick Start Guide

## Setup (Do This First)

### 1. Configure Environment Variables

Check if you have `.env` file in `be-smart/` folder:

- If YES: Make sure it has both variables
- If NO: Create `.env` file

Required variables:

```
VITE_BASE_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. Install Dependencies

```bash
cd be-smart
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173

---

## What's Ready to Use

### ✅ Complete UI Component Library

- Buttons (5 variants × 3 sizes)
- Inputs with validation states
- Cards, Loading spinners, Skeletons
- Error displays, Empty states
- Page layouts, Sections, Forms, Toolbars

### ✅ App Structure

- Header with navigation and theme toggle
- Footer with sponsor branding
- 5 Pages ready: Home, Login, Dashboard, Problem Statement, NotFound
- Full routing configured

### ✅ HTTP Request System

- Service layer ready (`services/userService.js`, `services/authService.js`)
- `useApi` hook for easy data fetching with loading/error states
- `useAuth` hook for authentication
- Backend error format handled automatically

### ✅ User Feedback

- Toast notifications (success, error, info, warning)
- Consistent error displays
- Loading states everywhere

### ✅ Theming

- American Airlines-inspired design tokens
- Theme toggle (default ↔ AA theme)
- All components use CSS variables (easy to rebrand)

---

## View Everything

Visit **http://localhost:5173/ui-catalog** to see all components in action.

---

## Quick Workflow for Tomorrow

### Adding a New Feature Page

1. Copy an existing page as template (e.g., `DashboardPage.jsx`)
2. Modify title, content, and sections
3. Add route in `App.jsx`
4. Done!

### Making API Calls

1. Create service function in `services/yourService.js`:

```js
export async function getData() {
  const response = await api.get("/api/your-endpoint");
  if (response.code === 200) return response.data;
  throw new Error(response.message);
}
```

2. Use in component with `useApi`:

```jsx
const { data, error, loading, run } = useApi(getData);

useEffect(() => {
  run();
}, []);
```

3. Handle states:

```jsx
if (loading) return <LoadingSpinner />;
if (error) return <ErrorDisplay message={error.message} />;
return <div>{/* render data */}</div>;
```

### Show User Feedback

```jsx
const { showSuccess, showError } = useToast();

try {
  await saveData();
  showSuccess("Saved!");
} catch (err) {
  showError("Failed to save");
}
```

---

## Key Files You'll Use Tomorrow

- `src/pages/` - Create new pages here
- `src/services/` - Add API calls here
- `src/components/common/` - All reusable components
- `App.jsx` - Add new routes here

---

## Pro Tips

1. **Don't reinvent components** - Check `/ui-catalog` first
2. **Copy existing pages** - Faster than starting from scratch
3. **Use services** - Keep API logic separate from UI
4. **Use toasts** - User feedback on every action
5. **Check console** - All errors are logged there

---

## Need Help?

- **See all components**: http://localhost:5173/ui-catalog
- **Full guide**: Read `FRONTEND_GUIDE.md`
- **Example patterns**: Look at existing pages in `src/pages/`

---

## Automation Already Built

✅ Hot reload (changes appear instantly)
✅ Error boundaries (catches React errors)
✅ Consistent API error handling
✅ Loading states handled by useApi
✅ Toast notifications auto-dismiss
✅ Theme persistence in localStorage
✅ Responsive design (mobile-ready)

You're ready to build! 🚀
