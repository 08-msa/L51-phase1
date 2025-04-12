const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simulated "logged in" student ID (replace with real session/auth later)
let loggedInStudentId = 's1';

// ======= LOGIN =========
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Received login request:', username, password);

    fs.readFile(path.join(__dirname, 'public/data/users.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return res.status(500).send({ success: false, message: 'Server error' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log('Login successful!');
            loggedInStudentId = user.id; // Save logged-in student ID
            res.send({ success: true });
        } else {
            console.log('Login failed: Invalid credentials');
            res.status(401).send({ success: false, message: 'Invalid credentials' });
        }
    });
});

// ======= MAIN PAGE =========
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/main.html'));
});

// ======= LOAD COURSES =========
app.get('/courses', (req, res) => {
    const file = path.join(__dirname, 'public/data/courses.json');
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) return res.status(500).send({ success: false, message: 'Server error reading courses' });

        let courses = JSON.parse(data);
        const { name, category } = req.query;

        if (name) {
            courses = courses.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
        }
        if (category) {
            courses = courses.filter(c => c.category.toLowerCase().includes(category.toLowerCase()));
        }

        res.send({ success: true, courses });
    });
});

// ======= REGISTER FOR COURSE =========
app.post('/register', (req, res) => {
    const studentId = loggedInStudentId;
    const { courseId, instructorId } = req.body;

    const studentFile = path.join(__dirname, 'public/data/students.json');
    const coursesFile = path.join(__dirname, 'public/data/courses.json');
    const instructorsFile = path.join(__dirname, 'public/data/instructors.json');

    try {
        const student = JSON.parse(fs.readFileSync(studentFile)).find(s => s.id === studentId);
        const courses = JSON.parse(fs.readFileSync(coursesFile));
        const instructors = JSON.parse(fs.readFileSync(instructorsFile));

        const course = courses.find(c => c.id === courseId);
        const instructor = instructors.find(i => i.id === instructorId);

        if (!student || !course || !instructor) {
            return res.status(400).send({ success: false, message: 'Invalid student, course, or instructor' });
        }

        if (!course.isOpen) {
            return res.status(400).send({ success: false, message: 'Course not open for registration' });
        }

        const missingPrereqs = (course.prerequisites || []).filter(pr =>
            !student.completedCourses.includes(pr)
        );
        if (missingPrereqs.length > 0) {
            return res.status(400).send({ success: false, message: 'Missing prerequisites' });
        }

        if (instructor.currentStudents >= instructor.maxCapacity) {
            return res.status(400).send({ success: false, message: 'Instructor class is full' });
        }

        // Save registration as pending
        course.pendingRegistrations = course.pendingRegistrations || [];
        course.pendingRegistrations.push({ studentId, instructorId });

        instructor.currentStudents++;

        // Save changes back to files
        fs.writeFileSync(coursesFile, JSON.stringify(courses, null, 2));
        fs.writeFileSync(instructorsFile, JSON.stringify(instructors, null, 2));

        return res.send({ success: true, message: 'Registered! Awaiting admin approval.' });

    } catch (err) {
        console.error('Error during registration:', err);
        return res.status(500).send({ success: false, message: 'Server error' });
    }
});

// ======= LEARNING PATH =========
app.get('/learning-path', (req, res) => {
    const studentId = loggedInStudentId;

    const studentFile = path.join(__dirname, 'public/data/students.json');
    const coursesFile = path.join(__dirname, 'public/data/courses.json');

    try {
        const student = JSON.parse(fs.readFileSync(studentFile)).find(s => s.id === studentId);
        const courses = JSON.parse(fs.readFileSync(coursesFile));

        if (!student) {
            return res.status(404).send({ success: false, message: 'Student not found' });
        }

        const completed = student.completedCourses.map(id => {
            const course = courses.find(c => c.id === id);
            return course ? { ...course, grade: Math.floor(70 + Math.random() * 30) } : null;
        }).filter(Boolean);

        const inProgress = (student.inProgressCourses || []).map(id =>
            courses.find(c => c.id === id)
        ).filter(Boolean);

        const pending = courses.filter(course =>
            (course.pendingRegistrations || []).some(r => r.studentId === studentId)
        );

        res.send({ success: true, completed, inProgress, pending });

    } catch (err) {
        console.error('Error reading learning path:', err);
        return res.status(500).send({ success: false, message: 'Server error' });
    }
});

// ======= START SERVER =========
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
app.get('/session', (req, res) => {
  // This should come from actual session logic
  const session = {
    loggedIn: true,
    student: {
      id: 'stu1',
      name: 'Ali',
      completed: ['CS101']
    }
  };
  res.json(session);
});
function displayCourses(courses) {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = '';

  if (!courses.length) {
      container.innerHTML = '<p>No courses found.</p>';
      return;
  }

  courses.forEach(course => {
      const div = document.createElement('div');
      div.className = 'course-card';

      let classDetailsHTML = '<p><em>No class info available</em></p>';
      if (course.classDetails) {
          classDetailsHTML = `
              <p><strong>Schedule:</strong> ${course.classDetails.schedule.day}, ${course.classDetails.schedule.time}</p>
              <p><strong>Capacity:</strong> ${course.classDetails.capacity}</p>
              <p><strong>Enrolled Students:</strong> ${course.classDetails.enrolledCount}</p>
              <p><strong>Pending Students:</strong> ${course.classDetails.pendingCount}</p>
              <p><strong>Validated:</strong> ${course.classDetails.validated ? 'Yes' : 'No'}</p>
          `;
      }

      div.innerHTML = `
          <h3>${course.name}</h3>
          <p><strong>Category:</strong> ${course.category}</p>
          <p>${course.description}</p>
          <p><strong>Instructor:</strong> ${course.instructor}</p>
          ${classDetailsHTML}
          <button class="apply-btn" data-course="${course.code}">Apply</button>
      `;

      container.appendChild(div);
  });

  // Add event listeners to the Apply buttons
  document.querySelectorAll('.apply-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
          const courseCode = e.target.dataset.course;

          try {
              const res = await fetch('/apply-course', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ courseCode })
              });

              const result = await res.json();
              alert(result.message);
          } catch (err) {
              alert('Error applying to course.');
              console.error(err);
          }
      });
  });
}
