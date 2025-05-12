# Course Management System - Conceptual Data Model

## Entities and Relationships

### 1. User
- Base attributes for all user types:
  - id (Primary Key)
  - username (Unique)
  - password (Encrypted)
  - name
  - type (student/instructor/admin)

#### Student (extends User)
- Attributes:
  - completed_courses: [Course References]
- Relationships:
  - Can enroll in many Classes
  - Can complete many Courses
  - Can have pending enrollment requests

#### Instructor (extends User)
- Attributes:
  - expertise: [Categories]
  - interested_courses: [Course References]
- Relationships:
  - Can teach many Courses
  - Can manage multiple Classes

#### Admin (extends User)
- Relationships:
  - Can manage all entities
  - Validates class creation
  - Approves course proposals

### 2. Course
- Attributes:
  - code (Primary Key)
  - name
  - category
  - prerequisites: [Course References]
  - status (active/rejected)
- Relationships:
  - Has many Classes
  - Has one Instructor
  - Has many enrolled Students
  - Can be prerequisite for other Courses

### 3. Class
- Attributes:
  - course_id (Foreign Key)
  - instructor_id (Foreign Key)
  - capacity
  - validated (boolean)
  - schedule:
    - day
    - time
- Relationships:
  - Belongs to one Course
  - Has one Instructor
  - Has many enrolled Students
  - Has many pending Students

## Data Validation Rules

1. User Management:
   - Usernames must be unique
   - Passwords must be securely stored
   - User types must be one of: student, instructor, or admin

2. Course Management:
   - Course codes must be unique
   - Prerequisites must reference existing courses
   - Course status must be either active or rejected
   - Category must be from predefined list

3. Class Management:
   - Cannot exceed capacity
   - Must have valid instructor assignment
   - Must be validated before accepting students
   - Schedule must not conflict with instructor's other classes

## Access Control

1. Students can:
   - View available courses
   - Request enrollment in classes
   - View their completed courses
   - View their current enrollments

2. Instructors can:
   - Propose new courses
   - Manage their assigned classes
   - View student enrollments
   - Update course materials

3. Admins can:
   - Manage all users
   - Validate classes
   - Approve/reject courses
   - Monitor system activity

## Data Relationships

```
User (Abstract)
├── Student
│   ├── enrolled_in → Classes (Many-to-Many)
│   └── completed → Courses (Many-to-Many)
├── Instructor
│   ├── teaches → Courses (One-to-Many)
│   └── manages → Classes (One-to-Many)
└── Admin
    └── manages → All Entities

Course
├── has → Classes (One-to-Many)
├── taught_by → Instructor (Many-to-One)
├── enrolled_students → Students (Many-to-Many)
└── prerequisites → Courses (Many-to-Many)

Class
├── belongs_to → Course (Many-to-One)
├── taught_by → Instructor (Many-to-One)
├── enrolled_students → Students (Many-to-Many)
└── pending_students → Students (Many-to-Many)
