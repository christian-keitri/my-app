<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let user: { userId: number; email: string } | null = null;
	let loading = true;

	onMount(async () => {
		try {
			const res = await fetch('http://localhost:8000/api/me', {
				credentials: 'include'
			});
			if (res.ok) {
				const data = await res.json();
				user = data.user;
			}
		} catch (e) {
			console.error('Error fetching user:', e);
		} finally {
			loading = false;
		}
	});

	async function logout() {
		try {
			await fetch('http://localhost:8000/api/logout', {
				method: 'POST',
				credentials: 'include'
			});
		} catch (e) {
			console.error('Logout failed:', e);
		} finally {
			goto('/login');
		}
	}
</script>

<div class="flex h-screen">
	<!-- Sidebar -->
	<aside class="w-64 bg-gray-900 text-white p-4 flex flex-col justify-between">
		<div>
			<h2 class="text-xl font-bold mb-4">Sidebar</h2>
			<ul class="space-y-2">
				<li><a href="/dashboard" class="hover:underline">Dashboard</a></li>
				<li><a href="/dashboard/users" class="hover:underline">Users</a></li>
				<li><a href="/dashboard/organizations" class="hover:underline">Organizations</a></li>
				<li><a href="/dashboard/portals" class="hover:underline">Portals</a></li>
			</ul>
		</div>

		<div class="text-sm text-gray-400 mt-4 border-t border-gray-700 pt-4">
			{#if loading}
				<p>Loading user...</p>
			{:else if user}
				<p class="mb-2">👤 Logged in as: <strong>{user.email}</strong></p>
				<button
					on:click={logout}
					class="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
				>
					Log out
				</button>
			{:else}
				<p>Not logged in</p>
			{/if}
		</div>
	</aside>

	<!-- Main Content Area -->
	<main class="flex-1 p-8 overflow-y-auto">
		<slot />
	</main>
</div>
