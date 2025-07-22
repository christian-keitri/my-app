<script lang="ts">
	import { onMount } from 'svelte';
	import CreateUserModal from '$lib/components/CreateUserModal.svelte'; // adjust path if needed
	import EditUserModal from '$lib/components/EditUserModal.svelte';

	type User = {
		id: number;
		username: string;
		email: string;
		firstname: string;
		lastname: string;
	};

	let users: User[] = [];
	let showModal = false;
	let showEditModal = false;
	let selectedUser: User | null = null;

	onMount(fetchUsers);

	async function fetchUsers() {
		try {
			const res = await fetch('http://localhost:8000/api/users', {
				credentials: 'include'
			});
			users = await res.json();
		} catch (err) {
			console.error('Failed to fetch users:', err);
		}
	}

	function openEditModal(user: User) {
		selectedUser = user;
		showEditModal = true;
	}
</script>

<!-- Header -->
<div class="flex items-center justify-between mb-4">
	<h1 class="text-2xl font-bold">Users Management</h1>
	<button
		on:click={() => (showModal = true)}
		class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
	>
		+ Create User
	</button>
</div>

<!-- Table -->
{#if users.length > 0}
	<table class="w-full border-collapse border border-gray-300 shadow-sm">
		<thead class="bg-gray-100">
			<tr>
				<th class="border p-2">Username</th>
				<th class="border p-2">Email</th>
				<th class="border p-2">First Name</th>
				<th class="border p-2">Last Name</th>
				<th class="border p-2">Action</th>
			</tr>
		</thead>
		<tbody>
			{#each users as user}
				<tr class="hover:bg-gray-50">
					<td class="border p-2">{user.username}</td>
					<td class="border p-2">{user.email}</td>
					<td class="border p-2">{user.firstname}</td>
					<td class="border p-2">{user.lastname}</td>
					<td class="border p-2 text-center">
						<button
							on:click={() => openEditModal(user)}
							class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
						>
							Edit
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<p>Loading users...</p>
{/if}

<!-- Modal Component -->
<CreateUserModal open={showModal} on:close={() => (showModal = false)} on:created={fetchUsers} />

<EditUserModal
	open={showEditModal}
	user={selectedUser}
	on:close={() => {
		showEditModal = false;
		selectedUser = null;
	}}
	on:updated={fetchUsers}
/>
