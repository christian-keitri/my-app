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

			dispatch('updated'); // tell parent to refresh
			close(); // close the modal
		} catch (err) {
			console.error('Update user failed:', err);
		}
	}
</script>

{#if open && user}
	<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
			<h2 class="text-xl font-bold mb-4">Edit User</h2>

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
			</div>

			<div class="mt-6 flex justify-end gap-2">
				<button on:click={close} class="px-4 py-2 rounded border border-gray-300">Cancel</button>
				<button
					on:click={handleUpdate}
					class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
				>
					Update
				</button>
			</div>
		</div>
	</div>
{/if}
