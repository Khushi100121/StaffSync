# StaffSync — HR Management System

StaffSync is a web-based Human Resource Management System (HRMS) designed to simplify employee management and everyday HR operations. It provides a centralized workspace for managing employee records, leave requests, attendance, announcements, and training programs.

The project is developed using the MERN stack and includes role-based features for HR personnel, managers, and employees.

## Project Overview

StaffSync follows a three-layer architecture:

- **Frontend:** React.js provides the user interface and dashboards.
- **Backend:** Node.js and Express.js handle API requests, authentication, and application logic.
- **Database:** MongoDB stores application data, with Mongoose used to define data models and interact with the database.

## Features

- **User Authentication:** User registration and login using password hashing and JWT-based authentication.
- **Role-Based Access:** Separate permissions and interface options for HR, managers, and employees.
- **Employee Management:** View employee records and add employee details.
- **Leave Management:** Submit leave requests and approve or reject pending requests.
- **Attendance Management:** View attendance records.
- **Announcements:** Publish and view workplace announcements.
- **Training and Development:** Add and view training programs.
- **Dashboard:** Display summary statistics and recent leave requests.

## User Roles

### HR
- View and manage employee records.
- Add employee information.
- Review and process leave requests.
- Publish announcements.
- Add training programs.
- Access attendance records.

### Manager
- Access the employee directory.
- Review and process leave requests.
- Add training programs.
- Access relevant workspace information.

### Employee
- Access the dashboard.
- Submit leave requests.
- View leave requests and their status.
- View attendance records, announcements, and training programs.

*Note: Available actions depend on the permissions implemented in the application.*

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Frontend Development Server | Vite |
| Backend Runtime | Node.js |
| Backend Framework | Express.js |
| Database | MongoDB |
| Database Object Modeling | Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| API Communication | REST API |
| Development Environment | Visual Studio Code |

## Project Structure

```text
StaffSync/
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js
│   ├── routes.js
│   └── models.js
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── App.jsx
        ├── api.js
        ├── main.jsx
        └── style.css
```

## Prerequisites

Before running the project, install:

- Node.js 18 or later; Node.js 20 LTS is recommended.
- npm, which is included with Node.js.
- MongoDB Community Server or a MongoDB Atlas database.
- Visual Studio Code or another code editor.

## Installation and Setup

### 1. Clone the Repository

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR-USERNAME/StaffSync.git
cd StaffSync
```

Alternatively, download the repository as a ZIP file from GitHub and extract it.

### 2. Configure the Backend

Open a terminal in the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file by copying `.env.example`.

On Windows PowerShell, run:

```powershell
Copy-Item .env.example .env
```

Configure the environment variables in `.env` according to your setup.

For a local MongoDB installation, the default connection string is:

```text
mongodb://127.0.0.1:27017/staffsync
```

Ensure that MongoDB is running before starting the backend.

### 3. Start the Backend Server

From the `backend` directory, run:

```bash
npm run dev
```

The backend uses port `4000` by default.

To check the server's health, open:

```text
http://localhost:4000/api/health
```

### 4. Configure and Start the Frontend

Open a second terminal in the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL in the terminal. Open that URL in your browser, usually:

```text
http://localhost:5173
```

Keep both development servers running while using the application.

## Database Models

The application defines the following Mongoose models:

- **User:** Account details, password hash, and user role.
- **Employee:** Employee profile and employment details.
- **Leave:** Leave requests, dates, reasons, and approval status.
- **Attendance:** Employee attendance records.
- **Announcement:** Workplace announcements.
- **Training:** Training program details.

## API Overview

The backend exposes REST API endpoints under `/api`.

| Endpoint | Purpose |
|---|---|
| `/api/health` | Check backend server status |
| `/api/auth/register` | Register a user |
| `/api/auth/login` | Authenticate a user |
| `/api/auth/me` | Retrieve the authenticated user's details |
| `/api/employees` | Access employee records |
| `/api/leaves` | Access and submit leave requests |
| `/api/attendance` | Access attendance records |
| `/api/announcements` | Access announcements |
| `/api/trainings` | Access training programs |

The API uses authentication and role-based restrictions for protected operations.

## Security Considerations

- Passwords are hashed rather than stored as plain text.
- JWTs are used for authenticated API requests.
- Protected operations use role-based authorization.
- Environment variables are used for configuration.

**Important:** The current project allows users to select a role during registration for demonstration purposes. This must be restricted before production deployment so that users cannot grant themselves HR or manager privileges.

Never commit `.env` files containing database credentials, JWT secrets, or other sensitive information to a public repository.

## Project Status

StaffSync is a coursework project intended to demonstrate the design and development of a full-stack HR Management System.

Features should be tested in the local environment before the application is presented as fully functional.

## Future Enhancements

- Improved employee profile management.
- Attendance marking and reporting.
- Employee self-service features.
- Enhanced role and permission management.
- Improved form validation and error handling.
- Deployment to a public hosting platform.

## Author

**Khushi Moga**

Developed as an academic project to demonstrate full-stack web development using the MERN technology stack.
