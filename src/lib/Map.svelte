<script lang="ts">
    import kanto from "../assets/kanto.png";

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

    window.onresize = () => {
        updateSize();
    };
    document.addEventListener("DOMContentLoaded", updateSize);
</script>

<div id="outer" class="overflow-auto w-full h-full">
    <div style={`width: ${mapWidth}px; height: ${mapHeight}px;`}>
        <img src={kanto} alt="Kanto Map" />
    </div>
</div>
