<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let open = false;
	export let organizationId: string | null = null;

	const dispatch = createEventDispatcher();

	let organizations: { id: string; name: string }[] = [];
	let error = '';

	// Form data
	let form = {
		data: {
			name: '',
			organizationId: ''
		}
	};

	// Fetch orgs on mount
	onMount(async () => {
		try {
			organizations = await fetchOrganizations();
			if (organizationId) {
				form.data.organizationId = organizationId;
			}
		} catch (err) {
			error = 'Failed to load organizations.';
			console.error(err);
		}
	});

	async function fetchOrganizations() {
		const res = await fetch('http://localhost:8000/api/organizations');
		if (!res.ok) throw new Error('Failed to fetch organizations');
		return await res.json();
	}

	async function createBranch(data: { name: string; organizationId: string }) {
		const res = await fetch('http://localhost:8000/api/branches', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});
		if (!res.ok) {
			const errorData = await res.json();
			return { success: false, message: errorData.message };
		}
		return { success: true };
	}

	async function handleSubmit() {
		error = '';
		const result = await createBranch(form.data);
		if (result.success) {
			dispatch('created');
		} else {
			error = result.message || 'Failed to create branch.';
		}
	}

	function closeModal() {
		dispatch('close');
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md relative">
			<h2 class="text-xl font-semibold mb-4">Create Branch</h2>

			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<div>
					<label for="name" class="block text-sm font-medium">Branch Name</label>
					<input
						id="name"
						type="text"
						name="name"
						bind:value={form.data.name}
						required
						class="mt-1 w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
					/>
				</div>

				<div>
					<label for="organizationId" class="block text-sm font-medium">Organization</label>
					<select
						id="organizationId"
						name="organizationId"
						bind:value={form.data.organizationId}
						required
						class="mt-1 w-full border px-3 py-2 rounded dark:bg-gray-800 dark:text-white"
					>
						<option value="" disabled selected>Select organization</option>
						{#each organizations as org}
							<option value={org.id}>{org.name}</option>
						{/each}
					</select>
				</div>

				{#if error}
					<p class="text-red-500 text-sm">{error}</p>
				{/if}

				<div class="flex justify-end gap-2">
					<button
						type="button"
						on:click={closeModal}
						class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
					>
						Cancel
					</button>
					<button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
						Create
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
