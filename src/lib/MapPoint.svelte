<script lang="ts">
    let {
        x,
        y,
        kind,
        city_name,
        children,
        color = "#bb2222",
    }: {
        x: number;
        y: number;
        kind: "catch" | "event" | "city";
        city_name?: string;
        children?: any;
        color?: string;
    } = $props();
</script>

<div class="absolute pointer-events-auto" style={`left: ${x}px; top: ${y}px;`}>
    {#if kind === "city"}
        <div
            class="flex flex-col justify-center items-center bg-white border-black border-2 rounded-sm"
        >
            <div class="bg-black text-white font-bold p-0.5 pl-2 pr-2">
                <p>{city_name}</p>
            </div>
            <div class="p-1">
                <p>
                    {#if children}{@render children()}{/if}
                </p>
            </div>
        </div>
    {:else}
        <div
            class="w-18 h-18 p-2.5 rounded-full flex justify-center items-center text-center"
            style={`background-color: ${color};`}
        >
            {#if kind === "catch"}
                <p class="text-[20px] -mt-1.5">Fangen</p>
            {:else if kind === "event"}
                <p class="text-[11px] text-wrap">Ziehe eine Ereignis- karte</p>
            {/if}
        </div>
    {/if}
</div>
