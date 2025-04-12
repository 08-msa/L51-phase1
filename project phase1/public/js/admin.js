document.addEventListener('DOMContentLoaded', () => {
    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));
            
            // Add active class to clicked button and show corresponding content
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.remove('hidden');
        });
    });

    // Load courses
    loadCourses();

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        window.location.href = 'public/login.html';
    });

    // Create course form
    document.getElementById('create-course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const course = {
            name: document.getElementById('course-name').value,
            code: document.getElementById('course-code').value,
            category: document.getElementById('course-category').value,
            prerequisites: document.getElementById('course-prerequisites').value
                .split(',')
                .map(prereq => prereq.trim())
                .filter(prereq => prereq !== ''),
            status: 'pending',
            students: []
        };

        try {
            const response = await fetch('/api/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(course)
            });

            if (response.ok) {
                alert('Course created successfully!');
                document.getElementById('create-course-form').reset();
                loadCourses();
            } else {
                throw new Error('Failed to create course');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to create course');
        }
    });
});

async function loadCourses() {
    try {
        const response = await fetch('/api/courses');
        const courses = await response.json();

        const pendingCourses = courses.filter(c => c.status === 'pending');
        const activeCourses = courses.filter(c => c.status === 'active');

        renderCourseList('pending-courses', pendingCourses, true);
        renderCourseList('active-courses', activeCourses, false);
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

function renderCourseList(containerId, courses, showActions) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (courses.length === 0) {
        container.innerHTML = '<p>No courses found</p>';
        return;
    }

    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        courseCard.innerHTML = `
            <h4>${course.name} (${course.code})</h4>
            <p>Category: ${course.category}</p>
            <p>Status: ${course.status}</p>
            <p>Prerequisites: ${course.prerequisites.join(', ') || 'None'}</p>
            <p>Students enrolled: ${course.students.length}</p>
        `;

        if (showActions) {
            const approveBtn = document.createElement('button');
            approveBtn.textContent = 'Approve';
            approveBtn.addEventListener('click', () => updateCourseStatus(course.code, 'active'));
            
            const rejectBtn = document.createElement('button');
            rejectBtn.textContent = 'Reject';
            rejectBtn.addEventListener('click', () => updateCourseStatus(course.code, 'rejected'));
            
            courseCard.appendChild(approveBtn);
            courseCard.appendChild(rejectBtn);
        }

        container.appendChild(courseCard);
    });
}

async function updateCourseStatus(courseCode, status) {
    try {
        const response = await fetch(`/api/courses/${courseCode}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadCourses();
        } else {
            throw new Error('Failed to update course status');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update course status');
    }
}