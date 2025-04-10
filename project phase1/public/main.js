// Function to display courses in the courses container
function displayCourses(courses) {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = ''; // Clear any previous content

  if (!Array.isArray(courses) || courses.length === 0) {
    container.innerHTML = '<p class="no-courses">No courses found.</p>';
    return;
  }

  courses.forEach(course => {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
    courseCard.innerHTML = `
      <h3>${course.name}</h3>
      <p><strong>Category:</strong> ${course.category}</p>
      <p>${course.description}</p>
    `;
    container.appendChild(courseCard);
  });
}

// Function to fetch courses from the server
function fetchCourses(queryParams = '') {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = '<p>Loading courses...</p>';

  fetch('/courses' + queryParams)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.success && Array.isArray(data.courses)) {
        displayCourses(data.courses);
      } else {
        container.innerHTML = '<p class="no-courses">No courses found.</p>';
      }
    })
    .catch(error => {
      console.error('Error fetching courses:', error);
      container.innerHTML = '<p class="error">An error occurred while fetching courses. Please try again later.</p>';
    });
}

// Handle search form submission
document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('searchName').value.trim();
  const category = document.getElementById('searchCategory').value.trim();
  const queryParams = [];

  if (name) {
    queryParams.push('name=' + encodeURIComponent(name));
  }
  if (category) {
    queryParams.push('category=' + encodeURIComponent(category));
  }

  const queryString = queryParams.length ? '?' + queryParams.join('&') : '';
  fetchCourses(queryString);
});

// Initial fetch of all courses on page load
document.addEventListener('DOMContentLoaded', fetchCourses);
