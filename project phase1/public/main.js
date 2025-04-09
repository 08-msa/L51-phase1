// Function to display courses in the courses container
function displayCourses(courses) {
    const container = document.getElementById('coursesContainer');
    container.innerHTML = ''; // Clear any previous content
  
    if (courses.length === 0) {
      container.innerHTML = '<p>No courses found.</p>';
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
    fetch('/courses' + queryParams)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          displayCourses(data.courses);
        } else {
          console.error('Failed to fetch courses');
        }
      })
      .catch(error => console.error('Error:', error));
  }
  
  // Handle search form submission
  document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('searchName').value.trim();
    const category = document.getElementById('searchCategory').value.trim();
    let queryParams = [];
    
    if (name) {
      queryParams.push('name=' + encodeURIComponent(name));
    }
    if (category) {
      queryParams.push('category=' + encodeURIComponent(category));
    }
    
    let queryString = queryParams.length ? '?' + queryParams.join('&') : '';
    fetchCourses(queryString);
  });
  
  // Fetch all courses by default when the page loads
  fetchCourses();