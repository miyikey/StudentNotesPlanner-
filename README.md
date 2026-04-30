# Student Planner System – Backend API

## Overview

The Student Planner System is a backend API designed to support an academic planning platform. It enables students to manage degrees, courses, assessments, and track academic performance through a structured and secure RESTful architecture.

The system is built with scalability and modularity in mind, separating concerns across routing, business logic, and data access layers.

---

## Features

* User authentication and authorization (JWT-based)
* Course, degree, and semester management
* Assessment and grade tracking with weighted calculations
* Assignment and note management
* Academic analytics (WAM calculation, credit tracking)
* User-scoped data isolation for security

---

## Tech Stack

**Backend**

* Node.js
* Express.js

**Database**

* PostgreSQL
* pg (Node.js client)

**Authentication & Security**

* JSON Web Tokens (JWT)
* bcrypt
* dotenv
* CORS

**Testing**

* Jest
* Supertest

---

## Architecture

The system follows a **layered, modular REST architecture** that separates concerns across multiple layers for scalability, maintainability, and security.

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  🖥️  CLIENT LAYER                                                │
│      ├─ React Frontend (Vite)                                    │
│      └─ HTTP/JSON Requests                                       │
│                                                                   │
│              ↓  HTTP Requests  ↓                                  │
│                                                                   │
│  📡 API LAYER (Express.js)                                      │
│      ├─ 9 Route Modules                                          │
│      │  ├─ /auth          (register, login)                      │
│      │  ├─ /courses       (CRUD operations)                      │
│      │  ├─ /degrees       (CRUD operations)                      │
│      │  ├─ /semesters     (CRUD operations)                      │
│      │  ├─ /assessments   (CRUD operations)                      │
│      │  ├─ /grades        (CRUD + calculations)                  │
│      │  ├─ /notes         (CRUD operations)                      │
│      │  ├─ /assignments   (CRUD operations)                      │
│      │  └─ /summary       (analytics)                            │
│      └─ CORS & JSON Parsing                                      │
│                                                                   │
│              ↓  Route Validation  ↓                               │
│                                                                   │
│  🔐 AUTHENTICATION LAYER                                         │
│      ├─ JWT Middleware                                           │
│      ├─ Verify Token from Authorization Header                   │
│      ├─ Extract userId & Attach to Request                       │
│      └─ Block Unauthorized Access (401/403)                      │
│                                                                   │
│              ↓  Authenticated Request  ↓                          │
│                                                                   │
│  ⚙️  CONTROLLER LAYER (Business Logic)                          │
│      ├─ authController       (authentication)                    │
│      ├─ coursesController    (course management)                 │
│      ├─ degreesController    (degree management)                 │
│      ├─ semestersController  (semester management)               │
│      ├─ assessmentsController(assessment tracking)               │
│      ├─ gradesController     (grade calculations)                │
│      ├─ notesController      (note management)                   │
│      ├─ assignmentsController(assignment tracking)               │
│      └─ summaryController    (analytics & reporting)             │
│                                                                   │
│      Each controller:                                             │
│      • Validates input                                           │
│      • Performs authorization checks                             │
│      • Executes business logic                                   │
│      • Manages user-scoped queries                               │
│                                                                   │
│              ↓  SQL Query  ↓                                      │
│                                                                   │
│  🗄️  DATABASE LAYER                                              │
│      ├─ PostgreSQL Connection Pool                               │
│      ├─ Execute Queries                                          │
│      └─ Return Result Sets                                       │
│                                                                   │
│              ↓  Query Results  ↓                                  │
│                                                                   │
│  📊 POSTGRESQL DATABASE                                          │
│      ├─ users              (authentication)                      │
│      ├─ degrees            (academic programs)                   │
│      ├─ semesters          (term organization)                   │
│      ├─ courses            (subjects)                            │
│      ├─ assessments        (grade components)                    │
│      ├─ grades             (weighted scores)                     │
│      ├─ notes              (student notes)                       │
│      └─ assignments        (tasks)                               │
│                                                                   │
│              ↑  JSON Response  ↑                                  │
│                                                                   │
│      Response Flow: DB → Controllers → API → Client             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow Example: Creating a Course

