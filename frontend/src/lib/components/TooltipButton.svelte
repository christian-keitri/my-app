<script lang="ts">
	// Props passed into the component
	export let icon: typeof import('lucide-svelte').Pencil;
	export let label: string;
	export let onClick: () => void;
	export let colorClass: string = 'text-gray-700'; // Optional override
</script>

<!-- Wrapper for tooltip and button -->
<div class="relative group inline-block">
	<!-- Icon Button -->
	<button class="icon-button" aria-label={label} on:click={onClick}>
		<svelte:component this={icon} class={`w-5 h-5 ${colorClass}`} />
	</button>

	<!-- Tooltip -->
	<div
		class="absolute top-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs text-white bg-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"
	>
		{label}
	</div>
</div>

<style>
	.icon-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: background-color 0.2s ease-in-out;
	}
	.icon-button:hover {
		background-color: #f3f4f6;
	}
</style>
