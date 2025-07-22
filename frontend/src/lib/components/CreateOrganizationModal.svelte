<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let formData = {
		name: '',
		contactPerson: '',
		contactEmail: '',
		contactPhone: '',
		description: '',
		notes: '',
		isEnabled: true
	};

	function handleSubmit() {
		if (!formData.name.trim()) {
			alert('Name is required');
			return;
		}
		dispatch('create', formData);
	}

	function handleClose() {
		dispatch('close');
	}
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
	<div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
		<h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Create Organization</h2>

		<!-- Inputs -->
		<input
			class="w-full p-2 border rounded"
			bind:value={formData.name}
			placeholder="Organization Name"
			required
		/>
		<input
			class="w-full p-2 border rounded"
			bind:value={formData.contactPerson}
			placeholder="Contact Person"
		/>
		<input
			class="w-full p-2 border rounded"
			type="email"
			bind:value={formData.contactEmail}
			placeholder="Contact Email"
		/>
		<input
			class="w-full p-2 border rounded"
			bind:value={formData.contactPhone}
			placeholder="Contact Phone"
		/>
		<textarea
			class="w-full p-2 border rounded"
			bind:value={formData.description}
			placeholder="Description"
		></textarea>
		<textarea class="w-full p-2 border rounded" bind:value={formData.notes} placeholder="Notes"
		></textarea>

		<!-- Status toggle -->
		<label class="flex items-center space-x-2">
			<input type="checkbox" bind:checked={formData.isEnabled} />
			<span class="text-sm text-gray-700 dark:text-gray-300">
				{formData.isEnabled ? 'Enabled' : 'Disabled'}
			</span>
		</label>

		<!-- Buttons -->
		<div class="flex justify-end space-x-2 pt-2">
			<button
				class="px-4 py-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
				on:click={handleClose}
			>
				Cancel
			</button>
			<button
				class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
				on:click={handleSubmit}
			>
				Create
			</button>
		</div>
	</div>
</div>

<style>
	input,
	textarea {
		background-color: white;
		color: black;
	}
	:global(.dark) input,
	:global(.dark) textarea {
		background-color: #1f2937;
		color: white;
	}
</style>