```
1. Client sends: POST /courses { code, name, credits }
   ↓
2. Express receives request → CORS & JSON parsing
   ↓
3. Route validates JWT token in Authorization header
   ↓
4. JWT Middleware verifies token → Extracts userId
   ↓
5. coursesController.createCourse() receives authenticated request
   ├─ Validates: code & name required
   ├─ Database query: INSERT INTO courses WITH userId filter
   ↓
6. PostgreSQL executes query → Inserts row
   ↓
7. Controller receives result → Formats JSON response
   ↓
8. API returns: { id, code, name, credits, user_id, created_at }
   ↓
9. Client receives JSON → Updates UI
```

### Security Architecture

```
Request → CORS Check ✓ → JSON Parse ✓ → Route Match ✓ 
  → JWT Validation ✓ → Extract userId ✓ → Controller CRUD
  → User-Scoped Query ✓ → Response → Client
  
Key Security Features:
  • JWT tokens expire after 24 hours
  • All queries filtered by userId (prevents data leaks)
  • Passwords hashed with bcrypt
  • Ownership validation before CRUD operations
  • Consistent error handling (404, 401, 403, 500)
```

### Why This Architecture?

| Layer | Purpose | Benefit |
|-------|---------|---------|
| **Client** | User interface | Separation of frontend/backend concerns |
| **API Routes** | HTTP endpoint definitions | Clean request routing, RESTful conventions |
| **Authentication** | JWT verification | Centralized security, reusable middleware |
| **Controllers** | Business logic | Testable, maintainable, easy to extend |
| **Database** | Persistent storage | Relational data integrity, scalability |

This architecture is **production-ready** and demonstrates:
- ✅ Clean separation of concerns
- ✅ Modular, reusable components
- ✅ Strong security practices
- ✅ Scalable design
- ✅ Comprehensive test coverage

---

## Database Design

The database is designed using a relational model that reflects academic structures.

### Core Relationships

* A user can have multiple degrees
* A degree contains semesters
* A semester contains courses
* A course contains assessments

Additional entities:

* Notes
* Assignments
* Grades

### Entity Overview

* **users** – authentication and identity
* **degrees** – academic programs
* **semesters** – organisational units within degrees
* **courses** – individual subjects
* **assessments** – graded components
* **assignments** – standalone tasks
* **grades** – weighted score tracking
* **notes** – user notes

---

## API Endpoints (Sample)

### Authentication

* `POST /auth/register`
* `POST /auth/login`

### Courses

* `GET /courses`
* `POST /courses`
* `PUT /courses/:code`
* `DELETE /courses/:code`

### Assessments

* `GET /assessments/:courseCode`
* `POST /assessments/:courseCode`

### Analytics

* `GET /summary/wam/:degreeId`
* `GET /summary/credits/:degreeId`

All protected routes require a valid JWT token.

---

## Authentication

Authentication is implemented using JSON Web Tokens.

* Users receive a token upon login
* Token must be included in headers:

```
Authorization: Bearer <token>
```

* Middleware verifies token and attaches `userId` to requests
* All protected routes enforce user-level access control

---

## Testing

The project includes a comprehensive test suite to ensure reliability.

* Unit and integration tests using Jest
* API endpoint testing with Supertest
* Validation of success and error scenarios

### Example Test Coverage

* Authentication (register/login)
* CRUD operations across all resources
* Input validation and error handling

---

## Getting Started

### 1. Clone repository

```
git clone <your-repo-url>
cd student-planner-backend
```

### 2. Install dependencies

```
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```
PORT=5000
DATABASE_URL=your_postgres_connection
JWT_SECRET=your_secret_key
```

### 4. Run database setup

```
node config/initTables.js
```

### 5. Start server

```
npm run dev
```

---

## Project Structure

```
server/
├── controllers/
├── routes/
├── middleware/
├── config/
├── tests/
├── app.js
└── server.js
```

---

## Design Decisions

* **Modular architecture** for scalability and maintainability
* **JWT authentication** for stateless security
* **Relational database design** to enforce structured data relationships
* **User-scoped queries** to ensure data isolation
* **Separation of concerns** across routes, controllers, and data access

---

## Future Improvements

* Frontend integration (React-based UI)
* Pagination and filtering for large datasets
* Role-based access control
* Performance optimisation for analytics queries
* Deployment (Docker / cloud hosting)

---

## Author

Developed as part of a full-stack academic planning system project, focusing on backend architecture and API design.
