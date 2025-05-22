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
            <img src={kanto} alt="Kanto Map" class="inline" />
        </div>
        <div class="absolute top-0 left-0 pointer-events-none" style={`width: ${mapWidth}px; height: ${mapHeight}px;`}>
            <MapPoint x={0} y={0} kind="catch" />
            <MapPoint x={100} y={100} kind="event" />
            <MapPoint x={200} y={200} kind="event" />
            <MapPoint x={300} y={300} kind="catch" />
            <MapPoint x={400} y={400} kind="city" city_name="Pewter City">
                Test
            </MapPoint>
        </div>
    </div>
</div>
