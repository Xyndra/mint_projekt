<script lang="ts">
    import { createPokemon } from "../logic/pokemon";
    import Pokemon from "./PokemonDisplay.svelte";

    function range(start: number, end: number) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
</script>

<div class="m-4 h-full">
    <h1 class="text-4xl text-nowrap">Pokemon Box</h1>
    <div class="grid grid-cols-2 gap-x-2">
        {#await createPokemon(1) then pokemon}
            <Pokemon {pokemon} />
        {/await}
        {#await createPokemon(2) then pokemon}
            <Pokemon {pokemon} />
        {/await}
        {#await createPokemon(1002) then pokemon}
            <Pokemon {pokemon} />
        {/await}
        {#each range(18, 25) as id}
            {#await createPokemon(id) then pokemon}
                <Pokemon {pokemon} />
            {/await}
        {/each}
        {#await createPokemon(Math.round(Math.random() * 1025), true) then pokemon}
            <Pokemon {pokemon} />
        {/await}
    </div>
</div>
