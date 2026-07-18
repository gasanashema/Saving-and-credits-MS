# Saving & Credits Management System (Ikibina MS)

Ikibina MS is a modern financial cooperative management application designed to automate and streamline savings, loans (credits), in-app communications, notifications, and penalty enforcement for community savings circles (**Ikibina**). 

The platform supports web dashboards for administrators and members, USSD gateway simulation for offline accessibility, and automated backend services to ensure operational consistency.

---

## 📸 Application Preview (Screenshots)

### 1. Modern Login Portal
Features secure dual-mode login for members (via Phone/PIN) and administrators.
![Login Portal](screenshoots/Screenshot%20from%202026-07-18%2020-12-23.png)

### 2. Admin Dashboard Overview
Displays key metrics including Total Members, Total Savings, Active Loans, and Profits alongside recent transaction activities.
![Dashboard Overview](screenshoots/Screenshot%20from%202026-07-18%2020-13-14.png)

### 3. Reports & Analytics
Visualizes cooperative growth indicators and loan status distributions (Paid, Active, Pending, Rejected) with exporting tools.
![Reports and Analytics](screenshoots/Screenshot%20from%202026-07-18%2020-13-47.png)

### 4. Loan Packages Configurator
Provides administrators with settings for minimum savings prerequisites, duration limits, and interest rates for different loan tiers.
![Loan Packages](screenshoots/Screenshot%20from%202026-07-18%2020-14-08.png)

### 5. In-App Notifications & Messaging
Manages internal messaging alerts for loans, savings submissions, and cooperative notifications.
![Notifications Panel](screenshoots/Screenshot%20from%202026-07-18%2020-18-01.png)

---

## 🛠️ Technology Stack

*   **Frontend**: React (Vite, TypeScript, TailwindCSS, Ant Design UI elements, Recharts data visualization)
*   **Backend**: Node.js (Express, mysql2 client driver, node-cron, JSON Web Token security, Bcrypt password hashing)
*   **Database**: MySQL / MariaDB (relational schema with pre-configured indexes and constraints)
*   **API Exposure / Tunneling**: Ngrok integration for local webhooks/USSD testing

---

## 📁 Project Structure

```
Saving-and-credits-MS/
├── backend/                    # Node.js Express REST API & Cron services
│   ├── db/                     # MySQL connection pools, schemas, and migrations
│   │   ├── ikibina_app.sql     # Database structure and seeds
│   │   ├── connection.js       # Database client pool configuration
│   │   └── migrate.js          # Migration execution script
│   ├── Routes/                 # Modular Express route handlers
│   │   ├── users.router.js     # Auth, admin registers, profiles
│   │   ├── saving.router.js    # Savings logs & transaction limits
│   │   ├── loan.route.js       # Credit eligibility, packages, payments
│   │   ├── penalties.route.js  # Manual and auto penalty handlers
│   │   ├── pay.route.js        # MoMo API client integration
│   │   └── ussd.route.js       # Offline USSD gateway simulation
│   ├── services/               # Core business services & query execution
│   ├── utilities/              # Automated scheduler, BCrypt helper
│   ├── server.js               # Application entry point & node-cron setup
│   └── .env                    # System port, JWT secrets, database credentials
│
├── frontend/                   # Single Page Application (React TS)
│   ├── src/
│   │   ├── components/         # Reusable widgets and UI overlays
│   │   ├── views/              # Pages: Admin Dashboard, Member Dashboard, Loans
│   │   └── utils/
│   │       └── server.ts       # Axios instance mapping API baseURL
│   └── package.json            # Frontend dependency manifest
```

---

## 🚀 How to Run the Project

Follow these steps to set up the MySQL database, configure variables, and run both Server and Client environments.

### 📋 Prerequisites
Ensure you have the following installed locally:
*   **Node.js** (v18.x or v20.x recommended)
*   **MySQL Server** (or MariaDB)
*   **npm** (Node Package Manager)

---

