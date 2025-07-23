<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;
	export let organization: {
		id: string;
		name: string;
		description?: string;
		notes?: string;
		isEnabled: boolean;
	} | null = null;

	const dispatch = createEventDispatcher();

	let name = '';
	let description = '';
	let notes = '';
	let isEnabled = true;

	// Sync fields when modal opens with a valid organization
	$: if (organization && open) {
		name = organization.name;
		description = organization.description || '';
		notes = organization.notes || '';
		isEnabled = organization.isEnabled;
	}

	function close() {
		dispatch('close');
	}

	async function handleUpdate() {
		if (!organization) return;

		try {
			dispatch('update', {
				...organization,
				name,
				description,
				notes,
				isEnabled
			});
			close();
		} catch (err) {
			console.error('Update failed:', err);
			alert('Failed to update organization');
		}
	}
</script>

{#if open && organization}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
			<h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Edit Organization</h2>

			<!-- Name Input -->
			<div class="flex flex-col">
				<label for="name" class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
				<input
					id="name"
					class="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
					bind:value={name}
					placeholder="Organization Name"
				/>
			</div>

			<!-- Description -->
			<div class="flex flex-col">
				<label for="description" class="text-sm font-medium text-gray-700 dark:text-gray-300"
					>Description</label
				>
				<textarea
					id="description"
					class="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
					rows="2"
					bind:value={description}
					placeholder="Short description"
				></textarea>
			</div>

			<!-- Notes -->
			<div class="flex flex-col">
				<label for="notes" class="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label
				>
				<textarea
					id="notes"
					class="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:text-white"
					rows="2"
					bind:value={notes}
					placeholder="Additional notes"
				></textarea>
			</div>

			<!-- Enabled Switch -->
			<label class="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
				<input id="status" type="checkbox" bind:checked={isEnabled} />
				<span>Status: {isEnabled ? 'Enabled' : 'Disabled'}</span>
			</label>

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
