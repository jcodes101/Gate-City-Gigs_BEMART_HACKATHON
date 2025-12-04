# Frontend Developer Guide

## Quick Start

### 1. Setup Environment Variables

Copy `.env.example` to `.env` or `.env.local`:

```bash
cp .env.example .env
```

Fill in your values:

- `VITE_BASE_URL`: Backend API URL (default: `http://localhost:3000`)
- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth Client ID

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Project Structure

```
be-smart/src/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Card.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorDisplay.jsx
│   │   ├── Skeleton.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Page.jsx
│   │   ├── Section.jsx
│   │   ├── FormRow.jsx
│   │   ├── Toolbar.jsx
│   │   └── ThemeToggle.jsx
│   ├── layout/          # Layout components
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   └── auth/            # Auth-related components
│       └── GoogleAuthButton.jsx
├── pages/               # Route-level page components
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── DashboardPage.jsx
│   ├── ProblemStatementPage.jsx
│   ├── NotFoundPage.jsx
│   └── UICatalogPage.jsx
├── services/            # API service layer
│   ├── userService.js
│   └── authService.js
├── hooks/               # Custom React hooks
│   ├── useApi.js
│   └── useAuth.js
├── contexts/            # React contexts
│   └── ToastContext.jsx
├── utils/               # Utility functions
│   └── api.js
├── App.jsx              # Main app component with routing
├── main.jsx             # Entry point
└── index.css            # Global styles with theme tokens
```

---

## Available Components

### Common Components

#### Button

```jsx
import Button from "./components/common/Button";

<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>;
```

Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`
Sizes: `sm`, `md`, `lg`

#### Input

```jsx
import Input from "./components/common/Input";

<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  error="This field is required"
  helperText="We'll never share your email"
/>;
```

#### Card

```jsx
import Card from "./components/common/Card";

<Card padding="md" hover>
  Content here
</Card>;
```

#### Loading & Error States

```jsx
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorDisplay from './components/common/ErrorDisplay';
import Skeleton from './components/common/Skeleton';
import EmptyState from './components/common/EmptyState';

<LoadingSpinner size="md" />
<ErrorDisplay message="Error occurred" onRetry={handleRetry} />
<Skeleton variant="text" />
<EmptyState title="No data" action={<Button>Create</Button>} />
```

### Layout Components

#### Page

```jsx
import Page from "./components/common/Page";

<Page
  title="Dashboard"
  subtitle="Welcome back"
  actions={<Button>Action</Button>}
>
  Content here
</Page>;
```

#### Section

```jsx
import Section from "./components/common/Section";

<Section title="Overview" actions={<Button>Edit</Button>}>
  Section content
</Section>;
```

---

## Making HTTP Requests

### Using Services

```jsx
import { getUsers, createUser } from "./services/userService";

// In your component
const users = await getUsers();
const newUser = await createUser({ name: "John", email: "john@example.com" });
```

### Using the useApi Hook

```jsx
import { useEffect } from "react";
import useApi from "./hooks/useApi";
import { getUsers } from "./services/userService";

function MyComponent() {
  const { data, error, loading, run } = useApi(getUsers);

  useEffect(() => {
    run(); // Fetch data on mount
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error.message} onRetry={run} />;

  return <div>{/* Render data */}</div>;
}
```

---

## Toast Notifications

### Using the useToast Hook

```jsx
import { useToast } from "./contexts/ToastContext";

function MyComponent() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const handleSubmit = async () => {
    try {
      await createUser(data);
      showSuccess("User created successfully!");
    } catch (error) {
      showError("Failed to create user");
    }
  };

  return <Button onClick={handleSubmit}>Submit</Button>;
}
```

---

## Authentication

### Using the useAuth Hook

```jsx
import useAuth from "./hooks/useAuth";

function MyComponent() {
  const { user, loading, isAuthenticated, login, logout } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div>
      Welcome {user.name}!<Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

---

## Theme System

The app supports themeable design tokens. All colors are defined in `src/index.css` as CSS variables.

### Using Theme Colors in Components

```jsx
// Use Tailwind with CSS variables
<div className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-primary-foreground))]">
  Primary background
</div>
```

### Theme Toggle

Users can switch between themes using the ThemeToggle component in the header.

---

## API Response Format

All API responses follow this structure:

```json
{
  "status": 200,
  "code": 200,
  "message": "Success message",
  "data": {
    /* response data */
  },
  "causes": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error codes:

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error
- `503`: Service Unavailable

---

## Tips for Tomorrow (Hackathon Day)

1. **Component Library Ready**: Visit `/ui-catalog` to see all available components
2. **Copy-Paste Patterns**: Use existing pages as templates
3. **Service Layer**: Add new services in `src/services/` following the existing pattern
4. **Error Handling**: All services handle errors consistently
5. **Toast Notifications**: Use for user feedback on actions
6. **Theme**: AA-inspired theme is already set up and switchable

---

## Common Patterns

### Page with Data Fetching

```jsx
import { useEffect } from "react";
import Page from "./components/common/Page";
import useApi from "./hooks/useApi";
import { getData } from "./services/dataService";

export default function MyPage() {
  const { data, error, loading, run } = useApi(getData);

  useEffect(() => {
    run();
  }, []);

  return (
    <Page title="My Page">
      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error.message} onRetry={run} />}
      {data && <div>{/* Render data */}</div>}
    </Page>
  );
}
```

### Form with Submission

```jsx
import { useState } from "react";
import { useToast } from "./contexts/ToastContext";
import Button from "./components/common/Button";
import Input from "./components/common/Input";

export default function MyForm() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await submitData(formData);
      showSuccess("Submitted successfully!");
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
}
```

---

## Need Help?

- **UI Components**: Visit `/ui-catalog` in the running app
- **Existing Code**: Check existing pages for patterns
- **API Utils**: See `src/utils/api.js` for HTTP client
- **Services**: See `src/services/` for API examples
