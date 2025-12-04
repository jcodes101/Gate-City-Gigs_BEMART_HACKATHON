# Server-Side Folder (`server_side/`)

## What It Is

The backend Express.js server that:

- Serves the React frontend (static files)
- Handles API requests from frontend
- Connects to AWS RDS MySQL database
- Integrates with AWS Bedrock (AI models)

---

## Main Files

### `server.js` - Main Server Entry Point

**What it does:**

- Creates Express app instance
- Loads environment variables (`.env.development` or `.env.production`)
- Sets up middleware (CORS, body parser, static file serving)
- Serves React build from `../be-smart/dist/`
- Handles all routes (serves React SPA for client-side routing)
- Listens on port 3000

**Key features:**

- CORS configured for localhost dev servers + EC2 production
- Serves static files (React build) from `be-smart/dist/`
- Catch-all route returns `index.html` (enables React Router)

**How it works:**

```
Request comes in → Express middleware →
  If API route → Handle API request →
  If static file → Serve from dist/ →
  Otherwise → Serve index.html (React Router handles it)
```

---

### `route_modules/` - API Endpoints

**What it does:**

- Modular route handlers (one file per feature)
- Currently: `users.js` (empty placeholder)

**How to use:**

- Backend devs create route files here
- Import and mount in `server.js`
- Example: `app.use('/api/users', require('./route_modules/users'))`

**For frontend:**

- You'll make HTTP requests to these endpoints
- Use `src/utils/api.js` to call them
- Example: `api.get('/api/users')` or `api.post('/api/users', data)`

---

### `utils/` - Helper Functions

#### `error.js` - Standardized Error Codes

**What it does:**

- Defines standard response codes (RC) for all API responses
- Provides consistent error format across all endpoints

**RC Codes available:**

- `SUCCESS` (200) - Request successful
- `BAD_REQUEST` (400) - Invalid parameters
- `UNAUTHORIZED` (401) - Missing/invalid token
- `FORBIDDEN` (403) - Insufficient permissions
- `NOT_FOUND` (404) - Data/endpoint not found
- `CONFLICT` (409) - Duplicate data
- `VALIDATION_ERROR` (422) - Invalid input
- `SERVER_ERROR` (500) - Internal error
- `SERVICE_UNAVAILABLE` (503) - Database/service down

**For frontend:**

- All API responses follow this format
- Check `response.status` and `response.code` to handle errors
- Display `response.message` to users

#### `endpoint_helpers.js` - API Utilities

**What it does:**

- `RC_RESPONSE()` - Formats responses with RC codes
- `authorizeUse()` - Authorization middleware (role-based access)

**For frontend:**

- You don't directly use this, but it affects API responses
- Authorization middleware checks user permissions before allowing API access

---

### `wrappers/` - AWS Service Integrations

#### `database.js` - AWS RDS MySQL Wrapper

**What it does:**

- Provides simple interface to MySQL database
- Handles connection pooling
- Supports IAM authentication
- Provides transaction support

**Key functions:**

- `query(sql, params)` - Execute SQL query
- `transaction(callback)` - Execute multiple queries atomically
- `testConnection()` - Verify database connectivity

**For frontend:**

- You don't directly use this
- Backend uses it to store/retrieve data
- Your API calls trigger database operations

#### `aws_bedrock.js` - AWS Bedrock AI Wrapper

**What it does:**

- Interface to AWS Bedrock AI models (Llama, Titan)
- Sends prompts to AI and returns responses
- Default model: `meta.llama3-8b-instruct-v1:0`

**Key functions:**

- `invokeModel(prompt, modelId, options)` - Send prompt to AI
- `prompt(prompt)` - Simple prompt function
- `testConnection()` - Verify Bedrock access

**For frontend:**

- You'll likely have features that use AI
- Frontend sends prompt → Backend calls Bedrock → Returns AI response
- Example: User types question → API call → AI response displayed

---

### `ecosystem.config.js` - PM2 Configuration

**What it does:**

- Configuration for PM2 process manager (production)
- Defines how server runs on EC2

**Settings:**

- Port: 3000
- Auto-restart: Yes
- Memory limit: 1GB
- Logs: `./logs/` directory

**For frontend:**

- Not directly used by you
- Ensures server stays running in production

---

## How It Ties Into Overall Project

### Request Flow:

```
User Browser → React App (frontend)
    ↓
Frontend makes API call using api.js
    ↓
HTTP Request → Express Server (server.js)
    ↓
Route Handler (route_modules/) →
    ↓
Uses wrappers/ (database.js or aws_bedrock.js)
    ↓
Returns Response (using utils/error.js format)
    ↓
Frontend receives response → Updates UI
```

