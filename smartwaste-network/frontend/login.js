/* login.js - shared helper */
async function doLogin(endpoint, email, password) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw data;
  // Save token + user info
  localStorage.setItem('token', data.token);
  localStorage.setItem('role', data.user.role);
  localStorage.setItem('userEmail', data.user.email);
  localStorage.setItem('userName', data.user.name || '');
  return data;
}

/* optional: if you use a form with id=loginForm, auto-handle submit */
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const email = this.email.value;
    const password = this.password.value;
    try {
      const data = await doLogin('/api/auth/login', email, password);
      if (data.user.role === 'admin') window.location.href = 'admin-dashboard.html';
      else window.location.href = 'user-dashboard.html';
    } catch (err) {
      const msg = (err && (err.error || err.msg)) || 'Login failed';
      alert('Login failed: ' + msg);
    }
  });
});
