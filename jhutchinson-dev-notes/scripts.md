# BE SMART HACKATHON - Frontend Developer Notes

## Project Architecture & How Everything Works Together

---

## 📁 SHELL SCRIPTS OVERVIEW

### Purpose

Shell scripts automate building, running, and deploying the application. They handle:

- Installing dependencies
- Building the React frontend
- Starting the backend server
- Deploying to production (EC2)

---

## 🔧 ROOT-LEVEL SCRIPTS

### 1. `run_app.sh` - Local Development (Linux/Mac)

**What it does:**

- Builds the React frontend application
- Installs server dependencies
- Starts the Express server in development mode

**How it works:**

```bash
bash ./scripts/build_react.sh    # Step 1: Build React → creates be-smart/dist/
bash ./scripts/build_server.sh   # Step 2: Install server deps + start server
```

**Key points:**

- Server runs in foreground (script waits until you stop it with Ctrl+C)
- React build output goes to `be-smart/dist/` folder
- Server serves the React build + API endpoints

**When to use:**

- Daily development on Linux/Mac
- Testing locally before deploying

---

### 2. `run_app_wsl.sh` - Local Development (Windows/WSL)

**What it does:**

- Same functionality as `run_app.sh` but for Windows/WSL environment

**How it works:**

```bash
bash ./scripts/wsl_build_react.sh    # Step 1: Build React (WSL-safe)
bash ./scripts/wsl_build_server.sh    # Step 2: Install deps + start server (WSL-safe)
```

**Key differences from `run_app.sh`:**

- Uses Unix line endings (LF) instead of Windows (CRLF) - prevents `$'\r': command not found` errors
- Handles Node.js path differences (WSL Linux Node vs Windows Node.exe)
- Uses `#!/usr/bin/env bash` for better compatibility

**When to use:**

- Daily development on Windows using WSL or Git Bash
- If `run_app.sh` fails due to line ending issues

---

### 3. `deploy_on_ec2.sh` - Production Deployment (EC2)

**What it does:**

- Complete automated deployment to AWS EC2 instance
- Installs prerequisites, builds app, and deploys with PM2 process manager

**Step-by-step process:**

**Step 1-2: Install Prerequisites**

- Installs Node.js 20.x if not present
- Installs PM2 (process manager) globally if not present

**Step 3: Get Latest Code**

- Clones repository OR pulls latest changes from Git
- Default repo: `https://github.com/Eliaslopes248/BE_SMART_HACKATHON.git`

**Step 4: Build React App**

- Navigates to `be-smart/` directory
- Runs `npm install` to install dependencies
- Runs `npm run build` to create production build
- Creates `be-smart/dist/` folder with static files

**Step 5: Install Server Dependencies**

- Navigates to `server_side/` directory
- Runs `npm install --production` (only production dependencies)

**Step 6-7: Setup Directories & Copy Files**

- Creates `/home/ubuntu/be-smart-app` (for server files)
- Creates `/home/ubuntu/be-smart/dist` (for React build)
- Copies all server files to `APP_DIR`
- Creates `.env.production` file if missing (with database and server config)

**Step 8: Copy React Build**

- Copies `be-smart/dist/*` to `/home/ubuntu/be-smart/dist/`

**Step 9-10: Setup PM2 Config & Logs**

- Copies `ecosystem.config.js` (PM2 configuration)
- Creates `logs/` directory for application logs

**Step 11: Configure PM2 Auto-Start**

- Sets up PM2 to automatically restart on server reboot
- Only runs once (checks if already configured)

**Step 12: Start Application**

- Stops old instance if it exists
- Starts new instance with PM2
- Saves PM2 configuration

**When to use:**

- Deploying updates to production EC2 instance
- First-time deployment setup
- Run this script ON the EC2 instance (via SSH)

**Important:**

- Must be run on EC2 instance, not locally
- Requires SSH access to EC2
- PM2 keeps the server running even after you disconnect

---

## 📂 SCRIPTS FOLDER BREAKDOWN

### `scripts/build_react.sh` - Build React Only (Linux/Mac)

**What it does:**

- Installs React frontend dependencies
- Builds React app for production

**Process:**

1. Navigates to `be-smart/` directory
2. Installs dependencies (uses explicit list or `npm install`)
3. Runs `npm run build` → creates `be-smart/dist/` folder

**Output:**

- `be-smart/dist/` folder containing:
  - `index.html` (main HTML file)
  - `assets/` folder (compiled JS and CSS files)

