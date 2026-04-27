# SQLite to PostgreSQL Migration Guide

This document explains the files created, configurations changed, and provides simple instructions on how to run your `sda-uniconnect` application locally from the command prompt.

## 📁 What Was Done

To enable Vercel deployment with PostgreSQL while retaining local development capabilities, the following changes were made:

### 1. Database Abstraction Layer Added
We abstracted the direct database calls so the app can seamlessly switch between SQLite (for simple local dev) and PostgreSQL (for Vercel).
- **`server/db-connection.js`** *(NEW)*: Handles connecting to either SQLite or PostgreSQL based on the `DB_TYPE` environment variable.
- **`server/schema.sql`** *(NEW)*: Holds all the SQL commands to create your database tables for PostgreSQL.
- **`server/db.js`** *(MODIFIED)*: Updated to use the new `db-connection.js` instead of calling `better-sqlite3` directly. This ensured none of your existing endpoint logic had to change.

### 2. Migration Scripts Added
- **`server/migrate-data.js`** *(NEW)*: A script that reads all your existing data from SQLite (`uniconnect.db`) and inserts it into the new PostgreSQL database.
- **`server/rollback-migration.js`** *(NEW)*: A safety script that wipes the PostgreSQL tables if something goes wrong during migration.

### 3. Vercel & Production Configuration
- **`vercel.json`** *(NEW)*: Tells Vercel how to route your API requests and host your static frontend.
- **`server/.env.production`** *(NEW)*: Forces Vercel to use `postgres` as the `DB_TYPE`.
- **`package.json`** *(MODIFIED)*: Added `"migrate"` and `"rollback"` scripts so you can easily run them using `npm run migrate`.
- **`.gitignore`** *(MODIFIED)*: Ensures your local database (`uniconnect.db`) is not pushed to GitHub.

---

## 🚀 How to Run the App Locally

You can run the app using either your local SQLite database or the PostgreSQL test database.

### Method A: Run with SQLite (Quickest & Default)
If you just want to develop without worrying about PostgreSQL running locally:

1. Open a Command Prompt.
2. Navigate to your project and ensure `server/.env` says `DB_TYPE=sqlite`.
3. Start the backend:
   ```cmd
   cd "d:\AG Projects\sda-uniconnect\server"
   npm start
   ```
4. Open a second Command Prompt and start the frontend:
   ```cmd
   cd "d:\AG Projects\sda-uniconnect"
   npm run dev
   ```

### Method B: Run with PostgreSQL (Full Test)
If you want to test the full PostgreSQL integration locally (requires PostgreSQL installed on Windows):

1. **Verify your test database exists:**
   If it's your first time, you must run `createdb uniconnect_test`, load the schema with `psql -d uniconnect_test -f "server\schema.sql"`, and run `npm run migrate` in the root folder.
2. **Switch the Environment Variable:**
   Open `server/.env` and change `DB_TYPE=sqlite` to `DB_TYPE=postgres`.
3. **Start the backend:**
   ```cmd
   cd "d:\AG Projects\sda-uniconnect\server"
   npm start
   ```
   *(You should see `PostgreSQL database ready` in the console).*
4. **Start the frontend:**
   ```cmd
   cd "d:\AG Projects\sda-uniconnect"
   npm run dev
   ```

---

## ☁️ How to Deploy to Vercel
Your code is fully prepped! To deploy:
1. Push these code changes to your GitHub repository.
2. Go to Vercel, import your repository.
3. In the Vercel dashboard, go to the Storage tab and create a Postgres Database.
4. Add the Environment Variables (`DB_TYPE=postgres` and `NODE_ENV=production`). Vercel handles the `DATABASE_URL` automatically.
5. Deploy!
