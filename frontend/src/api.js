const API =
    import.meta.env.VITE_API_URL ||
    'http://localhost:4000/api';

// Send API requests to the backend
export async function request(path, { token, ...options } = {}) {
    const res = await fetch(API + path, {
        ...options,

        headers: {
            'Content-Type': 'application/json',

            ...(token
                ? { Authorization: 'Bearer ' + token }
                : {}),

            ...(options.headers || {}),
        },
    });

    // Parse the response as JSON
    const data = await res.json().catch(() => ({}));

    // Handle unsuccessful responses
    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