**When to use:**

- When you only need to rebuild the frontend
- After making React code changes

---

### `scripts/build_server.sh` - Build & Run Server (Linux/Mac)

**What it does:**

- Installs server dependencies
- Starts the Express server

**Process:**

1. Navigates to `server_side/` directory
2. Installs server dependencies
3. Sets `NODE_ENV=development`
4. Runs `node server.js` (runs in foreground)

**Important:**

- Script will "hang" because server runs in foreground
- This is normal - server is running and waiting for requests
- Press Ctrl+C to stop the server

**When to use:**

- When you only need to start the server
- For local development testing

---

### `scripts/wsl_build_react.sh` - Build React (WSL/Windows)

**What it does:**

- Same as `build_react.sh` but WSL-safe

**Key differences:**

- Uses Unix line endings (LF) - prevents Windows line ending issues
- Uses `#!/usr/bin/env bash` instead of `#!/bin/bash`
- Resolves paths relative to script location (more reliable)

**When to use:**

- Windows/WSL environment
- If `build_react.sh` fails with line ending errors

---

### `scripts/wsl_build_server.sh` - Build & Run Server (WSL/Windows)

**What it does:**

- Same as `build_server.sh` but WSL-safe

**Key differences:**

- Unix line endings (LF)
- Smart Node.js detection:
  1. First tries to find Linux `node` command
  2. Falls back to Windows `node.exe` at `/mnt/c/Program Files/nodejs/node.exe`
  3. Shows helpful error if neither found

**When to use:**

- Windows/WSL environment
- If `build_server.sh` fails with "node: command not found"

---

## 🔄 HOW SCRIPTS WORK TOGETHER

### Local Development Flow:

```
Developer runs: ./run_app.sh (or run_app_wsl.sh)
    ↓
build_react.sh → Installs React deps → Builds React → Creates dist/
    ↓
build_server.sh → Installs server deps → Starts server
    ↓
Server serves dist/ folder + API endpoints
    ↓
Developer can access app at http://localhost:3000
```

### Production Deployment Flow:

```
Developer pushes code to Git
    ↓
SSH into EC2 instance
    ↓
Run: ./deploy_on_ec2.sh
    ↓
Script automates everything:
  - Pulls code from Git
  - Builds React → dist/
  - Installs server deps
  - Copies files to production locations
  - Starts with PM2
    ↓
App running on EC2 at port 3000
    ↓
Accessible at: http://ec2-52-15-61-144.us-east-2.compute.amazonaws.com:3000
```

---

## 📋 QUICK REFERENCE TABLE

| Script                        | Purpose                    | When to Use       | Environment  |
| ----------------------------- | -------------------------- | ----------------- | ------------ |
| `run_app.sh`                  | Local dev                  | Daily development | Linux/Mac    |
| `run_app_wsl.sh`              | Local dev                  | Daily development | Windows/WSL  |
| `deploy_on_ec2.sh`            | Production deploy          | Deploying to EC2  | EC2 instance |
| `scripts/build_react.sh`      | Build React only           | Rebuild frontend  | Linux/Mac    |
| `scripts/build_server.sh`     | Install & run server       | Start server only | Linux/Mac    |
| `scripts/wsl_build_react.sh`  | Build React (WSL)          | Rebuild frontend  | Windows/WSL  |
| `scripts/wsl_build_server.sh` | Install & run server (WSL) | Start server only | Windows/WSL  |

---

## ⚠️ IMPORTANT NOTES

1. **Line Endings Issue:**

   - Windows uses CRLF (`\r\n`), Linux/Mac uses LF (`\n`)
   - WSL scripts use LF to prevent `$'\r': command not found` errors
   - Always use WSL versions on Windows

2. **Server "Hanging":**

   - `build_server.sh` appears to hang because server runs in foreground
   - This is normal - server is running and waiting for requests
   - Press Ctrl+C to stop

3. **Build Output:**

   - React build creates `be-smart/dist/` folder
   - Server reads from `../be-smart/dist` (relative path)
   - Both must be in correct locations for app to work

4. **PM2 Process Manager:**

   - Used in production (EC2) to keep server running
   - Automatically restarts if server crashes
   - Starts on server reboot
   - Not needed for local development

5. **Environment Variables:**
   - Development: Uses `.env.development` file
   - Production: Uses `.env.production` file
   - Scripts set `NODE_ENV` automatically

---
