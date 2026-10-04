# AI-Powered Claims Processing Platform

A full-stack insurance claims management platform built with **Java,
Spring Boot, React, TypeScript, Spring Security, JWT and PostgreSQL**.

The platform provides role-based workflows for administrators and
claimers, claim management and review workflows, dashboard data, secure
authentication, and cloud-backed persistence using Neon PostgreSQL.

> **Current database:** Neon PostgreSQL\
> **Backend:** Spring Boot 3.3.5\
> **Frontend:** React + TypeScript + Vite\
> **Java target:** 17

------------------------------------------------------------------------

## Overview

The application models a realistic insurance claims workflow:

-   Secure login and registration
-   JWT-based authentication
-   ADMIN and CLAIMER roles
-   Customer-specific claim access
-   Claim creation and management
-   Claim review workflows
-   Risk and fraud assessment fields
-   Dashboard summaries
-   PostgreSQL persistence using Neon
-   Seeded development/demo data
-   Docker-ready project structure

The frontend and backend are maintained as separate applications and
communicate through REST APIs.

------------------------------------------------------------------------

## Architecture

``` text
┌──────────────────────────┐
│     React + Vite         │
│    TypeScript Frontend   │
│       Port: 5173         │
└────────────┬─────────────┘
             │ REST / JSON
             ▼
┌──────────────────────────┐
│      Spring Boot API     │
│        Port: 8081        │
│                          │
│ Controllers              │
│ Services                 │
│ Spring Security + JWT    │
│ JPA / Hibernate          │
└────────────┬─────────────┘
             │ JDBC / SSL
             ▼
┌──────────────────────────┐
│     Neon PostgreSQL      │
│                          │
│ Users                    │
│ Claims                   │
└──────────────────────────┘
```

------------------------------------------------------------------------

## Key Features

### Authentication & Authorization

-   User registration and login
-   BCrypt password hashing
-   JWT-based authentication
-   Stateless Spring Security
-   Role-based authorization
-   ADMIN and CLAIMER roles
-   Customer ID mapping for claimer accounts

### Claims Management

Claims contain information such as:

-   Claim number
-   Customer ID
-   Claim type
-   Description
-   Estimated amount
-   Classification
-   Confidence score
-   Fraud score
-   Fraud flags
-   Risk level
-   Priority
-   Status
-   Recommended action
-   Key signals
-   Review information
-   Created/updated timestamps

### Claim Workflow

Supported statuses include:

``` text
PROCESSED
REVIEW_REQUIRED
APPROVED
REJECTED
```

Claims are also seeded with simulated risk, fraud and priority
information for demonstration purposes.

------------------------------------------------------------------------

## Technology Stack

### Backend

  Technology          Purpose
  ------------------- ------------------------------
  Java 17             Application target
  Spring Boot 3.3.5   Backend framework
  Spring Web          REST APIs
  Spring Data JPA     Data access
  Hibernate           ORM
  Spring Security     Authentication/authorization
  JWT                 Stateless authentication
  BCrypt              Password hashing
  PostgreSQL          Relational database
  Neon                Cloud PostgreSQL
  Maven               Build/dependency management

### Frontend

  Technology   Purpose
  ------------ ---------------------------
  React        User interface
  TypeScript   Type-safe frontend
  Vite         Development/build tooling
  CSS          Styling

### Development & Deployment

  Technology        Purpose
  ----------------- -----------------------------
  Git               Version control
  Docker            Container-ready deployment
  Docker Compose    Multi-service deployment
  Jenkins / CI/CD   Future delivery integration

------------------------------------------------------------------------

## Project Structure

``` text
ai-claims-platform/
│
├── backend/
│   └── claims-service/
│       ├── src/
│       │   └── main/
│       │       ├── java/com/claims/
│       │       │   ├── config/
│       │       │   ├── controller/
│       │       │   ├── dto/
│       │       │   ├── entity/
│       │       │   ├── repository/
│       │       │   ├── security/
│       │       │   ├── service/
│       │       │   ├── ClaimsServiceApplication.java
│       │       │   └── DataSeeder.java
│       │       └── resources/
│       │           └── application.yml
│       ├── pom.xml
│       └── Dockerfile
│
├── frontend/
│   └── claims-dashboard/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Login.tsx
│       │   │   ├── MyProfile.tsx
│       │   │   ├── Notifications.tsx
│       │   │   └── Preferences.tsx
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── styles.css
│       ├── index.html
│       ├── package.json
│       ├── package-lock.json
│       ├── tsconfig.json
│       └── vite.config.ts
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

------------------------------------------------------------------------

## Prerequisites

Install:

-   Java 17+
-   Maven 3.9+
-   Node.js 18+
-   npm
-   A PostgreSQL database

The current project uses **Neon PostgreSQL**, so PostgreSQL does not
need to be installed locally.

Docker is optional for local development.

------------------------------------------------------------------------

# Backend Setup

## 1. Configure Neon PostgreSQL

The backend reads database credentials from environment variables.

Example:

``` text
DATABASE_URL=jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=your-password
```

### Windows PowerShell

``` powershell
$env:DATABASE_URL="jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require"
$env:DATABASE_USERNAME="neondb_owner"
$env:DATABASE_PASSWORD="YOUR_NEON_PASSWORD"
```

Never commit the real password.

## 2. Start the backend

``` powershell
cd backend\claims-service
mvn clean spring-boot:run
```

Backend:

``` text
http://localhost:8081
```

A successful startup contains:

``` text
Tomcat started on port 8081
Started ClaimsServiceApplication
```

## 3. Database initialization

Hibernate creates/updates the required tables using:

``` yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

