<script lang="ts">
    let { pokedex_number, shiny = false, attack = 4, hp = 5 } = $props();
    function genPath(pokedex_number: number, shiny: boolean): string {
        let path = "/api/img/pokemon/";
        if (shiny) {
            path += "shiny/";
        }
        path += pokedex_number + ".png";
        return path;
    }
    let path = $derived(genPath(pokedex_number, shiny));
    function handleError(event: Event) {
        console.error("Image loading error:", event);
        pokedex_number = 0;
    }
</script>

<div class="relative flex justify-center items-center">
    <img src={path} onerror={handleError} alt="Pokemon" style="image-rendering: crisp-edges;" />
    <div class="absolute bottom-0 left-0 flex items-center text-sm font-bold px-1">
        <span class="text-red-500 mr-1">⚔️</span>
        {attack}
    </div>
    <div class="absolute bottom-0 right-0 flex items-center text-sm font-bold px-1">
        <span class="text-green-500 mr-1">❤️</span>
        {hp}
    </div>
</div>
