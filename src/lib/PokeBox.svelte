<script lang="ts">
    import { gameState } from "../logic/game.svelte";
    import Pokemon from "./PokemonDisplay.svelte";

    let pokemons = $derived.by(() => {
        if (gameState.localPlayer) {
            return (
                gameState.players.find(
                    (player) => player.name === gameState.localPlayer,
                )?.pokemons || []
            );
        } else {
            return [];
        }
    });
</script>

<div class="p-4 h-full">
    <h1 class="text-4xl text-nowrap">Pokemon Box</h1>
    <div class="grid grid-cols-2 gap-x-2">
        {#each pokemons as pokemon}
            <Pokemon {pokemon} />
        {/each}
    </div>
</div>
