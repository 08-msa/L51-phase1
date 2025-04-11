document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Redirect to main page on successful login
        window.location.href = '/main';
      } else {
        document.getElementById('errorMsg').textContent = data.message;
      }
    })
    .catch(err => {
      document.getElementById('errorMsg').textContent = err.message;
    });
  });