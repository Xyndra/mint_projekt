<script lang="ts">
    let { pokedex_number } = $props();
</script>

<img src={"/api/img/pokemon/" + pokedex_number + ".png"} alt="Pokemon" />
