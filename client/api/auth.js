// src/api/auth.js

export async function loginSeller(email, password) {
    const response = await fetch('http://localhost:5050/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      // credentials: 'include'  // Enable if backend uses httpOnly cookies
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    return data;  // { success, seller, token }
  }

  export async function signupSeller(payload) {
    const response = await fetch('http://localhost:5050/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    return data;  // { success, seller }
  }
