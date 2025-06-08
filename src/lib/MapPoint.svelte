<script lang="ts">
    let {
        x,
        y,
        kind,
        city_name,
        text,
        color = "#bb2222",
        mapWidth,
    }: {
        x: number;
        y: number;
        kind: "catch" | "event" | "city";
        city_name?: string;
        text?: string;
        color?: string;
        mapWidth: number;
    } = $props();

    // Calculate scale factor based on original map width (3200)
    let scaleFactor = $derived(mapWidth / 3200);
    // Base size for points (in original map pixels)
    const baseSize = 130;
</script>

<div
    class="absolute pointer-events-auto"
    style={`left: ${x * scaleFactor}px; top: ${y * scaleFactor}px;`}
>
    {#if kind === "city"}
        <div
            class="flex flex-col justify-center items-center border-black bg-[#fffc]"
            style={`
                margin-left: ${-150 * scaleFactor}px;
                margin-top: ${-85 * scaleFactor}px;
                font-size: ${34 * scaleFactor}px;
                border-width: ${2 * scaleFactor}px;
                border-radius: 0 0 ${14 * scaleFactor}px ${14 * scaleFactor}px;
                min-width: ${300 * scaleFactor}px;
            `}
        >
            <div
                class="bg-black text-white font-bold text-center w-full"
                style={`padding: ${2 * scaleFactor}px ${8 * scaleFactor}px;`}
            >
                <p>{city_name}</p>
            </div>
            <div
                class="flex items-center justify-center"
                style={`padding: ${4 * scaleFactor}px; min-height: ${140 * scaleFactor}px;`}
            >
                <p
                    class="text-center w-full"
                    style={`max-width: ${280 * scaleFactor}px; font-size: ${(text !== undefined && text.length < 20 ? 34 : 25) * scaleFactor}px;`}
                >
                    {#if text}
                        {text}
                    {/if}
                </p>
            </div>
        </div>
    {:else}
        <div
            class="aspect-square rounded-full flex justify-center items-center text-center text-white"
            style={`
                background-color: ${color};
                width: ${baseSize * scaleFactor}px;
                height: ${baseSize * scaleFactor}px;
                margin-left: ${-(baseSize * scaleFactor) / 2}px;
                margin-top: ${-(baseSize * scaleFactor) / 2}px;
            `}
        >
            {#if kind === "catch"}
                <p
                    style={`font-size: ${35 * scaleFactor}px; margin-top: ${-6 * scaleFactor}px;`}
                >
                    Fangen
                </p>
            {:else if kind === "event"}
                <p style={`font-size: ${23 * scaleFactor}px;`}>
                    Ziehe eine Ereignis- karte
                </p>
            {/if}
        </div>
    {/if}
</div>
