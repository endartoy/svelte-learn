<script>
    import { goto } from '$app/navigation'
	import { onMount } from 'svelte';
    
    onMount(() => goto('/kas-p2g', {replaceState: true} ))
</script>

<div class="container">
    <h1>Selamat datang kawan</h1>
</div>
