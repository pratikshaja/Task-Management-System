# Task-Management-System
Task management system for employee
# Employee Task Management System

A full-stack task management application built for [Company Name] as part of the Full Stack Developer assignment. Supports role-based authentication (Admin/Employee), employee management, task assignment with business rules, notifications, file uploads, and exportable reports.

## Tech Stack

**Frontend:** React.js, Redux Toolkit, React Router, Formik + Yup, Tailwind CSS, Axios
**Backend:** Node.js, Express.js
**Database:** MySQL (via Sequelize ORM)
**Authentication:** JWT (JSON Web Tokens)
**File Upload:** Multer
**Reports:** XLSX, File-Saver (client-side Excel/CSV export)

## Features

- JWT-based authentication with Register/Login, role selection (Admin/Employee)
- Role-based dashboard (Admin sees org-wide stats, Employee sees personal task stats)
- Employee management — add, edit, delete, search, sort, paginate (Admin only)
- Task management — full CRUD with business rules:
  - Due Date cannot be earlier than Start Date
  - Completed tasks cannot be edited
  - Employees see only their own tasks; Admins see all tasks
- In-app notifications (task assigned, task completed)
- File upload support for tasks (PDF/JPG/PNG, max 5MB)
- Reports — Completed, Pending, and Employee-wise, exportable to Excel and CSV

## Project Structure
task-management-system/
├── backend/          # Node.js + Express API
├── frontend/         # React application
└── README.md
## Prerequisites

- Node.js (v18 or higher)
- MySQL Server (v8.0 or higher)
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/pratikshaja/Task-Management-System.git
cd Task-Management-System
```

### 2. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE task_management;
```

(Alternatively, import the schema from `database/task_management.sql` included in this repo.)

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following:
Start the backend server:

```bash
npx nodemon server.js
```

The backend will run on `http://localhost:5000`. Tables are created automatically on first run via Sequelize.

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder (if using a custom API URL):
VITE_API_URL=http://localhost:5000/api
Start the frontend:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`.

### 5. Using the Application

1. Register a new account — choose role **Admin** or **Employee**
2. Login with your credentials
3. **As Admin:** manage employees, create/assign tasks, view reports, export Excel/CSV
4. **As Employee:** view assigned tasks, update task status, receive notifications

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET/POST/PUT/DELETE | `/api/employees` | Employee CRUD (Admin only) |
| GET/POST/PUT/DELETE | `/api/tasks` | Task CRUD |
| PUT | `/api/tasks/upload/:id` | Upload file attachment to a task |
| GET | `/api/dashboard` | Role-based dashboard stats |
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/reports?reportType=completed\|pending\|employee-wise` | Generate reports |

## Database Schema

See `database/task_management.sql` for the full schema, including `Users`, `Employees`, `Tasks`, and `Notifications` tables.

## Author

Pratiksha Jadhav
