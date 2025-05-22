<script lang="ts">
    import { onMount } from "svelte";
    import kanto from "../assets/kanto.png";
    import MapPoint from "./MapPoint.svelte";

    let mapWidth = $state(1);
    let mapHeight = $state(1);

    function updateSize() {
        // Get size of outer div
        const outer = document.getElementById("outer");
        if (!outer) return;
        const width = outer.clientWidth;
        const height = outer.clientHeight;
        if (width / 3200 > height / 2212) {
            mapWidth = width;
            mapHeight = 2212 * (width / 3200);
        } else {
            mapHeight = height;
            mapWidth = 3200 * (height / 2212);
        }
    }
    onMount(() => {
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => {
            window.removeEventListener("resize", updateSize);
    };
    });
</script>

<div id="outer" class="overflow-auto w-full h-full">
    <div class="relative">
    <div style={`width: ${mapWidth}px; height: ${mapHeight}px;`}>
        <img src={kanto} alt="Kanto Map" />
    </div>
</div>