The project includes seeders for development/demo data.

### Demo claims

Claims are seeded in the range:

``` text
CLM-100001 ... CLM-100150
```

Customer IDs:

``` text
CUST-10001 ... CUST-10150
```

The claims seeder checks existing claim numbers before inserting, so
restarting the application does not create duplicate claims.

------------------------------------------------------------------------

# Frontend Setup

Open a second terminal:

``` powershell
cd frontend\claims-dashboard
npm install
npm run dev
```

Frontend:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# Demo Accounts

## Admin accounts

  Email                       Password
  --------------------------- -------------
  `admin@claims.ai`           `Admin@123`
  `admin.ops@claims.ai`       `Admin@123`
  `admin.manager@claims.ai`   `Admin@123`
  `admin.risk@claims.ai`      `Admin@123`
  `admin.fraud@claims.ai`     `Admin@123`
  `admin.super@claims.ai`     `Admin@123`

## Claimer accounts

150 claimer accounts are generated:

``` text
customer10001@claims.ai
customer10002@claims.ai
...
customer10150@claims.ai
```

Password:

``` text
Claimer@123
```

Each account maps to the corresponding customer ID.

Example:

``` text
Email:       customer10001@claims.ai
Password:    Claimer@123
Customer ID: CUST-10001
```

> These credentials are for development/demo use only.

------------------------------------------------------------------------

# API

Base URL:

``` text
http://localhost:8081/api/v1
```

## Authentication

``` text
POST /auth/login
POST /auth/register
```

## Claims

Claim operations are exposed through the claims controller, including
retrieval, creation and review workflows.

See:

``` text
backend/claims-service/src/main/java/com/claims/controller/ClaimController.java
```

Protected endpoints require the JWT returned by the login API.

------------------------------------------------------------------------

# Security

The application uses:

-   Spring Security
-   JWT authentication
-   BCrypt password hashing
-   Stateless authentication
-   Role-based authorization
-   CORS configuration for the React frontend

Authentication flow:

``` text
User
  ↓
Login API
  ↓
Credential validation
  ↓
BCrypt password verification
  ↓
JWT generation
  ↓
Frontend
  ↓
Authenticated API requests
  ↓
JWT validation + role authorization
```

------------------------------------------------------------------------

# Environment Variables

Use environment variables instead of committing secrets.

`.env.example`:

``` env
DATABASE_URL=jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=your-password-here
```

Never commit:

``` text
.env
.env.*
```

Only safe example values belong in `.env.example`.

------------------------------------------------------------------------

# Docker

Docker is not required for the current local setup because PostgreSQL is
hosted by Neon.

The repository remains Docker-ready so it can be run in environments
that support containers.

A future deployment can use:

``` text
React container
      ↓
Spring Boot container
      ↓
PostgreSQL / Neon
```

------------------------------------------------------------------------

# Build

## Backend

``` powershell
cd backend\claims-service
mvn clean package
```

Build output:

``` text
target/
```

## Frontend

``` powershell
cd frontend\claims-dashboard
npm run build
```

Build output:

``` text
dist/
```

`target/` and `dist/` are generated files and should not be committed.

------------------------------------------------------------------------

# Git Hygiene

Do not commit:

``` text
.env
.env.*
node_modules/
dist/
target/
data/
*.mv.db
*.trace.db
```

Never commit:

-   Database passwords
-   API keys
-   JWT secrets
-   Cloud credentials
-   Local database files
-   Build artifacts
-   Node dependencies

------------------------------------------------------------------------

# Database Migration

The project originally used a local H2 file database during development.

The current implementation uses:

``` text
Neon PostgreSQL
```

This removes the need for a local PostgreSQL installation while
retaining a production-style relational database.

Old H2 database files are no longer required.

------------------------------------------------------------------------

# Future Enhancements

Potential future iterations include:

-   Kafka-based asynchronous claim processing
-   AI-powered claim summarization
-   Azure OpenAI integration
-   Redis caching
-   Advanced fraud detection
-   Document/image claim analysis
-   Notification services
-   Claim audit history
-   Automated CI/CD
-   Cloud deployment
-   Observability and centralized logging
-   Unit and integration test coverage

These are future extension areas and should only be presented as
implemented features after the corresponding code is added.

------------------------------------------------------------------------

## Project Goals

This project demonstrates practical full-stack engineering across:

-   REST API design
-   Spring Boot architecture
-   JWT authentication
-   Role-based access control
-   JPA/Hibernate
-   PostgreSQL
-   React + TypeScript
-   API integration
-   Claims workflow modeling
-   Risk and fraud assessment
-   Cloud database integration
-   Docker-ready development
-   Git/GitHub project organization

------------------------------------------------------------------------

## License

This project is intended for educational, portfolio and demonstration
purposes.
