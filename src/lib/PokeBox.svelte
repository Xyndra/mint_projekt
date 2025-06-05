<script lang="ts">
    import Pokemon from "./PokemonDisplay.svelte";

    function range(start: number, end: number) {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
</script>

<div class="m-4 h-full">
    <h1 class="text-4xl text-nowrap">Pokemon Box</h1>
    <div class="grid grid-cols-2 gap-x-2">
        <Pokemon pokedex_number={1} />
        <Pokemon pokedex_number={2} shiny={true} />
        <Pokemon pokedex_number={1009} />
        {#each range(18, 25) as id}
            <Pokemon pokedex_number={id} />
        {/each}
        <Pokemon
            pokedex_number={Math.round(Math.random() * 1025)}
            shiny={true}
        />
    </div>
</div>
