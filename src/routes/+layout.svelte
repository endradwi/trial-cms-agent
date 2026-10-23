<script lang="ts">
  import '../app.css';
  let { children } = $props();
</script>

<svelte:head>
  <title>Agency Ops CMS — Clipper & Affiliate Command Center</title>
</svelte:head>

<div class="min-h-screen bg-[#010736] text-[#fcf1d0]">
  {@render children()}
</div>
