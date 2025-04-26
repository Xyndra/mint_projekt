<script lang="ts">
  import Map from "./lib/Map.svelte";
  import PokeBox from "./lib/PokeBox.svelte";
</script>

<main>
  <div class="main">
    <Map />
    <PokeBox />
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
  }
  .main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #f0f0f0;
  }
</style>
