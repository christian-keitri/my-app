<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let open: boolean;

	const dispatch = createEventDispatcher();

	// Form fields
	let code = '';
	let branchId = '';
	let integrationType = '';

	// Branch options
	interface Branch {
		id: string;
		name: string;
	}
	let branches: Branch[] = [];
	let loadingBranches = false;
	let loadError = '';

	onMount(async () => {
		if (!open) return; // only load when shown
		await loadBranches();
	});

	// if modal is opened/closed repeatedly, reload branches when opened
	$: if (open) {
		loadBranches();
	}

	async function loadBranches() {
		if (loadingBranches) return;
		loadingBranches = true;
		loadError = '';
		try {
			const res = await fetch('http://localhost:8000/api/branches');
			if (!res.ok) throw new Error(`Failed to load branches (${res.status})`);
			branches = await res.json();
		} catch (err) {
			loadError = err instanceof Error ? err.message : 'Unknown error loading branches';
			console.error('Load branches failed:', err);
		} finally {
			loadingBranches = false;
		}
	}

	async function handleCreate() {
		// Basic validation
		if (!code || !branchId || !integrationType) {
			alert('All fields are required');
			return;
		}

		try {
			const res = await fetch('http://localhost:8000/api/branch-portal-codes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code, branchId, integrationType }) // status defaults true in schema
			});

			// Try parsing only if content-type is JSON
			const contentType = res.headers.get('content-type');
			let data: any = null;

			if (contentType && contentType.includes('application/json')) {
				data = await res.json();
			} else {
				const text = await res.text(); // fallback
				console.warn('Non-JSON response:', text);
				throw new Error('Invalid JSON response from server');
			}

			console.log('Create response:', res.status, data);

			if (!res.ok) {
				console.error('Backend error:', data);
				throw new Error(data?.message || 'Failed to create branch portal code');
			}

			// success: clear form and notify parent
			resetForm();
			dispatch('created'); // parent will refresh + close
		} catch (err) {
			if (err instanceof Error) {
				console.error('Create failed:', err.message);
				alert(`Failed: ${err.message}`);
			} else {
				console.error('Unknown error:', err);
				alert('Unknown error occurred');
			}
		}
	}

	function close() {
		resetForm();
		dispatch('close');
	}

	function resetForm() {
		code = '';
		branchId = '';
		integrationType = '';
	}
</script>

{#if open}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
		<div class="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md space-y-4">
			<h2 class="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
				Create Branch Portal Code
			</h2>

			<!-- Portal Code -->
			<input
				class="w-full p-2 border rounded"
				bind:value={code}
				placeholder="Code"
				autocomplete="off"
			/>

			<!-- Integration Type -->
			<input
				class="w-full p-2 border rounded"
				bind:value={integrationType}
				placeholder="Integration Type (e.g. API, Webhook)"
				autocomplete="off"
			/>

			<!-- Branch Selector -->
			{#if loadError}
				<p class="text-sm text-red-600">{loadError}</p>
			{:else}
				<select
					bind:value={branchId}
					class="w-full p-2 border rounded"
					disabled={loadingBranches || branches.length === 0}
				>
					<option value="" disabled selected>
						{loadingBranches
							? 'Loading branches...'
							: branches.length === 0
								? 'No branches found'
								: 'Select Branch'}
					</option>
					{#each branches as b}
						<option value={b.id}>{b.name}</option>
					{/each}
				</select>
			{/if}

			<div class="flex justify-end space-x-2 pt-2">
				<button
					type="button"
					class="px-4 py-2 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
					on:click={close}
				>
					Cancel
				</button>
				<button
					type="button"
					class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
					on:click={handleCreate}
				>
					Create
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	input,
	select {
		background-color: white;
		color: black;
	}
	:global(.dark) input,
	:global(.dark) select {
		background-color: #1f2937;
		color: white;
	}
</style>
