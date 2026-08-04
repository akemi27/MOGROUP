const BASE_URL = import.meta.env.PROD
    ? 'https://mogroup-api.vercel.app/api'
    : 'http://localhost:3000/api';

function authHeaders() {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) }
    });

    if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return null;
    }

    return res;
}
