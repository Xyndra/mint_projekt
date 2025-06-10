<script lang="ts">
    import Map from "./lib/Map.svelte";
    import PokeBox from "./lib/PokeBox.svelte";
    import StartGameModal from "./lib/StartGameModal.svelte";
    import DiceModal from "./lib/DiceModal.svelte";
    import MovementPhaseIndicator from "./lib/MovementPhaseIndicator.svelte";
</script>

<main>
    <div class="main">
        <Map />
        <PokeBox />
    </div>

    <StartGameModal />
    <DiceModal />
    <MovementPhaseIndicator />
</main>

<style>
    :global(body) {
        margin: 0;
    }
    :global(*) {
        user-select: none;
    }
    :global(img) {
        pointer-events: none;
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
