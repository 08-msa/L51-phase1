document.addEventListener('DOMContentLoaded', () => {
    // Load instructor's courses
    loadInstructorCourses();

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        window.location.href = '/login.html';
    });
});

async function loadInstructorCourses() {
    try {
        // Get current instructor ID (in a real app, this would come from session)
        const instructorId = 'instructor1'; // Hardcoded for demo
        
        const response = await fetch(`/api/instructors/${instructorId}/courses`);
        const courses = await response.json();

        renderInstructorCourses(courses);
    } catch (error) {
        console.error('Error loading instructor courses:', error);
    }
}

function renderInstructorCourses(courses) {
    const container = document.getElementById('instructor-courses');
    container.innerHTML = '';

    if (courses.length === 0) {
        container.innerHTML = '<p>You are not teaching any courses currently.</p>';
        return;
    }

    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        
        courseCard.innerHTML = `
            <h4>${course.name} (${course.code})</h4>
            <p>Status: ${course.status}</p>
            <p>Students enrolled: ${course.students.length}</p>
        `;

        const gradeBtn = document.createElement('button');
        gradeBtn.textContent = 'Submit Grades';
        gradeBtn.addEventListener('click', () => showGradeForm(course));
        
        courseCard.appendChild(gradeBtn);
        container.appendChild(courseCard);
    });
}

function showGradeForm(course) {
    const gradeSection = document.getElementById('grade-submission');
    const formContainer = document.getElementById('grade-form-container');
    
    // Show the grade submission section
    gradeSection.classList.remove('hidden');
    
    // Create grade submission form
    formContainer.innerHTML = `
        <h3>${course.name} - Grade Submission</h3>
        <form id="grade-submission-form">
            <table>
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Student Name</th>
                        <th>Grade</th>
                    </tr>
                </thead>
                <tbody id="grade-entries">
                    ${course.students.map(student => `
                        <tr>
                            <td>${student.id}</td>
                            <td>${student.name}</td>
                            <td>
                                <select class="grade-select" data-student-id="${student.id}">
                                    <option value="">Select Grade</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                    <option value="F">F</option>
                                </select>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <button type="submit">Submit Grades</button>
            <button type="button" id="cancel-grade-btn">Cancel</button>
        </form>
    `;

    // Form submission
    document.getElementById('grade-submission-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const gradeEntries = Array.from(document.querySelectorAll('.grade-select'))
            .map(select => ({
                studentId: select.getAttribute('data-student-id'),
                grade: select.value
            }))
            .filter(entry => entry.grade !== '');

        if (gradeEntries.length !== course.students.length) {
            alert('Please assign grades to all students');
            return;
        }

        try {
            const response = await fetch(`/api/courses/${course.code}/grades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instructorId: 'instructor1', // Hardcoded for demo
                    grades: gradeEntries
                })
            });

            if (response.ok) {
                alert('Grades submitted successfully!');
                gradeSection.classList.add('hidden');
                loadInstructorCourses();
            } else {
                throw new Error('Failed to submit grades');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit grades');
        }
    });

    // Cancel button
    document.getElementById('cancel-grade-btn').addEventListener('click', () => {
        gradeSection.classList.add('hidden');
    });
}