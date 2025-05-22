<script lang="ts">
    let {
        x = 0,
        y = 0,
        kind = "event",
        city_name = undefined,
        city_text = undefined,
    } = $props();

    
</script>

<div class="absolute" style={`left: ${x}px; top: ${y}px;`}>
    {#if kind === "city"}
        <div class="flex flex-col justify-center items-center bg-white border-black border-2 rounded-sm">
            <div class="bg-black text-white font-bold p-0.5 pl-2 pr-2">
                <p>{city_name}</p>
            </div>
            <div class="p-1">
                <slot />
            </div>
        </div>
    {:else}
        <div
            class="w-18 h-18 p-2.5 rounded-full flex justify-center items-center text-center bg-red-500"
        >
            {#if kind === "catch"}
                <p class="text-[20px] -mt-1.5">Fangen</p>
            {:else if kind === "event"}
                <p class="text-[11px] text-wrap">Ziehe eine Ereignis- karte</p>
            {/if}
        </div>
    {/if}
</div>