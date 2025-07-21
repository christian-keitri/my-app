<script lang="ts">
	import { goto } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let isRegistering = false;

	async function handleLogin() {
		error = '';
		try {
			const res = await fetch('http://localhost:8000/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password }),
				credentials: 'include'
			});

			const data = await res.json();
			if (!res.ok) {
				error = data.message || 'Login failed';
				return;
			}

			goto('/dashboard');
		} catch (err) {
			error = 'Network error during login';
			console.error(err);
		}
	}

	async function handleRegister() {
		error = '';
		try {
			const res = await fetch('http://localhost:8000/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			const data = await res.json();
			if (!res.ok) {
				error = data.message || 'Registration failed';
				return;
			}

			isRegistering = false; // go back to login screen
		} catch (err) {
			error = 'Network error during registration';
			console.error(err);
		}
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
	<div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md">
		<h2 class="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
			{isRegistering ? 'Create Account' : 'Login to Your Account'}
		</h2>

		<form on:submit|preventDefault={isRegistering ? handleRegister : handleLogin} class="space-y-4">
			<input
				type="email"
				name="email"
				placeholder="Email"
				bind:value={email}
				required
				class="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
			/>

			<input
				type="password"
				name="password"
				placeholder="Password"
				bind:value={password}
				required
				class="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
			/>

			<button
				type="submit"
				class="w-full py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
			>
				{isRegistering ? 'Register' : 'Login'}
			</button>

			{#if error}
				<p class="text-sm text-red-500 text-center">{error}</p>
			{/if}
		</form>

		<div class="mt-6 text-center">
			<button
				type="button"
				on:click={() => {
					error = '';
					isRegistering = !isRegistering;
				}}
				class="text-sm text-blue-600 hover:underline transition"
			>
				{isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
			</button>
		</div>
	</div>
</div>
