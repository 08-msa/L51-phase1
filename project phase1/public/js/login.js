document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorMsg = document.getElementById('errorMsg');

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      console.log('Login successful, redirecting...');
      window.location.href = 'main.html'; 
    } else {
      errorMsg.textContent = data.message || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    errorMsg.textContent = 'An error occurred. Try again later.';
  }
});
