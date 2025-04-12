const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('courseId'); // Pass course ID in URL

const courseInfoDiv = document.getElementById("course-info");
const instructorsListDiv = document.getElementById("instructors-list");
const statusMessage = document.getElementById("status-message");

async function fetchData(endpoint) {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  return res.json();
}

async function applyToCourse(instructorId) {
  try {
    const res = await fetch('/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, instructorId })
    });
    const result = await res.json();
    statusMessage.textContent = result.message;
  } catch (err) {
    statusMessage.textContent = "Error during application.";
  }
}

async function init() {
  try {
    // Simulated session (replace this with your real session check)
    const user = {
      id: "stu1",
      role: "student", // or "admin"
      loggedIn: true
    };

    if (!user.loggedIn) {
      window.location.href = "/login.html";
      return;
    }

    if (user.role === "admin") {
      window.location.href = "/admin.html";
      return;
    }

    if (user.role !== "student") {
      statusMessage.textContent = "Access denied.";
      return;
    }

    if (!courseId) {
      statusMessage.textContent = "No course selected.";
      return;
    }

    // Simulated student data (replace with real API call if needed)
    const studentData = {
      id: "stu1",
      completedCourses: [
        { id: "CS101", grade: 85 },
        { id: "CS102", grade: 78 }
      ],
      inProgressCourses: ["CS201"],
      pendingCourses: ["CS202"]
    };

    const [courses, classes] = await Promise.all([
      fetchData('data/courses.json'),
      fetchData('data/classes.json')
    ]);

    const course = courses.find(c => c.id === courseId);
    if (!course) {
      statusMessage.textContent = "Course not found.";
      return;
    }

    const courseClasses = classes.filter(c => c.courseId === courseId);

    courseInfoDiv.innerHTML = `
      <h2>${course.name}</h2>
      <p>${course.description}</p>
      <p>Prerequisites: ${course.prerequisites.join(", ") || "None"}</p>
    `;

    // Check prerequisites
    const passedCourses = studentData.completedCourses;
    const hasAllPrereqs = course.prerequisites.every(prereq =>
      passedCourses.some(c => c.id === prereq && c.grade >= 50)
    );

    if (!hasAllPrereqs) {
      statusMessage.textContent = "You have not completed all prerequisites.";
      return;
    }

    // Check if already completed
    const alreadyCompleted = passedCourses.some(c => c.id === courseId && c.grade >= 50);
    if (alreadyCompleted) {
      statusMessage.textContent = "You have already completed this course.";
      return;
    }

    // Check if already in progress or pending
    const alreadyApplied = (studentData.inProgressCourses || []).includes(courseId) ||
                           (studentData.pendingCourses || []).includes(courseId);
    if (alreadyApplied) {
      statusMessage.textContent = "You have already applied for this course.";
      return;
    }

    if (!course.openForRegistration) {
      statusMessage.textContent = "Registration for this course is currently closed.";
      return;
    }

    const availableClasses = courseClasses.filter(c => c.availableSeats > 0);
    if (availableClasses.length === 0) {
      statusMessage.textContent = "No available instructors at the moment.";
      return;
    }

    instructorsListDiv.innerHTML = "<h3>Select Instructor</h3>";
    availableClasses.forEach(c => {
      const btn = document.createElement("button");
      btn.textContent = `${c.instructor} - ${c.availableSeats} seats`;
      btn.onclick = () => {
        alert("Applied successfully! Pending admin approval.");
        c.availableSeats--;
        btn.disabled = true;
        statusMessage.textContent = `You applied to ${c.instructor}'s class.`;
      };
      instructorsListDiv.appendChild(btn);
    });

  } catch (err) {
    console.error(err);
    statusMessage.textContent = "An error occurred while loading course info.";
  }
}
init();

