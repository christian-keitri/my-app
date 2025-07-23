<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Branch } from '$lib/types';

	export let open: boolean;
	export let branch: Branch;

	const dispatch = createEventDispatcher();

	let name = '';
	let status = true;

	onMount(() => {
		if (branch) {
			name = branch.name;
			status = branch.status ?? true;
		}
	});

	function close() {
		dispatch('close');
	}

	async function updateBranch() {
		try {
			const res = await fetch(`http://localhost:8000/api/branches/${branch.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					status,
					organizationId: branch.organization?.id
				})
			});

			if (!res.ok) {
				const err = await res.json();
				alert(`Failed to update branch: ${err.message}`);
				return;
			}

			dispatch('updated');
			close();
		} catch (error) {
			console.error('Error updating branch:', error);
			alert('Unexpected error occurred.');
		}
	}
</script>

{#if open && branch}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
			<h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Edit Branch</h2>

			<!-- Branch Name Input -->
			<input
				id="branch-name"
				class="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
				bind:value={name}
				placeholder="Branch Name"
			/>

			<!-- Status Toggle -->
			<div class="flex items-center space-x-2">
				<input id="status-toggle" type="checkbox" bind:checked={status} />
				<label for="status-toggle" class="text-sm">
					{status ? 'Enabled' : 'Disabled'}
				</label>
			</div>

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
					on:click={updateBranch}
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
