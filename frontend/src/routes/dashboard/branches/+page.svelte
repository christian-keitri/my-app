<script lang="ts">
	import { onMount } from 'svelte';
	import { Pencil, Power, Settings } from 'lucide-svelte';
	import CreateBranchModal from '$lib/components/CreateBranchModal.svelte';

	type Branch = {
		id: string;
		name: string;
		organization: {
			name: string;
		} | null;
		status?: boolean;
		createdAt: string;
	};

	let branches: Branch[] = [];
	let error = '';
	let loading = true;
	let showCreateModal = false;

	// TODO: Replace this with actual organization ID from store/session
	export let organizationId: string | null = null;

	async function fetchBranches() {
		loading = true;
		try {
			const res = await fetch('http://localhost:8000/api/branches');
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Failed to load branches');
			branches = data;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			loading = false;
		}
	}

	onMount(fetchBranches);

	function createBranch() {
		showCreateModal = true;
	}

	function editBranch(branch: Branch) {
		alert(`Edit branch: ${branch.name}`);
	}

	function toggleStatus(branch: Branch) {
		alert(`Toggle status for: ${branch.name}`);
	}

	function openSettings(branch: Branch) {
		alert(`Settings for: ${branch.name}`);
	}
</script>

<div class="p-6">
	<div class="flex items-center justify-between mb-4">
		<h1 class="text-2xl font-bold">Branch Management</h1>
		<button
			on:click={createBranch}
			class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
		>
			Create Branch
		</button>
	</div>

	{#if loading}
		<p>Loading branches...</p>
	{:else if error}
		<p class="text-red-500">{error}</p>
	{:else}
		<table class="w-full table-auto border-collapse border border-gray-300">
			<thead>
				<tr class="bg-gray-100 dark:bg-gray-800">
					<th class="p-2 border">Name</th>
					<th class="p-2 border">Organization</th>
					<th class="p-2 border">Status</th>
					<th class="p-2 border">Created At</th>
					<th class="p-2 border">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each branches as branch}
					<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
						<td class="p-2 border">{branch.name}</td>
						<td class="p-2 border">{branch.organization?.name || '—'}</td>
						<td class="p-2 border">{branch.status ? 'Enabled' : 'Disabled'}</td>
						<td class="p-2 border">{new Date(branch.createdAt).toLocaleString()}</td>
						<td class="p-2 border">
							<div class="flex gap-2">
								<button on:click={() => editBranch(branch)}><Pencil size={18} /></button>
								<button on:click={() => toggleStatus(branch)}><Power size={18} /></button>
								<button on:click={() => openSettings(branch)}><Settings size={18} /></button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	<CreateBranchModal
		open={showCreateModal}
		{organizationId}
		on:close={() => (showCreateModal = false)}
		on:created={() => {
			showCreateModal = false;
			fetchBranches();
		}}
	/>
</div>
