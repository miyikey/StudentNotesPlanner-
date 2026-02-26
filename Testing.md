# API Testing Checklist

## 1. Authentication
- [/] POST /auth/register → 201 Created (new user created)
- [/] POST /auth/login → 200 OK (JWT token returned)
- [/] Save JWT token to environment variable `token`

## 2. Courses (Protected - Requires Bearer Token)
- [/] POST /courses → 201 Created (course created with id)
- [/] GET /courses → 200 OK (returns array including created course)
- [/] GET /courses/:id → 200 OK (returns correct course)
- [/] PUT /courses/:id → 200 OK (course updated)
- [/] DELETE /courses/:id → 200 OK (course deleted)
- [/] GET /courses/:id → 404 Not Found (confirm deletion)
- [/] GET /courses without token → 401 Unauthorized

## 3. Assessments
- [/] POST /assessments → 201 Created
- [/] GET /assessments/:courseId → 200 OK (returns assessments for course)
- [/] PUT /assessments/:id → 200 OK (assessment updated)
- [/] DELETE /assessments/:id → 200 OK (assessment deleted)

## 4. Assignments
- [ ] POST /assignments → 201 Created
- [ ] GET /assignments → 200 OK (returns assignments)
- [ ] PUT /assignments/:id → 200 OK (assignment updated)
- [ ] DELETE /assignments/:id → 200 OK (assignment deleted)

## 5. Grades
- [ ] POST /grades → 201 Created
- [ ] GET /grades → 200 OK (returns grades)
- [ ] PUT /grades/:id → 200 OK (grade updated)
- [ ] DELETE /grades/:id → 200 OK (grade deleted)

## 6. Notes
- [ ] POST /notes → 201 Created
- [ ] GET /notes → 200 OK (returns notes)
- [ ] PUT /notes/:id → 200 OK (note updated)
- [ ] DELETE /notes/:id → 200 OK (note deleted)