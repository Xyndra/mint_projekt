<script lang="ts">
    import {
        type Pokemon,
        getAttackPower,
        getMaxHealth,
    } from "../logic/pokemon";

    let { pokemon }: { pokemon: Pokemon } = $props();
    function genPath(pokedex_number: number, shiny: boolean): string {
        let path = "/api/img/pokemon/";
        if (shiny) {
            path += "shiny/";
        }
        path += pokedex_number + ".png";
        return path;
    }
    let path = $derived(genPath(pokemon.dex_number, pokemon.shiny));
    function handleError(event: Event) {
        console.error("Image loading error:", event);
    }
</script>

<div class="relative flex justify-center items-center">
    <img
        src={path}
        onerror={handleError}
        alt="Pokemon"
        style="image-rendering: crisp-edges;"
    />
    <div
        class="absolute bottom-0 left-0 flex items-center text-sm font-bold px-1"
    >
        <span class="text-red-500 mr-1">⚔️</span>
        {#await getAttackPower(pokemon) then attack}
            {attack}
        {/await}
    </div>
    <div
        class="absolute bottom-0 right-0 flex items-center text-sm font-bold px-1"
    >
        <span class="text-green-500 mr-1">❤️</span>
        {#await getMaxHealth(pokemon) then maxHealth}
            {pokemon.health}/{maxHealth}
        {/await}
    </div>
</div>
