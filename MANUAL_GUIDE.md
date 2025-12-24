# Manual Run Guide

Follow these steps to run the Multi-vendor E-commerce project manually.

## 1. Prerequisites
Ensure you have **Node.js** and **npm** installed.

## 2. Terminal 1: Backend Server
Open your first terminal in the root directory (`/home/anurag/mern-project`):

```bash
# Install backend dependencies (if not already done)
npm install

# Start the server
npm start
```
*   **Port:** 5000
*   **Note:** The backend uses an in-memory database and will automatically seed data (Users, Products, Shop) on startup.

## 3. Terminal 2: Frontend Server
Open a second terminal in the `client` directory:

```bash
cd client

# Install frontend dependencies (if not already done)
npm install

# Start the Vite development server
npm run dev
```
*   **Port:** 5173 (usually)
*   **URL:** [http://localhost:5173](http://localhost:5173)

---

## 4. Test Credentials
Once both are running, use these to log in:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `user0@example.com` | `password123` |
| **Vendor** | `user1@example.com` | `password123` |
| **User** | `user2@example.com` | `password123` |

## 5. Troubleshooting
*   **Port already in use:** If you see "EADDRINUSE", run `fuser -k 5000/tcp` (on Linux) or a similar command to kill the lingering process.
*   **No data:** If the app is empty, restart the backend server; the `autoSeed` logic will run again.
