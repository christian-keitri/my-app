<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<main class="min-h-screen flex items-center justify-center">
	<div>
		<button on:click={() => goto('/login')} class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
			Login
		</button>
	</div>
</main>
