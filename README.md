# School Timetable Management System

A full-stack web application designed to simplify school timetable creation, management, and distribution. The system provides role-based access for administrators, teachers, students, and parents, with automated timetable generation and conflict validation.

## Project Overview

The School Timetable Management System helps schools manage academic schedules efficiently. Administrators can manage academic information, generate timetables, validate scheduling conflicts, and publish approved timetables. Teachers, students, and parents can view the published schedules based on their roles.

## Key Features

- **Role-Based Authentication:** Secure login for Admin, Teacher, Student, and Parent.
- **Admin Dashboard:** Manage classes, teachers, students, parents, subjects, rooms, and periods.
- **Timetable Generation:** Automatically generate timetables using a rule-based greedy scheduling approach.
- **Conflict Detection:** Validate teacher, classroom, and room availability to prevent scheduling conflicts.
- **Timetable Publishing:** Save generated timetables as drafts and publish them after validation.
- **Timetable Viewing:** Allow teachers, students, and parents to view published timetables.
- **CSV Export:** Export timetable information in CSV format.
- **Secure Authentication:** JWT-based authentication and BCrypt password hashing.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js 18, HTML, CSS, JavaScript |
| Backend | Java 17, Spring Boot 3.3.4 |
| API Communication | REST APIs, Axios |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Security | Spring Security, JWT, BCrypt |
| Build Tool | Maven |
| Version Control | Git, GitHub |

## System Architecture

```text
React.js Frontend
       |
       | Axios / REST API
       |
Spring Boot Backend
       |
       |----------------------|
       |          |           |
  Controllers  Services  Spring Security
       |
  Spring Data JPA
       |
    MySQL Database
```

## Timetable Generation Workflow

1. Administrator enters and manages school information.
2. The system retrieves classes, subjects, teachers, rooms, and periods.
3. A rule-based greedy algorithm assigns available resources to timetable slots.
4. The system checks for teacher, class, and room scheduling conflicts.
5. The generated timetable is saved as a draft.
6. After successful validation, the administrator can publish the timetable.
7. Teachers, students, and parents can view the published timetable.

## Project Structure

```text
school-timetable-system/
│
├── backend/
│   ├── src/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── pom.xml
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

*Note: Update the folder names above if your actual repository structure differs.*

## Installation and Setup

### Prerequisites

- Java 17 or later
- Node.js and npm
- MySQL
- Maven
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Priyadharsini987/School-Timetable-Management-System.git
cd School-Timetable-Management-System
```

### 2. Configure the Database

Create a MySQL database:

```sql
CREATE DATABASE school_timetable;
```

Configure the database URL, username, and password in the backend environment or application configuration.

### 3. Run the Backend

Navigate to the backend directory:

```bash
cd backend
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

### 4. Run the Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
npm start
```

The frontend and backend should now be running locally. Adjust the commands if your actual project uses a different React setup or directory structure.

## Security

- JWT-based authentication.
- Password hashing using BCrypt.
- Role-based access control.
- Protected backend endpoints.

## Future Enhancements

- Advanced timetable optimization.
- Automated timetable rescheduling.
- Notifications for timetable changes.
- Attendance management integration.
- Improved timetable analytics and reporting.

## Author

**Priyadharsini V**  
B.E. Computer Science and Engineering  
Sri Krishna College of Engineering and Technology (SKCET), Coimbatore

---

*Developed as an academic full-stack web application using React.js, Java Spring Boot, and MySQL.*
