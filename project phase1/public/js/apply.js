document.addEventListener('DOMContentLoaded', async () => {
    const courseCode = new URLSearchParams(window.location.search).get('courseCode');
    const courseContainer = document.getElementById('courseDetails');
    const instructorContainer = document.getElementById('instructorsList');
    const messageBox = document.getElementById('message');
  
    if (!courseCode) {
      messageBox.innerText = '❌ No course selected.';
      return;
    }
  
    const sessionRes = await fetch('/session');
    const session = await sessionRes.json();
    if (!session.loggedIn) {
      messageBox.innerText = '❌ You must be logged in to register for courses.';
      return;
    }
  
    const student = session.student;
  
    const coursesRes = await fetch('/courses');
    const coursesData = await coursesRes.json();
    const course = coursesData.courses.find(c => c.code === courseCode);
  
    if (!course) {
      messageBox.innerText = '❌ Course not found.';
      return;
    }
  
    // Show course info
    courseContainer.innerHTML = `
      <h2>${course.name}</h2>
      <p><strong>Category:</strong> ${course.category}</p>
      <p>${course.description}</p>
      <p><strong>Status:</strong> ${course.status}</p>
      <p><strong>Prerequisites:</strong> ${course.prerequisites.join(', ') || 'None'}</p>
    `;
  
    // Fetch student data
    const studentRes = await fetch(`/students/${student.id}`);
    const studentData = await studentRes.json();
  
    // Check prerequisites
    const missing = course.prerequisites.filter(p => !studentData.completed.includes(p));
    if (missing.length > 0) {
      messageBox.innerHTML = `❌ You are missing prerequisites: <strong>${missing.join(', ')}</strong>`;
      return;
    }
  
    if (course.status !== 'active') {
      messageBox.innerText = '❌ This course is not currently open for registration.';
      return;
    }
  
    // Load instructors
    const instRes = await fetch('/data/instructors.json');
    const instructors = await instRes.json();
    const courseInstructors = instructors.filter(i => i.id === course.instructorId);
  
    if (courseInstructors.length === 0) {
      instructorContainer.innerHTML = '<p>No instructors available for this course.</p>';
      return;
    }
  
    instructorContainer.innerHTML = '<h3>Available Instructor(s)</h3>';
  
    courseInstructors.forEach(inst => {
      const availableSpots = inst.maxCapacity - inst.currentStudents;
      const card = document.createElement('div');
      card.className = 'instructor-card';
      card.innerHTML = `
        <p><strong>${inst.name}</strong></p>
        <p>Current Students: ${inst.currentStudents} / ${inst.maxCapacity}</p>
        <button ${availableSpots <= 0 ? 'disabled' : ''} data-id="${inst.id}">
          ${availableSpots > 0 ? 'Apply' : 'Full'}
        </button>
      `;
      instructorContainer.appendChild(card);
    });
  
    // Handle apply click
    instructorContainer.addEventListener('click', async (e) => {
      if (e.target.tagName === 'BUTTON' && e.target.dataset.id) {
        const instructorId = e.target.dataset.id;
  
        const res = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseCode, instructorId })
        });
  
        const result = await res.json();
        messageBox.innerText = result.message;
        messageBox.style.color = result.success ? 'green' : 'red';
  
        if (result.success) e.target.disabled = true;
      }
    });
  });
  