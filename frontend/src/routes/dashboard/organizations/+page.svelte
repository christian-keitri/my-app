<script lang="ts">
	import { onMount } from 'svelte';
	import { Eye, Pencil, Settings, Power } from 'lucide-svelte';
	import CreateOrganizationModal from '$lib/components/CreateOrganizationModal.svelte';
	import TooltipButton from '$lib/components/TooltipButton.svelte';
	import EditOrganizationModal from '$lib/components/EditOrganizationModal.svelte';
	import { goto } from '$app/navigation';

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
	let showCreateModal = false;
	let showEditModal = false;
	let selectedOrg: Organization | null = null;

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

	function viewBranches(org: Organization) {
		goto(`/dashboard/branches?orgId=${org.id}`);
	}

	function editOrg(org: Organization) {
		selectedOrg = org;
		showEditModal = true;
	}

	function openSettings(org: Organization) {
		goto(`/dashboard/settings?orgId=${org.id}`);
	}

	async function handleCreate(event: CustomEvent) {
		const newOrg = event.detail;

		try {
			const res = await fetch('http://localhost:8000/api/organizations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify(newOrg)
			});

			if (!res.ok) throw new Error('Failed to create organization');

			await fetchOrganizations();
		} catch (err) {
			console.error('Error creating organization:', err);
			alert('Failed to create organization');
		} finally {
			showCreateModal = false;
		}
	}

	async function handleUpdate(event: CustomEvent) {
		const updatedOrg = event.detail;

		try {
			const res = await fetch(`http://localhost:8000/api/organizations/${updatedOrg.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify(updatedOrg)
			});

			if (!res.ok) throw new Error('Failed to update organization');

			// Update local organizations array
			organizations = organizations.map((org) =>
				org.id === updatedOrg.id ? { ...org, ...updatedOrg } : org
			);
		} catch (err) {
			console.error('Error updating organization:', err);
			alert('Failed to update organization');
		} finally {
			showEditModal = false;
			selectedOrg = null;
		}
	}

	async function toggleStatus(org: Organization) {
		try {
			const res = await fetch(`http://localhost:8000/api/organizations/${org.id}/toggle`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});

			if (!res.ok) throw new Error('Failed to toggle status');

			const updatedOrg = await res.json();

			// Update the UI without refetching all
			organizations = organizations.map((o) =>
				o.id === updatedOrg.id ? { ...o, isEnabled: updatedOrg.isEnabled } : o
			);
		} catch (err) {
			console.error('Toggle failed:', err);
			alert('Failed to toggle status');
		}
	}
</script>

<!-- Title -->
<div class="flex items-center justify-between mb-4">
	<h1 class="text-2xl font-bold">Organizations Management</h1>
	<button
		class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
		on:click={() => (showCreateModal = true)}
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
	<div class="sm:overflow-visible overflow-x-auto">
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
							<TooltipButton icon={Pencil} label="Edit Organization" onClick={() => editOrg(org)} />
							<TooltipButton icon={Eye} label="View Branches" onClick={() => viewBranches(org)} />
							<TooltipButton
								icon={Power}
								label={org.isEnabled ? 'Disable' : 'Enable'}
								onClick={() => toggleStatus(org)}
							/>
							<TooltipButton icon={Settings} label="Settings" onClick={() => openSettings(org)} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="text-gray-500">No organizations found.</p>
{/if}

<!-- Modals -->
{#if showCreateModal}
	<CreateOrganizationModal on:close={() => (showCreateModal = false)} on:create={handleCreate} />
{/if}

{#if showEditModal && selectedOrg}
	<EditOrganizationModal
		open={showEditModal}
		organization={selectedOrg}
		on:close={() => {
			showEditModal = false;
			selectedOrg = null;
		}}
		on:update={handleUpdate}
	/>
{/if}