### Step 1: Database Initialization
1.  Start your MySQL server.
2.  Create a new database named `ikibina_db` (or `ikibina_app`):
    ```sql
    CREATE DATABASE ikibina_db;
    ```
3.  Execute/restore the schema & seed SQL file into the new database:
    *   Path to SQL: `backend/db/ikibina_app.sql`
    *   This seeds the cooperative structure, basic savings packages (Main Share, Basic Share), fine structures, and mock users.

---

### Step 2: Configure and Start the Backend
1.  Navigate into the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install all backend dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    *   Open [backend/db/connection.js](file:///data/projects/other/Saving-and-credits-MS/backend/db/connection.js) and verify that the database host, user, password, database name, and port match your local server environment.
    *   Review the variables defined inside the [backend/.env](file:///data/projects/other/Saving-and-credits-MS/backend/.env) file:
        *   `DB_NAME`: Database name (e.g. `ikibina_db`)
        *   `JWT_SECRET`: Secret hash for user token signing
        *   `MOMO_API_KEY`: API Key mapping MTN MoMo integrations
4.  Start the backend API server:
    ```bash
    npm start
    ```
    *   *The backend server will launch at `http://localhost:3000` via nodemon.*

---

### Step 3: Configure and Start the Frontend
1.  Open a new terminal window and navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install frontend web dependencies:
    ```bash
    npm install
    ```
3.  Configure endpoints link:
    *   Open [frontend/src/utils/server.ts](file:///data/projects/other/Saving-and-credits-MS/frontend/src/utils/server.ts).
    *   Confirm the Axios `baseURL` points to your backend instance (default: `http://localhost:3000/api/ikv1/`).
4.  Launch the React dev server:
    ```bash
    npm run dev
    ```
    *   *The frontend dashboard will be running at `http://localhost:5173`.*

---

## 🐳 Running with Docker Compose

You can easily launch the entire system—including the MySQL database, Node.js API backend, and React/Nginx frontend—using Docker Compose.

### Setup and Start:
1. Make sure you have **Docker** and **Docker Compose** installed on your machine.
2. From the project root directory, run the build and run command:
   ```bash
   docker compose up --build -d
   ```
3. Docker Compose will:
   * Spin up a MySQL 8 container, automatically initialize the schema and populate the database with `seed.sql`.
   * Compile and start the Express API backend (binding on `localhost:3000`).
   * Compile the Vite React client, package it within a custom Nginx configuration with proper client-side route fallback mechanisms, and serve the application on port `80` (accessible at `http://localhost`).

### Shut down the system:
```bash
docker compose down -v
```

---

## 🔑 Pre-seeded Testing Credentials

Use the following seeded accounts to navigate the cooperative dashboard:

### 1. Cooperative Administrators (Web Portal)
| User Role | Email/Username | Password |
| :--- | :--- | :--- |
| **Super Admin** | `sadmin@example.com` | `12345` |
| **Co-Op Admin** | `alice@example.com` | `12345` |
| **Co-Op Recorder** | `bob@example.com` | `12345` |

### 2. Cooperative Member (Web / USSD Portal)
| Member | Telephone | Password / PIN | NID |
| :--- | :--- | :--- | :--- |
| **Alice Umwari** | `0781884859` | `12345` | `1234567890098765` |

---

## 🛡️ Business Rules & Services

1.  **Weekly Automated Penalties**:
    *   A cron scheduler runs every Sunday at midnight (`0 0 * * 0`) running `AutoPenalityService()`.
    *   It scans the database to check if any member missed their required weekly saving deposit.
    *   If a miss is detected, a default penalty fee of `500 RWF` (associated with Type 1 penalty: *Late Payment*) is automatically applied to the member's account.
2.  **Loan Eligibility & Limits**:
    *   Members can request loans directly through their dashboard or offline USSD simulation.
    *   A member's borrowing eligibility and maximum limits are dynamically generated using cumulative saving balances, current outstanding penalities, and historical repayment indexes.
3.  **Audit Logs**:
    *   Every modification made to members' balances or saving records is permanently logged in the audit-trail table (`saving_edit_history`).
