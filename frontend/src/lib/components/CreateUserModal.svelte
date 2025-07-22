<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let open = false;

	let username = '';
	let email = '';
	let firstname = '';
	let lastname = '';
	let password = '';

	function close() {
		dispatch('close');
		clearForm();
	}

	function clearForm() {
		username = '';
		email = '';
		firstname = '';
		lastname = '';
		password;
	}

	async function handleSubmit() {
		try {
			const res = await fetch('http://localhost:8000/api/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, firstname, lastname, password }),
				credentials: 'include'
			});
			if (!res.ok) throw new Error('Failed to create user');

			dispatch('created');
			close(); // Also clears the form
		} catch (err) {
			console.error('Create user failed:', err);
		}
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
			<h2 class="text-xl font-bold mb-4">Create New User</h2>

			<div class="space-y-3">
				<input
					bind:value={username}
					placeholder="Username"
					class="w-full border px-3 py-2 rounded"
				/>
				<input
					bind:value={email}
					type="email"
					placeholder="Email"
					class="w-full border px-3 py-2 rounded"
				/>
				<input
					bind:value={firstname}
					placeholder="First Name"
					class="w-full border px-3 py-2 rounded"
				/>
				<input
					bind:value={lastname}
					placeholder="Last Name"
					class="w-full border px-3 py-2 rounded"
				/>
				<input
					bind:value={password}
					type="password"
					placeholder="Password"
					class="w-full border px-3 py-2 rounded"
				/>
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button on:click={close} class="px-4 py-2 rounded border border-gray-300">Cancel</button>
				<button
					on:click={handleSubmit}
					class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
				>
					Create
				</button>
			</div>
		</div>
	</div>
{/if}
