import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, fetch }) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        if (typeof email !== 'string' || typeof password !== 'string') {
            return { error: 'Invalid input' };
        }

        const res = await fetch('http://localhost:8000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });

        if (!res.ok) {
            const data = await res.json();
            return { error: data.message || 'Login failed' };
        }

        return { success: true };
    }
};
