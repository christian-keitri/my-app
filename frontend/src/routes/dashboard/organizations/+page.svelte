<script lang="ts">
	import { onMount } from 'svelte';
	import { Eye, Pencil, Settings, Power } from 'lucide-svelte';

	type Organization = {
		id: string;
		name: string;
		notes?: string;
		isEnabled: boolean;
		createdAt: string;
	};

	let organizations: Organization[] = [];
	let error = '';
	let loading = true;

	onMount(fetchOrganizations);

	async function fetchOrganizations() {
		try {
			const res = await fetch('http://localhost:8000/api/organizations', {
				credentials: 'include'
			});
			if (!res.ok) throw new Error('Failed to fetch');
			organizations = await res.json();
		} catch (e) {
			error = 'Failed to load organizations';
			console.error(e);
		} finally {
			loading = false;
		}
	}

	function toggleStatus(org: Organization) {
		// TODO: Make API call to toggle status
		console.log('Toggle', org.id);
	}

	function viewBranches(org: Organization) {
		console.log('Branches for', org.name);
	}

	function editOrg(org: Organization) {
		console.log('Edit', org.name);
	}

	function openSettings(org: Organization) {
		console.log('Settings for', org.name);
	}
</script>

<!-- Title -->
<div class="flex items-center justify-between mb-4">
	<h1 class="text-2xl font-bold">Organizations Management</h1>
	<button
		class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
		on:click={() => console.log('Create org modal')}
	>
		+ Create Organization
	</button>
</div>

<!-- Table -->
{#if loading}
	<p class="text-gray-500">Loading organizations...</p>
{:else if error}
	<p class="text-red-500">{error}</p>
{:else if organizations.length > 0}
	<div class="overflow-x-auto">
		<table class="min-w-full border border-gray-300 shadow-sm text-sm">
			<thead class="bg-gray-100 text-left">
				<tr>
					<th class="border px-4 py-2">Name</th>
					<th class="border px-4 py-2">Notes</th>
					<th class="border px-4 py-2">Status</th>
					<th class="border px-4 py-2">Created At</th>
					<th class="border px-4 py-2 text-center">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each organizations as org}
					<tr class="hover:bg-gray-50">
						<td class="border px-4 py-2">{org.name}</td>
						<td class="border px-4 py-2">{org.notes || '—'}</td>
						<td class="border px-4 py-2">
							<span class={org.isEnabled ? 'text-green-600' : 'text-red-600'}>
								{org.isEnabled ? 'Enabled' : 'Disabled'}
							</span>
						</td>
						<td class="border px-4 py-2">{new Date(org.createdAt).toLocaleString()}</td>
						<td class="border px-4 py-2 text-center space-x-1">
							<button class="icon-button" title="View Branches" on:click={() => viewBranches(org)}>
								<Eye class="w-4 h-4" />
							</button>
							<button class="icon-button" title="Edit Organization" on:click={() => editOrg(org)}>
								<Pencil class="w-4 h-4" />
							</button>
							<button
								class="icon-button"
								title={org.isEnabled ? 'Disable' : 'Enable'}
								on:click={() => toggleStatus(org)}
							>
								<Power class="w-4 h-4" />
							</button>
							<button class="icon-button" title="Settings" on:click={() => openSettings(org)}>
								<Settings class="w-4 h-4" />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-gray-500">No organizations found.</p>
{/if}

<style>
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: all 0.2s ease-in-out;
	}

	.icon-button:hover {
		background-color: #f3f4f6;
	}
</style>
