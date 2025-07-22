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
		password = '';
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
			alert('Failed to create user');
		}
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
			<h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Create New User</h2>

			<!-- Inputs -->
			<input class="w-full p-2 border rounded" bind:value={username} placeholder="Username" />
			<input
				class="w-full p-2 border rounded"
				type="email"
				bind:value={email}
				placeholder="Email"
			/>
			<input class="w-full p-2 border rounded" bind:value={firstname} placeholder="First Name" />
			<input class="w-full p-2 border rounded" bind:value={lastname} placeholder="Last Name" />
			<input
				class="w-full p-2 border rounded"
				type="password"
				bind:value={password}
				placeholder="Password"
			/>

			<!-- Buttons -->
			<div class="flex justify-end space-x-2 pt-2">
				<button
					class="px-4 py-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
					on:click={close}
				>
					Cancel
				</button>
				<button
					class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
					on:click={handleSubmit}
				>
					Create
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	input {
		background-color: white;
		color: black;
	}
	:global(.dark) input {
		background-color: #1f2937;
		color: white;
	}
</style>
