<script lang="ts">
	import { onMount } from 'svelte';
	import { Power, Trash2 } from 'lucide-svelte';
	import CreateBranchPortalModal from '$lib/components/CreateBranchPortalModal.svelte';

	let showModal = false;
	let branchPortalCodes: {
		id: string;
		code: string;
		branchId: string;
		integrationType: string;
		status: boolean;
		createdAt: string;
	}[] = [];

	// ✅ Consistent function name
	async function fetchBranchPortalCodes() {
		const res = await fetch('http://localhost:8000/api/branch-portal-codes');
		branchPortalCodes = await res.json();
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
					<td class="px-4 py-2 border">
						<button title="Regenerate code" class="mr-2 text-gray-600 hover:text-gray-800">
							<Power class="w-6 h-6" />
						</button>
						<button title="Delete code" class="text-gray-600 hover:text-gray-800">
							<Trash2 class="w-6 h-6" />
						</button>
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
			fetchBranchPortalCodes(); // ✅ This now matches the function name
			closeModal();
		}}
	/>
{/if}
