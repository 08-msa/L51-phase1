document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await res.json();
                if (res.ok && data.success) {
                    window.location.href = '/main';
                } else {
                    document.getElementById('errorMsg').textContent = data.message;
                }
            } catch (err) {
                document.getElementById('errorMsg').textContent = 'Login failed';
            }
        });
    }

    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('searchName').value;
            const category = document.getElementById('searchCategory').value;

            const query = [];
            if (name) query.push(`name=${encodeURIComponent(name)}`);
            if (category) query.push(`category=${encodeURIComponent(category)}`);

            fetchCourses(query.length ? `?${query.join('&')}` : '');
        });
    }

    function fetchCourses(query = '') {
        fetch('/courses' + query)
            .then(res => res.json())
            .then(data => {
                displayCourses(data.courses);
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }

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
            div.innerHTML = `
                <h3>${course.name}</h3>
                <p><strong>Category:</strong> ${course.category}</p>
                <p>${course.description}</p>
            `;
            container.appendChild(div);
        });
    }

    // Initial fetch
    if (document.getElementById('coursesContainer')) {
        fetchCourses();
    }
});
