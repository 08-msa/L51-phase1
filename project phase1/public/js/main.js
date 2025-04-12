function displayCourses(courses) {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = ''; 

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

function fetchCourses() {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = '<p>Loading courses...</p>';

  fetch('./data/courses.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(courses => {
      displayCourses(courses);
    })
    .catch(error => {
      console.error('Error fetching courses:', error);
      container.innerHTML = '<p class="error">An error occurred while fetching courses. Please try again later.</p>';
    });
}

// filter courses based on search criteria
function filterCourses(name, category) {
  const container = document.getElementById('coursesContainer');
  container.innerHTML = '<p>Filtering courses...</p>';
  fetch('./data/courses.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(courses => {
      const filteredCourses = courses.filter(course => {
        const matchName = name ? course.name.toLowerCase().includes(name.toLowerCase()) : true;
        const matchCategory = category ? course.category.toLowerCase().includes(category.toLowerCase()) : true;
        return matchName && matchCategory;
      });
      displayCourses(filteredCourses);
    })
    .catch(error => {
      console.error('Error filtering courses:', error);
      container.innerHTML = '<p class="error">An error occurred while filtering courses. Please try again later.</p>';
    });
}

document.getElementById('searchForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('searchName').value.trim();
  const category = document.getElementById('searchCategory').value.trim();

  filterCourses(name, category);
});

document.addEventListener('DOMContentLoaded', fetchCourses);
