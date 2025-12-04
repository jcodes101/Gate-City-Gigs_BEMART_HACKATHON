Frontend-only game plan (UI + HTTP, no backend overlap)

0. Local dev setup (today)
   Run the frontend only: cd be-smart && npm install && npm run dev (Vite on 5173).
   Env vars: Create be-smart/.env.local with:
   VITE_BASE_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=<your-client-id>
   Confirm API client: src/utils/api.js should hit VITE_BASE_URL.

1) Build a fast UI foundation
   App shell: Header/Nav, main content area, footer, container widths, responsive grid.
   Theme + tokens: Colors, spacing, typography utilities (Tailwind is installed).
   Common components: Button, Input, Select, Card, Modal, LoadingSpinner, Skeleton, Toast/Alert, EmptyState.
   Layout components: Page, Section, FormRow, Toolbar for consistent structure.

2) Routing + page skeletons
   Add top-level routes in App.jsx:
   / Home
   /login Login
   /dashboard Dashboard
   /problem ProblemStatement (placeholder)

- NotFound
  Each page should include:
  Title, breadcrumb (optional), content area, loading/error slots.

3. Service layer (wrap the API utility)
   Create service modules that consume utils/api.js only (no backend edits):
   services/userService.js: getUsers(), getUser(id), updateUser(...).
   services/authService.js: loginWithGoogle(jwt), getProfile().
   services/aiService.js: placeholder methods that call future endpoints.
   Standardize success: expect { status, code, message, data }.
   Standardize failure: catch and rethrow objects containing { httpStatus, code, message, causes }.
4. Hooks for request state
   useApi (generic): accepts a promise-returning function; returns { data, error, loading, run(params) }.
   useUsers, useProfile: thin wrappers around service methods using useApi.
   useAuth: stores auth token, user profile; exposes login, logout, isAuthenticated.
5. UX patterns for HTTP flows
   Loading: Skeleton on first load; Button-level spinners for actions.
   Errors: Standard ErrorDisplay for API errors (reads error.message/error.causes).
   Empty states: Clear prompts to act when no data.
   Toasts: Success on creates/updates; Warn on 401/403; Error on 500/503.
   Retry: One-click retry on failed loads (useApi.run() again).
   Auth: On 401, clear session and redirect to /login.
6. Auth UI (frontend-only)
   Use existing GoogleAuthButton (it reads VITE_GOOGLE_CLIENT_ID).
   On credential callback:
   Store Google JWT locally,
   Call authService.loginWithGoogle(jwt) when backend route exists,
   Store returned app token (later), set auth context, redirect to /dashboard.
   Show user avatar/name when isAuthenticated, fallback to Sign-in.
7. Ready-for-problem page template
   Scaffold a “Problem Workspace” page with:
   Input area (form with Input, TextArea),
   Results area (cards/list),
   Side panel for filters,
   Toolbar: actions (submit, reset, export).
   Wire buttons to stubbed service calls now; fill endpoints later.
8. Accessibility and responsiveness
   Keyboard navigable components.
   Focus states and visible outlines.
   Semantic HTML with landmarks.
   Responsive breakpoints for mobile/tablet/desktop.
9. Observability (frontend-only)
   Add a lightweight logger util (console wrapper):
   logRequest, logResponse, logError (dev-only).
   ErrorBoundary at route level to catch render errors and show ErrorDisplay.
   Day-of execution flow (when backend gives endpoints)
   Add/confirm service method for the new endpoint.
   Use useApi in the target page/component and call run(params).
   Display loading → success data → or error using ErrorDisplay.
   Hook up toasts and any post-action UI updates.
   If 401, route to /login with a friendly message.
   Automation options (to move faster)
   Component/page generators (zero-backend overlap):
   Add a small generator (Plop or simple Node script) to scaffold:
   Component.jsx, styles.css, stories.mdx (optional), test file (optional).
   Commands: npm run g:component <Name>, npm run g:page <Name>.
   API mocking with MSW:
   Spin up MSW handlers that mirror expected backend responses.
   Develop UI and flows without waiting on real endpoints.
   Toggle with an env var (dev only).
   VS Code tasks:
   Task to run Vite dev + open browser,
   Task to lint/fix, task to run mock server.
   NPM scripts:
   dev:ui: Start Vite + (optional) MSW bootstrap.
   check:env: Quick script to ensure VITE_BASE_URL and Google client ID exist.
   Snippets/templates:
   Add personal VS Code snippets for useApi page pattern, form pattern, table pattern, modal pattern.
   Pre-commit guardrails:
   Lint + format staged files (eslint, prettier) to avoid style churn tomorrow.
   What to avoid (to not overlap backend)
   Don’t add/modify anything in server_side/.
   Don’t define or assume database schema.
   Don’t implement auth verification logic server-side; just consume tokens/responses.
   Don’t alter CORS or server ports.
   Minimal checklist to be “fluent” tomorrow
   .env.local set; Vite dev working.
   Base layout + common UI components ready.
   Routing skeleton + 404 page done.
   services/\* with stubs returning mocked data.
   useApi working with loading/error patterns.
   ErrorBoundary, ErrorDisplay, LoadingSpinner, Toast available.
   ProblemStatementPage template ready to wire.
   Short recap:
   Prepare UI shell, common components, routing, and useApi now.
   Build service modules that wrap utils/api.js and standardize errors.
   Use MSW + generators + scripts to automate and keep you fast.
   Avoid backend files entirely; just consume endpoints via the service layer when ready.
