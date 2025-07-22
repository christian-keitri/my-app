<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;
	export let user: {
		id: number;
		username: string;
		email: string;
		firstname: string;
		lastname: string;
	} | null = null;

	const dispatch = createEventDispatcher();

	let username = '';
	let email = '';
	let firstname = '';
	let lastname = '';

	// When modal opens with a user, populate fields
	$: if (user && open) {
		username = user.username;
		email = user.email;
		firstname = user.firstname;
		lastname = user.lastname;
	}

	function close() {
		dispatch('close');
	}

	async function handleUpdate() {
		if (!user) return;

		try {
			const res = await fetch(`http://localhost:8000/api/users/${user.id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, email, firstname, lastname }),
				credentials: 'include'
			});

			if (!res.ok) throw new Error('Failed to update user');

			dispatch('updated'); // Notify parent to refresh
			close(); // Close modal
		} catch (err) {
			console.error('Update user failed:', err);
			alert('Failed to update user');
		}
	}
</script>

{#if open && user}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
			<h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Edit User</h2>

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
					on:click={handleUpdate}
				>
					Update
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
