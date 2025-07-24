<script lang="ts">
	import { onMount } from 'svelte';
	import { Power, Trash2 } from 'lucide-svelte';
	import CreateBranchPortalModal from '$lib/components/CreateBranchPortalModal.svelte';
	import TooltipButton from '$lib/components/TooltipButton.svelte';

	let showModal = false;
	let branchPortalCodes: {
		id: string;
		code: string;
		branchId: string;
		integrationType: string;
		status: boolean;
		createdAt: string;
	}[] = [];

	// ✅ Fetch portal codes
	async function fetchBranchPortalCodes() {
		const res = await fetch('http://localhost:8000/api/branch-portal-codes');
		branchPortalCodes = await res.json();
	}

	// ✅ Toggle status
	async function toggleCodeStatus(id: string) {
		try {
			const res = await fetch(`http://localhost:8000/api/branch-portal-codes/${id}/toggle`, {
				method: 'PUT'
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Failed to toggle');
			}

			const updated = await res.json();
			alert(`Status toggled: ${updated.status ? 'Enabled' : 'Disabled'}`);
			await fetchBranchPortalCodes();
		} catch (err) {
			console.error(err);
			alert('Error toggling portal code');
		}
	}

	// ✅ Delete portal code
	async function deleteCode(id: string) {
		if (!confirm('Are you sure you want to delete this code?')) return;

		try {
			const res = await fetch(`http://localhost:8000/api/branch-portal-codes/${id}`, {
				method: 'DELETE'
			});

			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.message || 'Failed to delete');
			}

			alert('Code deleted');
			await fetchBranchPortalCodes();
		} catch (err) {
			console.error(err);
			alert('Error deleting portal code');
		}
	}

	onMount(fetchBranchPortalCodes);

	function openModal() {
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}
</script>

<div class="p-6">
	<div class="flex justify-between items-center mb-4">
		<h1 class="text-2xl font-bold">Branch Portal Codes Management</h1>
		<button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" on:click={openModal}>
			Create Branch Portal Code
		</button>
	</div>

	<table class="w-full table-auto border border-gray-300">
		<thead class="bg-gray-100">
			<tr>
				<th class="px-4 py-2 border">Code</th>
				<th class="px-4 py-2 border">Branch ID</th>
				<th class="px-4 py-2 border">Integration Type</th>
				<th class="px-4 py-2 border">Status</th>
				<th class="px-4 py-2 border">Created At</th>
				<th class="px-4 py-2 border">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each branchPortalCodes as code}
				<tr>
					<td class="px-4 py-2 border">{code.code}</td>
					<td class="px-4 py-2 border">{code.branchId}</td>
					<td class="px-4 py-2 border">{code.integrationType}</td>
					<td class="px-4 py-2 border">{code.status ? 'Enabled' : 'Disabled'}</td>
					<td class="px-4 py-2 border">{new Date(code.createdAt).toLocaleString()}</td>
					<td class="px-4 py-2 border flex gap-2 justify-center">
						<TooltipButton
							icon={Power}
							label={code.status ? 'Disable code' : 'Enable code'}
							onClick={() => toggleCodeStatus(code.id)}
							colorClass={code.status ? 'text-green-600' : 'text-gray-600'}
						/>

						<TooltipButton
							icon={Trash2}
							label="Delete code"
							onClick={() => deleteCode(code.id)}
							colorClass="text-red-600"
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if showModal}
	<CreateBranchPortalModal
		open={showModal}
		on:close={closeModal}
		on:created={() => {
			fetchBranchPortalCodes();
			closeModal();
		}}
	/>
{/if}
