<script lang="ts">
	import { onMount } from 'svelte';

	type PortalCode = {
		id: string;
		code: string;
		integrationType: string;
		status: boolean;
		createdAt: string;
		branch: {
			id: string;
			name: string;
		};
	};

	let portalCodes: PortalCode[] = [];
	let loading = true;
	let error = '';

	async function fetchPortalCodes() {
		try {
			const res = await fetch('http://localhost:8000/api/branch-portal-codes');
			if (!res.ok) throw new Error('Failed to fetch portal codes');
			const data = await res.json();
			portalCodes = data;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unexpected error';
		} finally {
			loading = false;
		}
	}

	async function togglePortalCodeStatus(id: string) {
		try {
			const res = await fetch(`http://localhost:8000/api/branch-portal-codes/${id}/toggle`, {
				method: 'PUT'
			});
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.message || 'Failed to toggle status');
			}
			// Refresh list after toggle
			await fetchPortalCodes();
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Unexpected error');
		}
	}

	onMount(fetchPortalCodes);
</script>

<div class="p-6">
	<h1 class="text-2xl font-bold mb-4">Portal Code Settings</h1>

	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p class="text-red-500">{error}</p>
	{:else if portalCodes.length === 0}
		<p>No portal codes found.</p>
	{:else}
		<table class="w-full table-auto border-collapse border border-gray-300 rounded overflow-hidden">
			<thead class="bg-gray-100 dark:bg-gray-800 text-left">
				<tr>
					<th class="px-4 py-2 border">Code</th>
					<th class="px-4 py-2 border">Integration</th>
					<th class="px-4 py-2 border">Branch</th>
					<th class="px-4 py-2 border">Status</th>
					<th class="px-4 py-2 border">Created At</th>
					<th class="px-4 py-2 border">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each portalCodes as code}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
						<td class="px-4 py-2 border">{code.code}</td>
						<td class="px-4 py-2 border">{code.integrationType}</td>
						<td class="px-4 py-2 border">{code.branch?.name || '—'}</td>
						<td class="px-4 py-2 border">
							<span class={code.status ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
								{code.status ? 'Active' : 'Inactive'}
							</span>
						</td>
						<td class="px-4 py-2 border">{new Date(code.createdAt).toLocaleString()}</td>
						<td class="px-4 py-2 border">
							<button
								on:click={() => togglePortalCodeStatus(code.id)}
								class="px-3 py-1 rounded text-white text-sm transition-colors
                       {code.status
									? 'bg-red-600 hover:bg-red-700'
									: 'bg-green-600 hover:bg-green-700'}"
							>
								{code.status ? 'Disable' : 'Enable'}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
