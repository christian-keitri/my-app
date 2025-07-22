<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	let user: { userId: number; email: string } | null = null;
	let loading = true;

	onMount(async () => {
		try {
			const res = await fetch('http://localhost:8000/api/me', {
				credentials: 'include'
			});
			const data = await res.json();
			user = data.user;
		} catch (e) {
			console.error('Error fetching user:', e);
		} finally {
			loading = false;
		}
	});
</script>

<div class="flex h-screen">
	<!-- Sidebar -->
	<aside class="w-64 bg-gray-900 text-white p-4">
		<h2 class="text-xl font-bold mb-4">Sidebar</h2>
		{#if loading}
			<p>Loading user...</p>
		{:else if user}
			<p class="mb-2">👤 Logged in as: <strong>{user.email}</strong></p>
		{:else}
			<p>Not logged in</p>
		{/if}
	</aside>

	<!-- Main Content -->
	<main class="flex-1 p-8">
		<h1 class="text-3xl font-bold mb-4">Welcome to your dashboard!</h1>
		<p>This is where the magic happens ✨</p>
	</main>
</div>