### Static File Serving:

```
User visits website → Express Server
    ↓
Serves React build from be-smart/dist/
    ↓
React app loads → Makes API calls to same server
```

### Key Integration Points:

1. **Frontend → Backend:**

   - Frontend uses `src/utils/api.js` to make HTTP requests
   - Requests go to `http://localhost:3000` (dev) or EC2 URL (prod)
   - Backend responds with standardized RC format

2. **Backend → Database:**

   - Backend uses `wrappers/database.js` to query MySQL
   - Stores user data, app data, etc.

3. **Backend → AI:**

   - Backend uses `wrappers/aws_bedrock.js` for AI features
   - Frontend sends prompts → Backend processes with AI → Returns results

4. **Deployment:**
   - Server runs on EC2 with PM2
   - Serves both React app and API from same server
   - Single port (3000) for everything

---

## For Frontend Developer

### What You Need to Know:

1. **API Endpoints:**

   - Backend devs will create endpoints in `route_modules/`
   - You'll call them using `api.get()`, `api.post()`, etc.
   - All responses follow RC code format

2. **Error Handling:**

   - Check `response.status` and `response.code`
   - Display `response.message` to users
   - Handle different error codes appropriately

3. **CORS:**

   - Already configured for localhost and EC2
   - Should work out of the box

4. **Environment:**
   - Development: `http://localhost:3000`
   - Production: EC2 URL (check with backend team)

### What You Don't Need to Worry About:

- Database connections (backend handles it)
- AWS Bedrock setup (backend handles it)
- Server configuration (backend handles it)
- PM2 setup (backend handles it)

---

## 📁 Static Files & Static File Serving Explained

### What Are Static Files?

**Static files** are files that don't change based on user input or server processing. They're pre-built and served as-is.

**In your React app, static files include:**

- `index.html` - The main HTML file
- `assets/index-XXXXX.js` - Your compiled React JavaScript code
- `assets/index-XXXXX.css` - Your compiled CSS styles
- `vite.svg` - Images, icons, fonts, etc.

**These files are created when you run:**

```bash
npm run build  # Creates be-smart/dist/ folder with all static files
```

### What Is Static File Serving?

**Static file serving** means the server sends these pre-built files directly to the browser without processing them.

**How it works in your project:**

1. **You build React app:**

   ```
   npm run build → Creates be-smart/dist/ folder
   ```

2. **Server serves these files:**

   ```javascript
   // In server.js line 79:
   app.use(express.static(BUILD_PATH)); // BUILD_PATH = ../be-smart/dist
   ```

   This tells Express: "When someone requests a file, look in the `dist/` folder and send it directly."

3. **User visits website:**
   ```
   Browser requests: http://localhost:3000/
   ↓
   Server sends: be-smart/dist/index.html
   ↓
   Browser reads index.html, sees it needs:
   - /assets/index-C1CaPz0L.js
   - /assets/index-D9mzw9jQ.css
   ↓
   Browser requests: /assets/index-C1CaPz0L.js
   ↓
   Server sends: be-smart/dist/assets/index-C1CaPz0L.js
   ↓
   React app loads and runs!
   ```

### Why This Matters

**Without static file serving:**

- Your React app wouldn't load
- Browser couldn't get the HTML, JS, or CSS files
- Website wouldn't work

**With static file serving:**

- Server automatically sends the right files
- React app loads correctly
- All your components, styles, and assets work

### The Flow:

```
User types: localhost:3000
    ↓
Server checks: Is this an API route? No.
    ↓
Server checks: Is this a static file? Yes!
    ↓
Server sends: be-smart/dist/index.html
    ↓
Browser loads HTML → Sees it needs JS/CSS
    ↓
Browser requests: /assets/index-XXXXX.js
    ↓
Server sends: be-smart/dist/assets/index-XXXXX.js
    ↓
React app runs!
```

### Key Points:

1. **Static files = Pre-built files** (HTML, JS, CSS, images)
2. **Static serving = Server sends files directly** (no processing)
3. **Your React build** (`be-smart/dist/`) contains all static files
4. **Server automatically serves them** when users visit your site
5. **You don't need to do anything** - it just works!

### For Frontend Developer:

- When you build React (`npm run build`), you create static files
- Server automatically serves them
- Users get your React app when they visit the website
- You don't need to configure anything - it's already set up!

---

## Summary

The `server_side/` folder is the backend that:

- Serves your React app (static files)
- Handles API requests
- Connects to database
- Integrates with AI services
- Returns standardized responses

As frontend dev, you mainly interact with it through HTTP requests using `api.js`.
