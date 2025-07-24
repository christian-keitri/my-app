<script lang="ts">
	import { onMount } from 'svelte';
	import { Pencil, Power, Settings } from 'lucide-svelte';
	import CreateBranchModal from '$lib/components/CreateBranchModal.svelte';
	import TooltipButton from '$lib/components/TooltipButton.svelte';
	import EditBranchModal from '$lib/components/EditBranchModal.svelte';
	import { goto } from '$app/navigation';

	type Branch = {
		id: string;
		name: string;
		status: boolean;
		createdAt: string;
		organization: {
			id: string;
			name: string;
		} | null;
	};

	let branches: Branch[] = [];
	let error = '';
	let loading = true;
	let showCreateModal = false;
	let showEditModal = false;
	let selectedBranch: Branch | null = null;

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
		selectedBranch = branch;
		showEditModal = true;
	}

	// ✅ This now updates the status locally in the UI
	async function toggleStatus(branch: Branch) {
		try {
			const res = await fetch(`http://localhost:8000/api/branches/${branch.id}/toggle`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' }
			});

			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.message || 'Failed to toggle status');
			}

			// ✅ Update the branch status in the local array
			branches = branches.map((b) => (b.id === branch.id ? { ...b, status: !b.status } : b));
		} catch (err) {
			console.error('Toggle error:', err);
			alert(err instanceof Error ? err.message : 'Unexpected error');
		}
	}

	function openSettings(branch: Branch) {
		goto(`/dashboard/settings?branchId=${branch.id}`);
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
						<td class="p-2 border">
							<span class={branch.status ? 'text-green-600 font-semibold' : 'text-gray-500'}>
								{branch.status ? 'Enabled' : 'Disabled'}
							</span>
						</td>
						<td class="p-2 border">{new Date(branch.createdAt).toLocaleString()}</td>
						<td class="p-2 border">
							<div class="flex gap-2">
								<TooltipButton
									icon={Pencil}
									label="Edit branch"
									onClick={() => editBranch(branch)}
								/>
								<TooltipButton
									icon={Power}
									label={branch.status ? 'Disable branch' : 'Enable branch'}
									onClick={() => toggleStatus(branch)}
									colorClass={branch.status ? 'text-green-600' : 'text-gray-600'}
								/>
								<TooltipButton
									icon={Settings}
									label="Branch settings"
									onClick={() => openSettings(branch)}
								/>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	{#if showEditModal && selectedBranch}
		<EditBranchModal
			open={showEditModal}
			branch={selectedBranch}
			on:close={() => {
				showEditModal = false;
				selectedBranch = null;
			}}
			on:updated={() => {
				showEditModal = false;
				selectedBranch = null;
				fetchBranches(); // Refresh the list
			}}
		/>
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
