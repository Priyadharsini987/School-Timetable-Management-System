# School Timetable Management System — Integration Notes

This package contains your existing `backend/` (Spring Boot) and `frontend/`
(React) projects, now wired together with Axios. The UI, routes, and page
layout are unchanged — only the data source changed, from hard-coded arrays
to real HTTP calls against the Spring Boot API.

## What was already there (no need to rebuild)

Your backend already had complete entities, repositories, services, and
REST controllers for Students, Teachers, Parents, Classes, Subjects, Rooms,
Periods, and Timetable entries, plus JWT-based login and CORS configured
for `localhost:3000`/`5173`. No duplicate backend files were created.

## Backend changes (3 files, annotation-only)

These were required for the API to actually work — without them, the app
would crash or leak data the moment the frontend called it:

1. **`entity/SchoolClass.java`** — added `@JsonIgnore` to the `students`
   collection. `SchoolClass.students` and `Student.schoolClass` reference
   each other, so serializing a class (or any student) to JSON would
   recurse forever and crash the request with a `StackOverflowError`.
2. **`entity/Parent.java`** — same fix, on the `children` collection
   (`Parent.children` ↔ `Student.parent`).
3. **`entity/User.java`** — added `@JsonIgnore` to `password`. Student,
   Teacher, and Parent each embed a linked `User`, and without this
   annotation every API response would include the BCrypt password hash.

No entities, repositories, services, controllers, or DB config were changed
otherwise.

## Frontend changes

- **`src/api/axios.js`** (new) — single Axios instance, base URL
  `http://localhost:8080/api`, attaches the JWT token to every request,
  logs the user out automatically on a 401, and has a small helper to pull
  a readable message out of backend error responses.
- **`src/context/AuthContext.jsx`** — now calls `POST /api/auth/login` for
  real instead of faking a role from the email string. Stores the JWT
  token and user profile in `localStorage`.
- **`src/pages/Login.jsx`** — submit is now async and shows the backend's
  actual error message (e.g. wrong password) instead of accepting anything.
- **`src/components/TimetableGrid.jsx`** — adapted to the backend's nested
  entry shape (`entry.subject.name`, `entry.teacher.name`,
  `entry.room.roomNumber`, `entry.period.periodNumber`, `entry.day`).
- **Admin pages** (`Students`, `Teachers`, `Parents`, `Classes`, `Subjects`,
  `Rooms`, `Periods`) — each now fetches its list on mount, and Add/Edit/
  Delete call the matching `POST` / `PUT` / `DELETE` endpoint. Edit buttons
  were added (the original UI only had Add). Loading and error states are
  shown; failures don't lose your place. Dropdowns/checkboxes are added
  where a foreign key exists (e.g. a student's class and parent).
- **`Timetable.jsx`** — lets you pick a class and shows its **published**
  timetable via `GET /api/timetable/class/{id}`.
- **`GenerateTimetable.jsx`** — picks a class, working days, and periods
  per day, calls `POST /api/timetable/generate`, shows the generated draft
  plus any unscheduled subjects/conflicts, and can publish it via
  `POST /api/timetable/publish/{classId}`.
- **`Conflicts.jsx`** — fetches real conflicts from
  `GET /api/timetable/conflicts`, with a toggle between the draft and
  published timetable.
- **`Reports.jsx`** — the four CSV exports are now built from real data
  pulled from `/api/reports/...` and `/api/rooms` instead of hard-coded
  rows.
- **Teacher/Student/Parent "My Timetable" pages** — use the existing
  `GET /api/timetable/my/teacher|student|parent` endpoints (these rely on
  the JWT identifying who's logged in).
- **Dashboards** — Admin's dashboard now shows live counts; the other
  three dashboards show a real class/period summary pulled from the
  timetable endpoints instead of a hard-coded number.

### Frontend field-name mapping

A few frontend field names didn't match the backend and were adjusted on
the frontend side (no entity changes):

| Page     | Frontend field (old) | Backend field (used now)         |
|----------|-----------------------|-----------------------------------|
| Teachers | `maxPeriods`          | `phone`, `department`, `subjectIds` |
| Rooms    | `name`                | `roomNumber`                      |
| Subjects | `description`         | `periodsPerWeek`                  |
| Periods  | `name`                | `periodNumber` (+ `startTime`/`endTime`) |

## How to run

1. **Database**: create the MySQL database once —
   `CREATE DATABASE school_timetable_db;` (or let
   `createDatabaseIfNotExist=true` in `application.properties` handle it).
   Check the credentials in `backend/src/main/resources/application.properties`
   match your local MySQL setup.
2. **Backend**:
   ```
   cd backend
   mvn spring-boot:run
   ```
   On first run it prints a default admin login:
   `admin@school.com` / `Admin@123`.

   **API Documentation (Swagger UI)**:
   Once the backend is running, browse interactive OpenAPI documentation at:
   - Swagger UI: `http://localhost:8080/swagger-ui/index.html` (or `http://localhost:8080/swagger-ui.html`)
   - OpenAPI JSON: `http://localhost:8080/v3/api-docs`
   - Use the **Authorize** button in Swagger UI to test secured endpoints with your JWT token.
3. **Frontend**:
   ```
   cd frontend
   npm install
   npm start
   ```
   Opens on `http://localhost:3000` (CORS on the backend already allows
   this origin).
4. Log in as `admin@school.com` / `Admin@123`, then create teachers,
   students, parents, classes, subjects, rooms, and periods (teachers,
   students, and parents get their own login accounts automatically —
   check the console output or set a password when creating them).
5. Add subjects to a class and teachers to those subjects, then use
   **Generate Timetable** → **Publish** to produce a real, viewable
   timetable for that class.

## A note on verification

I reviewed every changed file carefully and ran a full production build of
the frontend (`react-scripts build`) — it compiles cleanly with no errors.
I was not able to compile or run the Spring Boot backend in this sandbox
(no Maven/local repo, and Maven Central isn't reachable from here), so
please run `mvn spring-boot:run` yourself and check the console for any
issues — the three backend edits are small, annotation-only changes I'm
confident are correct, but a real build/run is the final check.
