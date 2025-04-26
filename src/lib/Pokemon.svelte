<script lang="ts">
    let { pokedex_number, shiny = false } = $props();
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

<img src={path} onerror={handleError} alt="Pokemon" />
