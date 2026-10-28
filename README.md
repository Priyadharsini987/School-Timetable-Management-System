# School Timetable Management System

A full-stack web application for creating, validating, publishing, and viewing school timetables. It provides role-based access for administrators, teachers, students, and parents.

## Features

- Role-based authentication for Admin, Teacher, Student, and Parent
- Admin management of classes, teachers, students, parents, subjects, rooms, and periods
- Rule-based greedy timetable generation
- Conflict validation for class, teacher, and room scheduling
- Draft and publish workflow for validated timetables
- Role-specific timetable views
- Timetable CSV export
- JWT authentication and BCrypt password hashing
- REST API documentation through Springdoc / Swagger UI

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, JavaScript, HTML, CSS |
| Routing / API | React Router, Axios |
| Backend | Java 17, Spring Boot 3.3.4 |
| Persistence | Spring Data JPA, Hibernate, MySQL |
| Security | Spring Security, JWT, BCrypt |
| Build tools | npm, Maven |

## Repository Structure

```text
School-Timetable-Management-System/
├── backend/
│   ├── src/main/java/com/school/timetable/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │     ├── repository/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── routes/
│   ├── package.json
│   └── package-lock.json
├── .gitignore
├── classroom.txt
├── LICENSE
└── README.md
```

## Setup and Run

### Prerequisites

- JDK 17
- Maven
- Node.js and npm
- MySQL

### 1. Clone the repository

```bash
git clone https://github.com/Priyadharsini987/School-Timetable-Management-System.git
cd School-Timetable-Management-System
```

### 2. Configure MySQL and backend settings

Create the database (or allow the configured MySQL URL to create it):

```sql
CREATE DATABASE school_timetable_db;
```

Configure database credentials and the JWT signing secret using environment variables before running the backend. Do not commit real passwords or signing secrets.

### 3. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The backend runs on `http://localhost:8080` by default.

### 4. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

The React development server runs on `http://localhost:3000`. The frontend package configuration proxies API requests to the backend at port 8080.

## API Documentation

When the backend is running, Swagger UI is configured at:

`http://localhost:8080/swagger-ui.html`

## Timetable Generation Flow

1. The administrator maintains classes, subjects, teachers, rooms, and periods.
2. The backend gathers the available scheduling data.
3. The generator assigns resources to timetable slots using a rule-based greedy approach.
4. The system checks for scheduling conflicts.
5. The timetable is saved as a draft.
6. A conflict-free timetable can be published.
7. Teachers, students, and parents can view the published timetable according to their roles.

## Notes

- Install frontend dependencies with `npm install`; dependency folders are not part of the source code.
- Configure secrets locally through environment variables. Never publish database passwords, admin passwords, or JWT signing keys.
- Automated backend test coverage has not been confirmed; build and test the application in your own environment before deployment.

## Author

**Priyadharsini V**  
B.E. Computer Science and Engineering  
Sri Krishna College of Engineering and Technology (SKCET), Coimbatore
